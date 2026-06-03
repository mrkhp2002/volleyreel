from sqlalchemy import Column, Integer, String, Date
from app.database import Base

class Tournament(Base):

    __tablename__ = "tournaments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    start_date = Column(Date)
    end_date = Column(Date)
    status = Column(String)