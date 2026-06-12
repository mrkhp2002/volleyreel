from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from app.database import Base

class Tournament(Base):
    __tablename__ = "tournaments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    division = Column(String, default="Premier Division")  
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)