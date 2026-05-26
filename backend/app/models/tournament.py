from sqlalchemy import Column, Integer, String, Date, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class Tournament(Base):
    __tablename__ = "tournaments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    location = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    matches = relationship("Match", back_populates="tournament", cascade="all, delete-orphan")
