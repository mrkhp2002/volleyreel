from sqlalchemy import Column, Integer, String, Float, ForeignKey
from app.database import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(String, primary_key=True, index=True) 
    match_id = Column(String, ForeignKey("matches.id"), nullable=False)
    time = Column(String, nullable=False) 
    type = Column(String, nullable=False) 
    player = Column(String, nullable=True) 
    confidence = Column(String, default="90%")
    status = Column(String, default="Pending") 