from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class Team(Base):
    __tablename__ = "teams"

    id = Column(String, primary_key=True, index=True) 
    name = Column(String, unique=True, nullable=False)
    coach = Column(String, nullable=True)
    club_name = Column(String, nullable=True)
    division = Column(String, default="Premier")
    category = Column(String, default="Men's Senior")
    city = Column(String, nullable=True)
    home_venue = Column(String, nullable=True)
    founded_year = Column(Integer, nullable=True)
    roster_limit = Column(Integer, default=15)
    status = Column(String, default="Active")  
    notes = Column(String, nullable=True)