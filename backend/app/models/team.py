from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Team(Base):
    __tablename__ = "teams"

    team_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
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