"""Application configuration via environment variables."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Centralised settings loaded from .env and overridable by env-vars."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── App ──────────────────────────────────────────────────────────────
    app_name: str = "Traveloop API"
    debug: bool = False
    api_base_url: str = "http://localhost:8000"
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:3001"]

    # ── Database ─────────────────────────────────────────────────────────
    database_url: str = "postgresql+asyncpg://traveloop:traveloop@localhost:5432/traveloop"
    # Sync URL used by Alembic migrations only
    database_url_sync: str = "postgresql+psycopg2://traveloop:traveloop@localhost:5432/traveloop"
    db_echo: bool = False
    db_pool_size: int = 10
    db_max_overflow: int = 20

    # ── JWT ──────────────────────────────────────────────────────────────
    jwt_secret_key: str = "CHANGE-ME-TO-A-RANDOM-64-CHAR-SECRET"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60
    jwt_refresh_token_expire_days: int = 7

    # ── Misc ─────────────────────────────────────────────────────────────
    bcrypt_rounds: int = 12


settings = Settings()
