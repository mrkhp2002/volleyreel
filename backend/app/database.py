from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql+psycopg2://postgres:Ama1990@@127.0.0.1:5432/volleyreel_dashboard"

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


# DATABASE SESSION
def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()