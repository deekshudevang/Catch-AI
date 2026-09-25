import sys
import os

# Add recovery-service to path so we can import from app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'recovery-service')))

try:
    from app.database import SessionLocal, engine, Base
    from app.models import Case, RecoveryJob, ToolExecution, Artifact, Reconstruction, Validation, TimelineEvent, FragmentRelationship
    
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    # Check FragmentRelationship columns
    columns = [c.name for c in FragmentRelationship.__table__.columns]
    required_cols = ['source_id', 'target_id', 'score', 'relationship_type', 'evidence', 'method']
    for col in required_cols:
        if col not in columns:
            print(f"FAILED: FragmentRelationship missing column {col}")
            sys.exit(1)
            
    print("SUCCESS: All models imported and FragmentRelationship has required columns.")
    
    # Try a simple query
    db = SessionLocal()
    db.query(Case).first()
    db.query(RecoveryJob).first()
    db.query(ToolExecution).first()
    db.query(Artifact).first()
    db.query(Reconstruction).first()
    db.query(Validation).first()
    db.query(TimelineEvent).first()
    db.query(FragmentRelationship).first()
    print("SUCCESS: All queries executed.")
    db.close()
except Exception as e:
    print(f"FAILED: {e}")
    sys.exit(1)
