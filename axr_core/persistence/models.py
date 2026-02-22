from sqlalchemy import Column, String, Enum, Float, Integer, ForeignKey, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base
from datetime import datetime

import uuid

Base = declarative_base()

class ProceedDB(Base):
    __tablename__ = "processes"
    
    pid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    state = Column(String, nullable= False)
    intent = Column(String)
    budget_limit = Column(Float)
    
class StepDB(Base):
    __tablename__ = "steps"
    
    step_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pid = Column(UUID(as_uuid=True), ForeignKey("processes.pid"))
    syscall = Column(String)
    status = Column(String)
    retries = Column(Integer, default=0)
    
class EventDB(Base):
    __tablename__ = "events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pid = Column(UUID(as_uuid=True))
    step_id = Column(UUID(as_uuid=True), nullable=True)
    event_type = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    meta_data = Column(JSON)