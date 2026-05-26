from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id", ondelete="SET NULL"), nullable=True)
    home_team_id = Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    away_team_id = Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    match_date = Column(DateTime, nullable=True)
    video_url = Column(String, nullable=True)
    audio_url = Column(String, nullable=True)
    status = Column(String, default="scheduled")  # scheduled, in_progress, completed, analyzing
    home_score = Column(Integer, default=0)
    away_score = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    tournament = relationship("Tournament", back_populates="matches")
    home_team = relationship("Team", foreign_keys=[home_team_id])
    away_team = relationship("Team", foreign_keys=[away_team_id])
    events = relationship("Event", back_populates="match", cascade="all, delete-orphan")
