import uuid
from datetime import datetime
from app.database import SessionLocal
from app.models import DeliveryOperation

def deliver_artifact(artifact_id: str, dest_path: str):
    db = SessionLocal()
    try:
        delivery = DeliveryOperation(
            operation_id=str(uuid.uuid4()),
            artifact_id=artifact_id,
            destination_path=dest_path,
            status='DELIVERED',
            created_at=datetime.utcnow()
        )
        db.add(delivery)
        db.commit()
        return delivery.operation_id
    finally:
        db.close()