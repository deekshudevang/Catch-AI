from sqlalchemy import Column, Integer, String, JSON, DateTime, Float, ForeignKey
from datetime import datetime
from app.database import Base

class Case(Base):
    __tablename__ = "cases"
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String, unique=True, index=True)
    name = Column(String)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="active")

class RecoveryJob(Base):
    __tablename__ = "recovery_jobs"
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(String, unique=True, index=True)
    case_id = Column(String, nullable=True, index=True)
    evidence_id = Column(String, nullable=True, index=True)
    status = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    duration_ms = Column(Integer, nullable=True)
    error = Column(String, nullable=True)

class ToolExecution(Base):
    __tablename__ = "tool_executions"
    id = Column(Integer, primary_key=True, index=True)
    execution_id = Column(String, unique=True, index=True)
    job_id = Column(String, index=True)
    tool_name = Column(String)
    status = Column(String)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    logs = Column(String, nullable=True)

class Artifact(Base):
    __tablename__ = "artifacts"
    id = Column(Integer, primary_key=True, index=True)
    artifact_id = Column(String, unique=True, index=True)
    recovery_job_id = Column(String, index=True)
    case_id = Column(String, nullable=True)
    evidence_id = Column(String, nullable=True)
    filename = Column(String)
    path = Column(String)
    size = Column(Integer)
    mime_type = Column(String)
    sha256 = Column(String)
    source_engine = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    validation_status = Column(String, nullable=True)
    reconstruction_id = Column(String, nullable=True)
    provenance = Column(String, default="UNKNOWN")

class Fragment(Base):
    __tablename__ = 'fragments'
    id = Column(Integer, primary_key=True, index=True)
    fragment_id = Column(String, unique=True, index=True)
    case_id = Column(String, nullable=True)
    job_id = Column(String, index=True)
    evidence_id = Column(String, nullable=True)
    source_engine = Column(String)
    source_artifact = Column(String, nullable=True)
    source_path = Column(String, nullable=True)
    source_offset = Column(Integer, nullable=True)
    source_length = Column(Integer, nullable=True)
    file_offset = Column(Integer, nullable=True)
    fragment_size = Column(Integer, nullable=True)
    fragment_type = Column(String, nullable=True)
    mime_type = Column(String, nullable=True)
    sha256 = Column(String, nullable=True)
    entropy = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String)

class FragmentRelationship(Base):
    __tablename__ = "fragment_relationships"
    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(String, index=True)
    target_id = Column(String, index=True)
    score = Column(Float, nullable=True)
    relationship_type = Column(String)
    evidence = Column(String)
    method = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Reconstruction(Base):
    __tablename__ = "reconstructions"
    id = Column(Integer, primary_key=True, index=True)
    reconstruction_id = Column(String, unique=True, index=True)
    job_id = Column(String, index=True)
    status = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    result_path = Column(String, nullable=True)

class Validation(Base):
    __tablename__ = "validations"
    id = Column(Integer, primary_key=True, index=True)
    validation_id = Column(String, unique=True, index=True)
    reconstruction_id = Column(String, index=True)
    status = Column(String)
    issues_found = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class TimelineEvent(Base):
    __tablename__ = "timeline_events"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String, unique=True, index=True)
    case_id = Column(String, index=True)
    timestamp = Column(DateTime)
    description = Column(String)
    source = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class ExecutionLog(Base):
    __tablename__ = "execution_logs"
    id = Column(Integer, primary_key=True, index=True)
    execution_id = Column(String, unique=True, index=True)
    engine = Column(String, index=True)
    repository = Column(String, nullable=True)
    operation = Column(String, nullable=True)
    input_reference = Column(String, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    status = Column(String)
    error = Column(String, nullable=True)
    duration_ms = Column(Integer, nullable=True)
    result = Column(JSON, nullable=True)
    logs = Column(String, nullable=True)
    version = Column(String, nullable=True)
    output_reference = Column(String, nullable=True)
    exit_code = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

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
