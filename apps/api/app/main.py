# ruff: noqa: E402
from warnings import filterwarnings
filterwarnings("ignore", category=UserWarning, module="pydantic")

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.db import create_db_and_tables
from app.auth.users import auth_backend
from app.auth.router import fastapi_users
from app.auth.schemas import UserRead, UserUpdate
from app.auth.oauth import google_oauth_client, github_oauth_client
from app.auth.captcha import verify_captcha
from app.limit import limiter, auth_limit
from app.routers.settings import router as settings_router
from app.routers.oauth import router as oauth_router
from app.routers.register import router as register_router
from app.routers.account import router as account_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_and_tables()
    yield


app = FastAPI(title="AskJet", lifespan=lifespan)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/api/auth",
    tags=["auth"],
    dependencies=[Depends(auth_limit), Depends(verify_captcha)],
)

app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="/api/auth",
    tags=["auth"],
    dependencies=[Depends(auth_limit), Depends(verify_captcha)]
)

app.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/api/auth",
    tags=["auth"],
    dependencies=[Depends(auth_limit), Depends(verify_captcha)]
)

app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/api/users",
    tags=["users"],
)

app.include_router(
    fastapi_users.get_oauth_associate_router(
        google_oauth_client,
        UserRead,
        settings.secret,
    ),
    prefix="/api/auth/associate/google",
    tags=["auth"],
    dependencies=[Depends(auth_limit)]
)

app.include_router(
    fastapi_users.get_oauth_associate_router(
        github_oauth_client,
        UserRead,
        settings.secret,
    ),
    prefix="/api/auth/associate/github",
    tags=["auth"],
    dependencies=[Depends(auth_limit)]
)

app.include_router(
    fastapi_users.get_oauth_router(
        google_oauth_client,
        auth_backend,
        settings.secret,
        redirect_url=f"{settings.frontend_url}/oauth/google/callback",
        is_verified_by_default=True,
        associate_by_email=True,
        csrf_token_cookie_secure=settings.is_prod,
    ),
    prefix="/api/auth/google",
    tags=["auth"],
    dependencies=[Depends(auth_limit)]
)

app.include_router(
    fastapi_users.get_oauth_router(
        github_oauth_client,
        auth_backend,
        settings.secret,
        redirect_url=f"{settings.frontend_url}/oauth/github/callback",
        is_verified_by_default=True,
        associate_by_email=True,
        csrf_token_cookie_secure=settings.is_prod,
    ),
    prefix="/api/auth/github",
    tags=["auth"],
    dependencies=[Depends(auth_limit)]
)

app.include_router(register_router)

app.include_router(oauth_router)

app.include_router(settings_router)

app.include_router(account_router)


@app.get("/health")
async def get_health():
    return {"ok": True}


# @app.post("/api/jet/propose")
# @limiter.limit("10/minute")
# async def jet_propose(request: Request):
#     pass
