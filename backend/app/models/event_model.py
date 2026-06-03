from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class Event(Base):

    __tablename__ = "events"

    event_id = Column(Integer, primary_key=True, index=True)

    match_id = Column(Integer, ForeignKey("matches.id"))
    player_id = Column(Integer, ForeignKey("players.id"))

    event_type = Column(String)
    timestamp_sec = Column(Integer)

    clip_path = Column(String)