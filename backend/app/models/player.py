from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Player(Base):
    __tablename__ = "players"

    player_id = Column(Integer, primary_key=True, index=True)

    # Full name — Whisper transcript will be searched for this
    name = Column(String, nullable=False)

    # Jersey number — Whisper may catch "Number 7 kills!"
    number = Column(Integer, nullable=True)

    team_id = Column(
        Integer,
        ForeignKey("teams.team_id", ondelete="CASCADE"),
        nullable=False
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    team = relationship("Team", back_populates="players")

    # All events attributed to this player by Whisper pipeline
    events = relationship("Event", back_populates="player")