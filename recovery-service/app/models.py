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
