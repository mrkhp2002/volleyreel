import secrets

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "VolleyReel API"
    debug: bool = True
    database_url: str = "sqlite:///./volleyreel.db"
    secret_key: str = secrets.token_hex(32)  # 64-char hex; override via SECRET_KEY env var in production
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
