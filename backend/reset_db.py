from app.database import engine, Base
from app.models.user import User
from app.models.tournament import Tournament
from app.models.team import Team
from app.models.player import Player

print("Dropping and recreating database tables in PostgreSQL...")
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
print("Database reset successfully!")
