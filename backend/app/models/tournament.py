<<<<<<< HEAD
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from app.database import Base

class Tournament(Base):
    __tablename__ = "tournaments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    division = Column(String, default="Premier Division")  
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
=======
from sqlalchemy import Column, Integer, String, Date, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Tournament(Base):
    __tablename__ = "tournaments"

    tournament_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    location = Column(String, nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)

    type = Column(String, nullable=True)
    category = Column(String, nullable=True)  # Men's Senior, U19...
    registration_deadline = Column(Date, nullable=True)
    city = Column(String, nullable=True)
    organizer_name = Column(String, nullable=True)
    team_limit = Column(Integer, default=16)
    groups_count = Column(Integer, default=4)
    match_format = Column(String, nullable=True)  # Best of 5 Sets...
    set_rules = Column(String, nullable=True)  # 25 Point Rally Score...
    status = Column(String, default="Upcoming")
    banner_url = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    public_visibility = Column(Boolean, default=True)
    allow_report_sharing = Column(Boolean, default=True)
    enable_leaderboard = Column(Boolean, default=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True),
                        server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="tournaments")
    teams = relationship(
        "Team",
        back_populates="tournament",
        cascade="all, delete-orphan"
    )
    matches = relationship(
        "Match",
        back_populates="tournament",
        cascade="all, delete-orphan"
    )
>>>>>>> dev
