from typing import Callable
from databases import Database
from fastapi import FastAPI

from app.services.composite import CompositeService


def create_db(app: FastAPI) -> Callable:
    async def _create_db_connection() -> None:
        app.state.composite_service = CompositeService()
        config = app.state.config
        app.state.database = Database(
            url=config.DATABASE_URL,
            min_size=config.MIN_DB_POOL_SIZE,
            max_size=config.MAX_DB_POOL_SIZE
        )
        await app.state.database.connect()

    return _create_db_connection


def close_db(app: FastAPI) -> Callable:
    async def _close_db_connection() -> None:
        await app.state.database.disconnect()

    return _close_db_connection
