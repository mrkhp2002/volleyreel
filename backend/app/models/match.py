<<<<<<< HEAD
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
=======
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base


class Match(Base):
    __tablename__ = "matches"

    match_id = Column(Integer, primary_key=True, index=True)

    # Two foreign keys both pointing to teams table
    home_team_id = Column(
        Integer,
        ForeignKey("teams.team_id", ondelete="SET NULL"),
        nullable=True
    )
    away_team_id = Column(
        Integer,
        ForeignKey("teams.team_id", ondelete="SET NULL"),
        nullable=True
    )

    # Scores entered manually by coach
    home_score = Column(Integer, default=0)
    away_score = Column(Integer, default=0)

    # S3 URL of uploaded match video
    # Your Whisper pipeline downloads and processes this
    video_url = Column(String, nullable=True)

    # Tracks where this match is in YOUR AI pipeline
    # "pending" → "processing" → "complete" → "failed"
    status = Column(String, default="pending")

    tournament_id = Column(
        Integer,
        ForeignKey("tournaments.tournament_id", ondelete="CASCADE"),
        nullable=False
    )

    # UUID for public shareable links
    public_id = Column(
        String,
        default=lambda: str(uuid.uuid4()),
        unique=True
    )

    # URL of generated highlight MP4 after FFmpeg processing
    highlight_url = Column(String, nullable=True)

    # Full Whisper transcript stored here
    # Your event detection code reads this
    transcript = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    tournament = relationship("Tournament", back_populates="matches")

    # Must specify foreign_keys because two columns point to Team
    home_team = relationship(
        "Team",
        foreign_keys=[home_team_id],
        back_populates="home_matches"
    )
    away_team = relationship(
        "Team",
        foreign_keys=[away_team_id],
        back_populates="away_matches"
    )

    # All events detected by your AI pipeline
    events = relationship(
        "Event",
        back_populates="match",
        cascade="all, delete-orphan"
    )
>>>>>>> dev
