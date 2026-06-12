from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class Match(Base):
    __tablename__ = "matches"

    id = Column(String, primary_key=True, index=True) 
    tournament = Column(String, nullable=False)
    teams = Column(String, nullable=False) 
    date = Column(String, nullable=True)
    upload = Column(String, default="Not Uploaded") 
    review = Column(String, default="Not Started") 
    video = Column(String, default="Not Generated") 
    venue = Column(String, nullable=True)
    stage = Column(String, default="Group Stage")
    notes = Column(String, nullable=True)
    duration = Column(String, default="1h 45m")