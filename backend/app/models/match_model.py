from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class Match(Base):

    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)

    tournament_id = Column(Integer, ForeignKey("tournaments.id"))

    team1 = Column(String)
    team2 = Column(String)

    score = Column(String)
    status = Column(String)

    match_code = Column(String)