<<<<<<< HEAD
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
=======
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Team(Base):
    __tablename__ = "teams"

    team_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    coach = Column(String, nullable=True)
    club_name = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)

    division = Column(String, nullable=True)
    category = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    city = Column(String, nullable=True)
    home_venue = Column(String, nullable=True)
    founded_year = Column(String, nullable=True)
    roster_limit = Column(Integer, default=15)
    status = Column(String, default="Active")
    notes = Column(Text, nullable=True)

    tournament_id = Column(
        Integer,
        ForeignKey("tournaments.tournament_id", ondelete="CASCADE"),
        nullable=False
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    tournament = relationship("Tournament", back_populates="teams")
    players = relationship(
        "Player",
        back_populates="team",
        cascade="all, delete-orphan"
    )
    home_matches = relationship(
        "Match",
        foreign_keys="Match.home_team_id",
        back_populates="home_team"
    )
    away_matches = relationship(
        "Match",
        foreign_keys="Match.away_team_id",
        back_populates="away_team"
    )
>>>>>>> dev
