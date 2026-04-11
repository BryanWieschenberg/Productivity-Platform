from slowapi import Limiter
from slowapi.util import get_remote_address
from collections import defaultdict
from fastapi import Request, HTTPException
from time import time

from app.config import settings


limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["60/minute"]
)

_auth_rates = defaultdict(list)

auth_limits = 5 if settings.is_prod else 60


async def auth_limit(request: Request):
    ip = get_remote_address(request)
    now = time()

    _auth_rates[ip] = [t for t in _auth_rates[ip] if t > now - 60]
    if len(_auth_rates[ip]) >= auth_limits:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")

    _auth_rates[ip].append(now)
