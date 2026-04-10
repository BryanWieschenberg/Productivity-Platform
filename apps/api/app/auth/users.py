from os import environ
from dotenv import load_dotenv
from fastapi_users.authentication import AuthenticationBackend, CookieTransport, JWTStrategy
from config import settings


cookie_transport = CookieTransport(
    tokenUrl="askjet_auth",
    cookie_max_age=60 * 60 * 24 * 7,
    cookie_secure=settings.is_prod,
    cookie_httponly=True,
    cookie_samesite="lax"
)


def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=settings.secret, lifetime_seconds=60 * 60 * 24 * 7)


auth_backend = AuthenticationBackend(
    name="cookie",
    transport=cookie_transport,
    get_strategy=get_jwt_strategy,
)
