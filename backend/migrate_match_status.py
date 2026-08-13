"""One-off migration: add match_status column to matches table."""
from app.database import engine
from sqlalchemy import text, inspect

inspector = inspect(engine)
cols = [c["name"] for c in inspector.get_columns("matches")]

with engine.connect() as conn:
    if "match_status" not in cols:
        conn.execute(text("ALTER TABLE matches ADD COLUMN match_status VARCHAR DEFAULT 'upcoming'"))
        conn.commit()
        print("✅ match_status column added successfully.")
    else:
        print("ℹ️  match_status column already exists, skipping.")
