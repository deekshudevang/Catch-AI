import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "recovery-service"))

from app.database import SessionLocal
from app.models import RecoveryJob
from engines.fragment_analysis import CATCHFragmentAnalysis

db = SessionLocal()
job = db.query(RecoveryJob).order_by(RecoveryJob.created_at.desc()).first()
if not job:
    print("No jobs found")
    sys.exit(1)

job_id = job.id
print(f"Using job {job_id}")

engine = CATCHFragmentAnalysis()
res = engine.execute(image="dummy.dd", job_id=job_id)
print(res)
