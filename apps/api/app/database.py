import os
from typing import AsyncGenerator
from dotenv import load_dotenv
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

load_dotenv()
DATABASE_URL = os.environ.get("DATABASE_URL")
DEBUG_SQL = os.getenv("DEBUG_SQL", "false").lower() == "true"

engine = create_async_engine(DATABASE_URL, echo=DEBUG_SQL)
async_session_maker = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session
