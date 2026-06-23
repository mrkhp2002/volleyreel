from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Player(Base):
    __tablename__ = "players"

    player_id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)
    jersey_number = Column(Integer, nullable=True)
    position = Column(String, nullable=True)
    height = Column(Float, nullable=True)
    weight = Column(Float, nullable=True)

    team_id = Column(
        Integer,
        ForeignKey("teams.team_id", ondelete="CASCADE"),
        nullable=False
    )

    date_of_birth = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    contact_number = Column(String, nullable=True)
    email = Column(String, nullable=True)
    address = Column(String, nullable=True)
    status = Column(String, default="Active")
    photo_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    team = relationship("Team", back_populates="players")

    # All events attributed to this player by Whisper pipeline
    events = relationship("Event", back_populates="player")
