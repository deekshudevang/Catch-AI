import sys
import os

# Add recovery-service to path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app.database import SessionLocal
from app.models import RecoveryJob, ExecutionLog
from main import recover_scan, RecoverRequest

class MockDB:
    pass

req = RecoverRequest(image_path="test-carving.img")
db = SessionLocal()
try:
    res = recover_scan(req, db)
    print("API returned:", res)
finally:
    db.close()

db = SessionLocal()
logs = db.query(ExecutionLog).filter(ExecutionLog.engine == "fragment_analysis").all()
if logs:
    log = logs[-1]
    print(f"Log ID: {log.id}, Status: {log.status}, Duration: {log.duration_ms}ms, Result: {log.result}")
db.close()
