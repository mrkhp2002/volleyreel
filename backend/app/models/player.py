from sqlalchemy import Column, Integer, String, Float, ForeignKey
from app.database import Base

class Player(Base):
    __tablename__ = "players"

    id = Column(String, primary_key=True, index=True) 
    name = Column(String, nullable=False)
    team_name = Column(String, ForeignKey("teams.name"), nullable=False)
    position = Column(String, nullable=False) 
    jersey_number = Column(String, nullable=True)
    contact_number = Column(String, nullable=True)
    status = Column(String, default="Active") 
    email = Column(String, nullable=True)
    date_of_birth = Column(String, nullable=True)
    gender = Column(String, default="Male")
    height = Column(Float, nullable=True) 
    weight = Column(Float, nullable=True) 
    address = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)