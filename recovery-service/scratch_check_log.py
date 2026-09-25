from app.database import SessionLocal
from app.models import ExecutionLog

db = SessionLocal()
logs = db.query(ExecutionLog).filter(ExecutionLog.engine == "fragment_analysis").all()
for log in logs:
    print(f"Log ID: {log.id}, Status: {log.status}, Duration: {log.duration_ms}ms, Result: {log.result}")
db.close()
