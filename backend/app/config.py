import secrets

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "VolleyReel API"
    debug: bool = True
    # database_url: str = "sqlite:///./volleyreel.db"
    database_url: str = "postgresql://postgres:22903147@localhost:5432/volleyreel_db"

    # 64-char hex; override via SECRET_KEY env var in production
    secret_key: str = secrets.token_hex(32)
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080  # 60

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8")


settings = Settings()
