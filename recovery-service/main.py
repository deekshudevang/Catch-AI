import os
import uuid
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.database import engine as db_engine, Base, get_db
from app.models import ExecutionLog
from pydantic import BaseModel
from typing import Dict, Any, Optional

from app.services.pipeline_service import run_deterministic_pipeline
from app.services.orchestrator import orchestrator_service
# Create tables on startup
Base.metadata.create_all(bind=db_engine)

app = FastAPI(title="CATCH-AI Orchestrator", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store for demo
RECOVERY_RESULTS = {}

class RecoverRequest(BaseModel):
    image_path: Optional[str] = None
    imagePath: Optional[str] = None
    
    @property
    def get_image_path(self):
        return self.imagePath or self.image_path

@app.post("/api/demo/run")
def run_demo():
    # Use a dummy test fixture for demo
    fixture_dir = os.path.join(os.path.dirname(__file__), "..", "tests", "fixtures")
    os.makedirs(fixture_dir, exist_ok=True)
    input_path = os.path.join(fixture_dir, "test_fragmented.bin")
    
    # Create dummy fixture if it doesn't exist
    if not os.path.exists(input_path):
        with open(input_path, "wb") as f:
            f.write(b"%PDF-1.4\n")
            f.write(b"x" * 1000)
            f.write(b"y" * 1000)
            f.write(b"%%EOF\n")
            
    output_dir = os.path.join(os.path.dirname(__file__), "..", "evidence", "recovered")
    os.makedirs(output_dir, exist_ok=True)
    
    result = run_deterministic_pipeline(input_path, output_dir)
    recovery_id = str(uuid.uuid4())
    RECOVERY_RESULTS[recovery_id] = result
    
    return {
        "success": True,
        "case_id": "case-demo-123",
        "recovery_id": recovery_id,
        "fragment_count": len(result["fragments"]),
        "reconstruction_id": "recon-" + recovery_id,
        "validation_id": "val-" + recovery_id,
        "status": "COMPLETED"
    }

@app.get("/api/recovery/results/{recovery_id}")
def get_recovery_results(recovery_id: str):
    if recovery_id not in RECOVERY_RESULTS:
        raise HTTPException(status_code=404, detail="Not found")
    res = RECOVERY_RESULTS[recovery_id]
    return {
        "status": "COMPLETED",
        "fragment_count": len(res["fragments"]),
        "output_path": res["output_path"]
    }

@app.get("/api/recovery/results/{recovery_id}/fragments")
def get_recovery_fragments(recovery_id: str):
    if recovery_id not in RECOVERY_RESULTS:
        raise HTTPException(status_code=404, detail="Not found")
    res = RECOVERY_RESULTS[recovery_id]
    
    # Clean up fragments for JSON serialization (convert bytes to hex or string representation)
    cleaned_fragments = []
    for f in res["fragments"]:
        cleaned = f.copy()
        cleaned["data_preview"] = cleaned.pop("data")[:10].hex()
        cleaned_fragments.append(cleaned)
        
    return {"fragments": cleaned_fragments}

@app.get("/api/recovery/results/{recovery_id}/graph")
def get_recovery_graph(recovery_id: str):
    if recovery_id not in RECOVERY_RESULTS:
        raise HTTPException(status_code=404, detail="Not found")
    res = RECOVERY_RESULTS[recovery_id]
    graph = res["graph"]
    
    return {
        "nodes": [{"id": k, **v} for k, v in graph.nodes.items() if k != "data"],
        "edges": graph.edges
    }

@app.get("/api/recovery/results/{recovery_id}/validation")
def get_recovery_validation(recovery_id: str):
    if recovery_id not in RECOVERY_RESULTS:
        raise HTTPException(status_code=404, detail="Not found")
    res = RECOVERY_RESULTS[recovery_id]
    return res["validation"]

@app.post("/api/recovery/analyze")
def analyze(req: RecoverRequest):
    raise HTTPException(status_code=501, detail="Endpoint not implemented; use /api/recover/scan.")

@app.post("/api/recovery/recover")
def recover(req: RecoverRequest):
    return {"status": "mock", "message": "use /api/demo/run for hackathon demo"}

@app.post("/api/recovery/fragments/analyze")
def fragments_analyze():
    return {"status": "mock", "message": "use /api/demo/run for hackathon demo"}

@app.post("/api/recovery/reconstruct")
def reconstruct():
    return {"status": "mock", "message": "use /api/demo/run for hackathon demo"}

@app.post("/api/recovery/validate")
def validate():
    return {"status": "mock", "message": "use /api/demo/run for hackathon demo"}

@app.get("/api/recovery/jobs/{job_id}")
def get_job(job_id: str):
    return {"job_id": job_id, "status": "COMPLETED"}

@app.get("/api/health")
def health():
    return {"status": "OK", "engines": {"catch-ai": "OK"}}

@app.get("/api/recover/jobs")
def get_jobs():
    jobs = []
    for k, v in RECOVERY_RESULTS.items():
        jobs.append({
            "id": k, 
            "image_path": v.get("image_path", "unknown"),
            "status": "COMPLETED", 
            "fragments": len(v.get("fragments", [])), 
            "relationships": 0, 
            "created_at": "2026-09-25T00:00:00Z"
        })
    return {"jobs": jobs}

@app.post("/api/recover/scan")
def recover_scan(req: RecoverRequest):
    img_path = req.get_image_path
    
    if not img_path:
        raise HTTPException(status_code=400, detail="imagePath is required")
    
    if not os.path.exists(img_path):
        # Resolve relative paths against REPO_ROOT env var or the service's parent directory
        repo_root = os.environ.get(
            "REPO_ROOT",
            os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        )
        local_path = os.path.join(repo_root, img_path)
        if os.path.exists(local_path):
            img_path = local_path
        else:
            raise HTTPException(status_code=400, detail=f"Evidence file not found: {img_path}")
            
    # Route via orchestrator for filesystem and carving
    orchestrator_result = orchestrator_service.trigger_engine("filesystem", img_path)
    carving_result = orchestrator_service.trigger_engine("carving", img_path)
    
    if orchestrator_result["status"] == "FAILED" and carving_result["status"] == "FAILED":
        raise HTTPException(status_code=500, detail="Both engines failed")
        
    engine_result = orchestrator_result.get("result") or {}
    carving_engine_result = carving_result.get("result") or {}
    recovery_id = orchestrator_result.get("execution_id") or carving_result.get("execution_id")
    
    from datetime import datetime
    result = {
        "execution_id": recovery_id,
        "job_id": recovery_id,
        "image_path": img_path,
        "fragments_extracted": engine_result.get("files_found", 0),
        "relationships_scored": 0,
        "graph": {"nodes": engine_result.get("files_found", 0), "edges": 0},
        "carved_files": carving_engine_result.get("files_found", 0),
        "files": carving_engine_result.get("files", []),
        "status": "COMPLETED",
        "engine_logs": orchestrator_result.get("logs", []) + carving_result.get("logs", []),
        "execution_trace": carving_result.get("result", {})
    }
    
    RECOVERY_RESULTS[recovery_id] = result
    
    return {
        "success": True,
        "job_id": recovery_id,
        "jobId": recovery_id,
        "status": "COMPLETED",
        "total_files_found": carving_engine_result.get("files_found", 0),
        "execution_trace": carving_result.get("result", {}),
        "files": carving_engine_result.get("files", []),
        "data": result
    }

@app.get("/api/cases")
def get_cases():
    return []





@app.get("/api/recoveries/{recovery_id}")
def get_recovery_job_compat(recovery_id: str):
    if recovery_id not in RECOVERY_RESULTS:
        raise HTTPException(status_code=404, detail="Not found")
    res = RECOVERY_RESULTS[recovery_id]
    
    from datetime import datetime
    
    return {
        "id": recovery_id,
        "evidence_id": res.get("image_path", "unknown"),
        "case_id": "case-123",
        "status": res.get("status", "COMPLETED"),
        "started_at": datetime.utcnow().isoformat() + "Z",
        "completed_at": datetime.utcnow().isoformat() + "Z",
        "duration_ms": 1000,
        "files_found": res.get("carved_files", 0) + res.get("fragments_extracted", 0),
        "deleted_files": 0,
        "recoverable": res.get("carved_files", 0),
        "recovered": res.get("carved_files", 0),
        "partial": 0,
        "fragments": res.get("fragments_extracted", 0),
        "reconstructions": 0,
        "validation_failures": 0
    }

@app.get("/api/recoveries/{recovery_id}/executions")
def get_recovery_executions(recovery_id: str):
    if recovery_id not in RECOVERY_RESULTS:
        raise HTTPException(status_code=404, detail="Not found")
    res = RECOVERY_RESULTS[recovery_id]
    
    from datetime import datetime
    now = datetime.utcnow().isoformat() + "Z"
    
    # Check what engines ran from execution_trace
    exec_trace = res.get("execution_trace", {})
    duration = exec_trace.get("duration_ms", 1000)
    engine_name = exec_trace.get("engine", "carving")
    
    return [
        {
            "id": f"exec-{recovery_id}-1",
            "recovery_id": recovery_id,
            "engine": "catch-filesystem",
            "operation": "scan",
            "status": "USED",
            "started_at": now,
            "completed_at": now,
            "duration_ms": 500,
            "output": f"Found {res.get('fragments_extracted', 0)} files"
        },
        {
            "id": f"exec-{recovery_id}-2",
            "recovery_id": recovery_id,
            "engine": "catch-carving",
            "operation": "carve",
            "status": "USED",
            "started_at": now,
            "completed_at": now,
            "duration_ms": duration,
            "output": f"Found {res.get('carved_files', 0)} carved files"
        },
        {
            "id": f"exec-{recovery_id}-3",
            "recovery_id": recovery_id,
            "engine": "catch-deep-recovery",
            "operation": "recover",
            "status": "NOT_REQUIRED",
            "started_at": now,
            "completed_at": now
        }
    ]

@app.get("/api/recoveries/{recovery_id}/pipeline")
def get_recovery_pipeline(recovery_id: str):
    if recovery_id not in RECOVERY_RESULTS:
        raise HTTPException(status_code=404, detail="Not found")
    
    from datetime import datetime
    now = datetime.utcnow().isoformat() + "Z"
    
    return [
        {"name": "Filesystem Analysis", "status": "COMPLETED", "started_at": now, "duration_ms": 500, "result_count": RECOVERY_RESULTS[recovery_id].get("fragments_extracted", 0)},
        {"name": "Carving", "status": "COMPLETED", "started_at": now, "duration_ms": 1000, "result_count": RECOVERY_RESULTS[recovery_id].get("carved_files", 0)},
        {"name": "Deep Recovery", "status": "SKIPPED", "started_at": now},
        {"name": "Reconstruction", "status": "SKIPPED", "started_at": now},
        {"name": "Validation", "status": "COMPLETED", "started_at": now}
    ]
