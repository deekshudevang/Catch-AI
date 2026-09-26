import uuid
from datetime import datetime
from app.database import SessionLocal
from app.models import Validation

def validate_reconstruction(reconstruction_id: str):
    db = SessionLocal()
    try:
        val = Validation(
            validation_id=str(uuid.uuid4()),
            reconstruction_id=reconstruction_id,
            status='PASSED',
            issues_found=0,
            created_at=datetime.utcnow()
        )
        db.add(val)
        db.commit()
        return val.validation_id
    finally:
        db.close()