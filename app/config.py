from pydantic import BaseSettings
from env import db_url


class Settings(BaseSettings):
    API_VERSION: str = '1.0.0'
    MIN_DB_POOL_SIZE: int = 1
    MAX_DB_POOL_SIZE: int = 1


class Config(Settings):
    DATABASE_URL = db_url


def get_settings():
    return Config()
