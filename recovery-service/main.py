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
    image_path: str

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
    return {"status": "mock", "message": "use /api/demo/run for hackathon demo"}

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

