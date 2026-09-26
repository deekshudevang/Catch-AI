import os
import uuid
import hashlib
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.database import engine as db_engine, Base, get_db
from app.models import ExecutionLog, RecoveryJob, Artifact
from fastapi.responses import FileResponse, StreamingResponse
import io
import zipfile
import base64
import pathlib
from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime

from app.services.pipeline_service import run_deterministic_pipeline
from app.services.orchestrator import orchestrator_service

Base.metadata.create_all(bind=db_engine)

app = FastAPI(title="CATCH-AI Orchestrator", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class RecoverRequest(BaseModel):
    image_path: Optional[str] = None
    imagePath: Optional[str] = None

    @property
    def get_image_path(self):
        return self.imagePath or self.image_path

def calculate_sha256(filepath):
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

@app.get("/api/health")
def health():
    return {"status": "OK", "engines": {"catch-ai": "OK"}}

@app.get("/api/recover/jobs")
def get_jobs(db: Session = Depends(get_db)):
    jobs = db.query(RecoveryJob).all()
    job_list = []
    for job in jobs:
        artifacts_count = db.query(Artifact).filter(Artifact.recovery_job_id == job.job_id).count()
        job_list.append({
            "id": job.job_id,
            "job_id": job.job_id,
            "evidence": job.evidence_id,
            "status": job.status,
            "created_at": job.created_at.isoformat() + "Z" if job.created_at else None,
            "started_at": job.started_at.isoformat() + "Z" if job.started_at else None,
            "completed_at": job.completed_at.isoformat() + "Z" if job.completed_at else None,
            "duration": f"{job.duration_ms}ms" if job.duration_ms else "0ms",
            "artifacts": artifacts_count
        })
    return {"jobs": job_list}

@app.post("/api/recover/scan")
def recover_scan(req: RecoverRequest, db: Session = Depends(get_db)):
    img_path = req.get_image_path
    if not img_path:
        raise HTTPException(status_code=400, detail="imagePath is required")

    repo_root = os.environ.get("REPO_ROOT", os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
    local_path = os.path.join(repo_root, img_path)
    if os.path.exists(local_path):
        img_path = local_path
    elif not os.path.exists(img_path):
        raise HTTPException(status_code=400, detail=f"Evidence file not found: {img_path}")

    job_id = str(uuid.uuid4())
    started = datetime.utcnow()

    new_job = RecoveryJob(
        job_id=job_id,
        evidence_id=img_path,
        status="RUNNING",
        created_at=started,
        started_at=started
    )
    db.add(new_job)
    db.commit()

    # 1. ENGINE 1 - PyTSK3
    engine1_result = orchestrator_service.trigger_engine("filesystem", img_path)
    if engine1_result.get("status") == "SUCCESS" and engine1_result.get("result"):
        fs_files = engine1_result["result"].get("files", [])
        for f in fs_files:
            f_path = f.get("path")
            if f_path:
                artifact = Artifact(
                    artifact_id=str(uuid.uuid4()),
                    recovery_job_id=job_id,
                    filename=f.get("name", os.path.basename(f_path)),
                    path=f_path,
                    size=f.get("size", 0),
                    mime_type="application/octet-stream",
                    sha256="",
                    source_engine="catch-filesystem",
                    created_at=datetime.utcnow()
                )
                db.add(artifact)

    # 2. ENGINE 2 - PhotoRec
    engine2_result = orchestrator_service.trigger_engine("carving", img_path)
    if engine2_result.get("status") == "SUCCESS" and engine2_result.get("result"):
        carved_files = engine2_result["result"].get("files", [])
        for f in carved_files:
            f_path = f.get("path")
            if f_path:
                artifact = Artifact(
                    artifact_id=str(uuid.uuid4()),
                    recovery_job_id=job_id,
                    filename=f.get("name", os.path.basename(f_path)),
                    path=f_path,
                    size=f.get("size", 0),
                    mime_type="application/octet-stream",
                    sha256="",
                    source_engine="catch-carving",
                    created_at=datetime.utcnow()
                )
                db.add(artifact)

    # 3. ENGINE 3 - Deep-Recover
    engine3_result = orchestrator_service.trigger_engine("deep_recovery", img_path)
    if engine3_result.get("status") == "SUCCESS" and engine3_result.get("result"):
        deep_files = engine3_result["result"].get("files", [])
        for f in deep_files:
            f_path = f.get("path")
            if f_path:
                artifact = Artifact(
                    artifact_id=str(uuid.uuid4()),
                    recovery_job_id=job_id,
                    filename=f.get("name", os.path.basename(f_path)),
                    path=f_path,
                    size=f.get("size", 0),
                    mime_type="application/octet-stream",
                    sha256="",
                    source_engine="deep-recover",
                    created_at=datetime.utcnow()
                )
                db.add(artifact)

    db.commit()

    # 4. ENGINE 4 - Fragment Analysis
    # We will trigger the engine just to log it
    engine4_result = orchestrator_service.trigger_engine("fragment_analysis", img_path, job_id=job_id)


    completed = datetime.utcnow()
    duration = int((completed - started).total_seconds() * 1000)

    new_job.status = "COMPLETED"
    new_job.completed_at = completed
    new_job.duration_ms = duration
    db.commit()

    artifacts_count = db.query(Artifact).filter(Artifact.recovery_job_id == job_id).count()

    return {
        "success": True,
        "job_id": job_id,
        "jobId": job_id,
        "status": "COMPLETED",
        "total_files_found": artifacts_count
    }

@app.post("/api/recover/upload")
async def recover_upload(file: UploadFile = File(...), db: Session = Depends(get_db)):
    repo_root = os.environ.get("REPO_ROOT", os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
    evidence_dir = os.path.join(repo_root, "evidence")
    os.makedirs(evidence_dir, exist_ok=True)
    
    file_location = os.path.join(evidence_dir, file.filename)
    with open(file_location, "wb+") as f:
        f.write(await file.read())
        
    req = RecoverRequest(image_path=file_location)
    return recover_scan(req, db)


@app.get("/api/recoveries/{recovery_id}/artifacts")
def get_recovery_artifacts(recovery_id: str, db: Session = Depends(get_db)):
    artifacts = db.query(Artifact).filter(Artifact.recovery_job_id == recovery_id).all()
    res = []
    for a in artifacts:
        res.append({
            "artifact_id": a.artifact_id,
            "filename": a.filename,
            "type": a.mime_type,
            "size": a.size,
            "sha256": a.sha256,
            "source_engine": a.source_engine,
            "recovery_job_id": a.recovery_job_id,
            "validation_status": a.validation_status,
            "reconstruction_id": a.reconstruction_id
        })
    return res

@app.get("/api/artifacts/{artifact_id}")
def get_artifact(artifact_id: str, db: Session = Depends(get_db)):
    a = db.query(Artifact).filter(Artifact.artifact_id == artifact_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Artifact not found")
    return {
        "artifact_id": a.artifact_id,
        "filename": a.filename,
        "type": a.mime_type,
        "size": a.size,
        "sha256": a.sha256,
        "source_engine": a.source_engine,
        "recovery_job_id": a.recovery_job_id,
        "validation_status": a.validation_status,
        "reconstruction_id": a.reconstruction_id
    }

@app.get("/api/artifacts/{artifact_id}/download")
def download_artifact(artifact_id: str, db: Session = Depends(get_db)):
    a = db.query(Artifact).filter(Artifact.artifact_id == artifact_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Artifact not found")

    target_path = pathlib.Path(a.path).resolve()
    repo_root = pathlib.Path(os.environ.get("REPO_ROOT", os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))).resolve()

    # Path traversal check
    if repo_root not in target_path.parents and target_path != repo_root:
        raise HTTPException(status_code=403, detail="Path traversal detected or access denied")

    if not target_path.exists() or not target_path.is_file():
        raise HTTPException(status_code=404, detail="Artifact file not found on disk")

    return FileResponse(
        path=target_path,
        filename=a.filename
    )

@app.get("/api/recoveries/{recovery_id}")
def get_recovery_job_compat(recovery_id: str, db: Session = Depends(get_db)):
    job = db.query(RecoveryJob).filter(RecoveryJob.job_id == recovery_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Not found")

    artifacts_count = db.query(Artifact).filter(Artifact.recovery_job_id == recovery_id).count()

    return {
        "id": job.job_id,
        "evidence_id": job.evidence_id,
        "case_id": job.case_id,
        "status": job.status,
        "started_at": job.started_at.isoformat() + "Z" if job.started_at else None,
        "completed_at": job.completed_at.isoformat() + "Z" if job.completed_at else None,
        "duration_ms": job.duration_ms,
        "files_found": artifacts_count,
        "deleted_files": 0,
        "recoverable": artifacts_count,
        "recovered": artifacts_count,
        "partial": 0,
        "fragments": 0,
        "reconstructions": 0,
        "validation_failures": 0
    }


# --- Phase 11 Routes ---
from app.services.sentinel import run_sentinel_background
from app.services.salvage_engine import start_salvage
from app.services.ai_repair import trigger_ai_repair
from app.services.secure_delivery import deliver_artifact
from app.models import MonitoredDirectory, RecoveryCandidate, AIRestorationJob, AuditEvent
from pydantic import BaseModel

class SentinelStartReq(BaseModel):
    directory: str

@app.post('/api/v1/sentinel/start')
def sentinel_start(req: SentinelStartReq, db: Session = Depends(get_db)):
    run_sentinel_background(req.directory)
    return {'status': 'monitoring', 'directory': req.directory}

@app.get('/api/v1/sentinel/status')
def sentinel_status(db: Session = Depends(get_db)):
    dirs = db.query(MonitoredDirectory).all()
    return {'directories': [{'path': d.path, 'status': d.status} for d in dirs]}

class SalvageReq(BaseModel):
    candidate_id: str

@app.post('/api/v1/recovery/salvage')
def recovery_salvage(req: SalvageReq):
    attempt_id = start_salvage(req.candidate_id)
    return {'attempt_id': attempt_id, 'status': 'started'}

@app.get('/api/v1/recovery/candidates')
def get_candidates(db: Session = Depends(get_db)):
    cands = db.query(RecoveryCandidate).all()
    return {'candidates': [{'id': c.candidate_id, 'path': c.path, 'status': c.status} for c in cands]}

class AIRepairReq(BaseModel):
    artifact_id: str

@app.post('/api/v1/ai/repair')
def ai_repair_start(req: AIRepairReq):
    res = trigger_ai_repair(req.artifact_id)
    return res

@app.get('/api/v1/ai/jobs')
def ai_jobs(db: Session = Depends(get_db)):
    jobs = db.query(AIRestorationJob).all()
    return {'jobs': [{'id': j.job_id, 'status': j.status} for j in jobs]}

class DeliveryReq(BaseModel):
    artifact_id: str
    destination: str

@app.post('/api/v1/delivery/transfer')
def delivery_transfer(req: DeliveryReq):
    op = deliver_artifact(req.artifact_id, req.destination)
    return {'operation_id': op, 'status': 'started'}

@app.get('/api/v1/audit/logs')
def audit_logs(db: Session = Depends(get_db)):
    logs = db.query(AuditEvent).order_by(AuditEvent.created_at.desc()).limit(100).all()
    return {'logs': [{'id': l.event_id, 'op': l.operation, 'details': l.details} for l in logs]}

class FetchRequest(BaseModel):
    source: Optional[str] = "DIRECTORY"
    directory: str

@app.get("/api/system/privileges")
def system_privileges():
    import ctypes
    import psutil
    try:
        is_admin = ctypes.windll.shell32.IsUserAnAdmin() != 0
    except Exception:
        is_admin = False
    
    # Also check if we are running as a service
    service_status = "OFFLINE"
    try:
        import win32serviceutil
        import win32service
        status = win32serviceutil.QueryServiceStatus("CatchAIRecoveryService")
        if status[1] == win32service.SERVICE_RUNNING:
            service_status = "ONLINE"
    except Exception:
        pass

    return {
        "service": "CatchAIRecoveryService",
        "status": service_status if is_admin else "OFFLINE", # Since the request comes here, if we are admin, we're likely the service, but let's just report ONLINE if the windows service is running or if we are elevated. Actually let's report what's requested
        "platform": "Windows",
        "is_admin": is_admin,
        "raw_ntfs_access": "AVAILABLE" if is_admin else "DENIED"
    }

@app.get("/api/system/service")
def system_service():
    installed = False
    running = False
    startup = "UNKNOWN"
    privileged = False
    
    import ctypes
    try:
        privileged = ctypes.windll.shell32.IsUserAnAdmin() != 0
    except Exception:
        pass
        
    try:
        import win32serviceutil
        import win32service
        import win32con
        import win32api
        
        # Check status
        status = win32serviceutil.QueryServiceStatus("CatchAIRecoveryService")
        installed = True
        if status[1] == win32service.SERVICE_RUNNING:
            running = True
            
        # Get startup type
        hscm = win32service.OpenSCManager(None, None, win32service.SC_MANAGER_CONNECT)
        try:
            hs = win32service.OpenService(hscm, "CatchAIRecoveryService", win32service.SERVICE_QUERY_CONFIG)
            try:
                config = win32service.QueryServiceConfig(hs)
                if config[1] == win32service.SERVICE_AUTO_START:
                    startup = "AUTO"
                elif config[1] == win32service.SERVICE_DEMAND_START:
                    startup = "MANUAL"
            finally:
                win32service.CloseServiceHandle(hs)
        finally:
            win32service.CloseServiceHandle(hscm)
    except Exception as e:
        installed = False

    return {
        "installed": installed,
        "running": running,
        "startup": startup,
        "privileged": privileged
    }


@app.post("/api/recover/fetch")
def recover_fetch(req: FetchRequest, db: Session = Depends(get_db)):
    import sys
    import ctypes
    
    root = os.path.abspath(r"C:\Users\deeks\OneDrive\Desktop\Catch-AI-repo")
    target = os.path.abspath(req.directory)
    if not target.startswith(root):
        raise HTTPException(status_code=403, detail="Path outside allowed root.")
    
    try:
        is_admin = ctypes.windll.shell32.IsUserAnAdmin() != 0
    except Exception:
        is_admin = False

    if not is_admin:
        return {"status": "PRIVILEGE_REQUIRED", "message": "Administrator privileges and raw NTFS access are required to scan for deleted files on Windows.", "candidates": []}

    drive = os.path.splitdrive(target)[0]
    if not drive:
        drive = "C:"
    volume_path = f"\\\\.\\{drive}"

    try:
        target_inode = os.stat(target).st_ino & 0xFFFFFFFFFFFF
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not stat directory: {e}")

    parser_path = os.path.join(root, "forensic-engines", "catch-filesystem", "src")
    if parser_path not in sys.path:
        sys.path.append(parser_path)
    
    try:
        from ntfs_parser import NTFSParser
    except ImportError:
        return {"status": "ERROR", "message": "NTFS parser module could not be loaded.", "candidates": []}

    parser = NTFSParser(volume_path)
    if not parser.initialize():
        return {"status": "ERROR", "message": f"Could not initialize NTFS parser for {volume_path}", "candidates": []}
        
    candidates = parser.find_deleted_in_mft(target_inode=target_inode)
    parser.close()
    
    results = []
    for c in candidates:
        cand_id = str(uuid.uuid4())
        fake_path = os.path.join(target, c['name'])
        rc = RecoveryCandidate(
            candidate_id=cand_id,
            path=fake_path,
            filename=c['name'],
            size=c['size'],
            status="DETECTED",
            source="fetch_ntfs",
            event_type="DELETED"
        )
        db.add(rc)
        results.append({
            "candidate_id": cand_id,
            "name": c['name'],
            "size": c['size'],
            "status": "DETECTED"
        })
    db.commit()
    
    return {
        "status": "SUCCESS", 
        "message": f"Found {len(results)} deleted files in {target}", 
        "candidates": results
    }

class MonitorRequest(BaseModel):
    directory: str

@app.post("/api/recover/monitor")
def recover_monitor(req: MonitorRequest, db: Session = Depends(get_db)):
    run_sentinel_background(req.directory)
    return {"status": "monitoring", "directory": req.directory}

from fastapi.staticfiles import StaticFiles
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")


