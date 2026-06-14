from sqlalchemy import Boolean, Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

    # Role-based access control
    # Allowed values: "coach", "admin", "viewer"
    role = Column(String, default="coach", nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # One user can have many tournaments
    tournaments = relationship("Tournament", back_populates="user")
