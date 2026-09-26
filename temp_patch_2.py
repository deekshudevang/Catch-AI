import sys

fpath = r'c:\Users\deeks\OneDrive\Desktop\Catch-AI-repo\recovery-service\app\models.py'
with open(fpath, 'r') as f:
    text = f.read()

new_models = '''
class MonitoredDirectory(Base):
    __tablename__ = 'monitored_directories'
    id = Column(Integer, primary_key=True, index=True)
    path = Column(String, unique=True, index=True)
    status = Column(String, default='active')
    created_at = Column(DateTime, default=datetime.utcnow)

class FileEvent(Base):
    __tablename__ = 'file_events'
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String, unique=True, index=True)
    path = Column(String, index=True)
    filename = Column(String)
    event_type = Column(String)
    source = Column(String)
    status = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class RecoveryCandidate(Base):
    __tablename__ = 'recovery_candidates'
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(String, unique=True, index=True)
    case_id = Column(String, nullable=True, index=True)
    path = Column(String)
    filename = Column(String)
    extension = Column(String, nullable=True)
    size = Column(Integer, nullable=True)
    detected_at = Column(DateTime, default=datetime.utcnow)
    event_type = Column(String)
    status = Column(String, default='DETECTED')
    source = Column(String)
    salvage_started_at = Column(DateTime, nullable=True)
    salvage_completed_at = Column(DateTime, nullable=True)
    artifact_id = Column(String, nullable=True)
    error = Column(String, nullable=True)
    metadata_json = Column(String, nullable=True)

class SalvageAttempt(Base):
    __tablename__ = 'salvage_attempts'
    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(String, unique=True, index=True)
    candidate_id = Column(String, index=True)
    source = Column(String)
    status = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    result_artifact_id = Column(String, nullable=True)

class DamageAnalysis(Base):
    __tablename__ = 'damage_analysis'
    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(String, unique=True, index=True)
    artifact_id = Column(String, index=True)
    status = Column(String)
    signature_valid = Column(String, nullable=True)
    header_valid = Column(String, nullable=True)
    footer_valid = Column(String, nullable=True)
    structural_integrity = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class AIRestorationJob(Base):
    __tablename__ = 'ai_restoration_jobs'
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(String, unique=True, index=True)
    artifact_id = Column(String, index=True)
    provider = Column(String)
    model = Column(String)
    status = Column(String, default='QUEUED')
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

class AIRestorationOutput(Base):
    __tablename__ = 'ai_restoration_outputs'
    id = Column(Integer, primary_key=True, index=True)
    output_id = Column(String, unique=True, index=True)
    job_id = Column(String, index=True)
    original_artifact_id = Column(String, index=True)
    derived_artifact_id = Column(String, index=True)
    provenance = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class DeliveryOperation(Base):
    __tablename__ = 'delivery_operations'
    id = Column(Integer, primary_key=True, index=True)
    operation_id = Column(String, unique=True, index=True)
    artifact_id = Column(String, index=True)
    destination_path = Column(String)
    backup_path = Column(String, nullable=True)
    status = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditEvent(Base):
    __tablename__ = 'audit_events'
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String, unique=True, index=True)
    operation = Column(String)
    details = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
'''

if 'class MonitoredDirectory' not in text:
    with open(fpath, 'a') as f:
        f.write('\n')
        f.write(new_models)
