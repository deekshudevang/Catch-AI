import os
import uuid
import hashlib
from fastapi import FastAPI, Depends, HTTPException
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
            if f_path and os.path.isfile(f_path) and os.access(f_path, os.R_OK):
                artifact = Artifact(
                    artifact_id=str(uuid.uuid4()),
                    recovery_job_id=job_id,
                    filename=f.get("name", os.path.basename(f_path)),
                    path=f_path,
                    size=os.path.getsize(f_path),
                    mime_type="application/octet-stream",
                    sha256=calculate_sha256(f_path),
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
            if f_path and os.path.isfile(f_path) and os.access(f_path, os.R_OK):
                artifact = Artifact(
                    artifact_id=str(uuid.uuid4()),
                    recovery_job_id=job_id,
                    filename=f.get("name", os.path.basename(f_path)),
                    path=f_path,
                    size=os.path.getsize(f_path),
                    mime_type="application/octet-stream",
                    sha256=calculate_sha256(f_path),
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
            if f_path and os.path.isfile(f_path) and os.access(f_path, os.R_OK):
                artifact = Artifact(
                    artifact_id=str(uuid.uuid4()),
                    recovery_job_id=job_id,
                    filename=f.get("name", os.path.basename(f_path)),
                    path=f_path,
                    size=os.path.getsize(f_path),
                    mime_type="application/octet-stream",
                    sha256=calculate_sha256(f_path),
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
