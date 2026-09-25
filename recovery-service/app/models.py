from sqlalchemy import Column, Integer, String, JSON, DateTime, Float
from datetime import datetime
from app.database import Base

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
    created_at = Column(DateTime, default=datetime.utcnow)
