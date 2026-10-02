from fastapi import Depends
from app.core.database import get_db

async def get_db_dependency():
    async for db in get_db():
        yield db