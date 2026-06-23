from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Event(Base):
    __tablename__ = "events"

    event_id = Column(Integer, primary_key=True, index=True)

    # Which match this event belongs to
    match_id = Column(
        Integer,
        ForeignKey("matches.match_id", ondelete="CASCADE"),
        nullable=False
    )

    # Which player is credited — NULLABLE
    # None if Whisper could not identify who scored
    player_id = Column(
        Integer,
        ForeignKey("players.player_id", ondelete="SET NULL"),
        nullable=True
    )

    # Type of event: "kill", "ace", "block", "whistle", "unknown"
    event_type = Column(String, nullable=False)

    # Exact time in seconds when event occurred
    # Float gives sub-second precision from Whisper
    # Frontend uses this to seek video player to this moment
    timestamp_sec = Column(Float, nullable=False)

    # S3 URL of short clip FFmpeg generated for this event
    clip_url = Column(String, nullable=True)

    # Raw text Whisper transcribed around this timestamp
    # e.g. "Number 7 Kasun with a brilliant kill!"
    transcript_snippet = Column(String, nullable=True)

    # Whisper confidence score 0.0 to 1.0
    # Skip attribution if score below 0.6
    confidence = Column(Float, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    match = relationship("Match", back_populates="events")
    player = relationship("Player", back_populates="events")
