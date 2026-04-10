from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from contextlib import asynccontextmanager
from .db import create_db_and_tables, get_async_session
from app.auth.users import fastapi_users, auth_backend, current_active_user
from app.auth.schemas import UserRead, UserCreate, UserUpdate
from app.auth.oauth import google_oauth_client, github_oauth_client
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_and_tables()
    yield


app = FastAPI(title="AskJet", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/api/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/api/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="/api/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/api/auth",
    tags=["auth"],
)

app.include_router(
    fastapi_users.get_oauth_router(
        google_oauth_client,
        auth_backend,
        settings.secret,
        redirect_url=f"{settings.frontend_url}/oauth/google/callback",
    ),
    prefix="/api/auth/google",
    tags=["auth"],
)

app.include_router(
    fastapi_users.get_oauth_router(
        github_oauth_client,
        auth_backend,
        settings.secret,
        redirect_url=f"{settings.frontend_url}/oauth/github/callback",
    ),
    prefix="/api/auth/github",
    tags=["auth"],
)


@app.get("/health")
async def get_todos():
    return {"ok": True}
