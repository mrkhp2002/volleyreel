from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class Player(Base):

    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    player_name = Column(String)
    jersey_number = Column(Integer)

    team_id = Column(Integer, ForeignKey("teams.id"))