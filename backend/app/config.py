from app.database import engine, Base

from app.models.tournament_model import Tournament
from app.models.team_model import Team
from app.models.player_model import Player
from app.models.match_model import Match
from app.models.event_model import Event

Base.metadata.create_all(bind=engine)

print("Database Tables Created")