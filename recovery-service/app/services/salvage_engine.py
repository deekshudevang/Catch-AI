import uuid
from datetime import datetime
from app.database import SessionLocal
from app.models import SalvageAttempt

def start_salvage(candidate_id: str):
    db = SessionLocal()
    try:
        attempt = SalvageAttempt(
            attempt_id=str(uuid.uuid4()),
            candidate_id=candidate_id,
            source='automatic',
            status='IN_PROGRESS',
            created_at=datetime.utcnow()
        )
        db.add(attempt)
        db.commit()
        return attempt.attempt_id
    finally:
        db.close()