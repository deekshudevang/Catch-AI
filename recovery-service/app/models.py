from sqlalchemy import Column, Integer, String, JSON, DateTime
from datetime import datetime
from app.database import Base

class ExecutionLog(Base):
    __tablename__ = "execution_logs"

    id = Column(Integer, primary_key=True, index=True)
    execution_id = Column(String, unique=True, index=True)
    engine = Column(String, index=True)
    status = Column(String)
    result = Column(JSON, nullable=True)
    logs = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
