from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, index=True, nullable=False)
    last_name = Column(String, index=True, nullable=False)
    jersey_number = Column(Integer, nullable=True)
    position = Column(String, nullable=True)  # e.g., Setter, Outside Hitter, Libero
    height = Column(Float, nullable=True)     # in cm
    weight = Column(Float, nullable=True)     # in kg
    team_id = Column(Integer, ForeignKey("teams.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    team = relationship("Team", back_populates="players")
