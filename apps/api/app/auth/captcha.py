from httpx import AsyncClient
from fastapi import Header, HTTPException, Request
from typing import Optional

from app.config import settings

VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify"


async def verify_captcha(request: Request, x_captcha_token: Optional[str] = Header(default=None)):
    if (
        (not settings.is_prod and x_captcha_token == "dev-bypass") or
        (request.url.path.endswith("/logout"))
    ):
        return

    if not x_captcha_token:
        raise HTTPException(status_code=400, detail="Missing captcha token")

    async with AsyncClient() as client:
        response = await client.post(
            VERIFY_URL,
            data={
                "secret": settings.recaptcha_secret_key,
                "response": x_captcha_token
            },
        )
    
    res = response.json()

    if not res.get("success"):
        raise HTTPException(status_code=400, detail="Invalid captcha")
    
    score = res.get("score", 0.0)
    if score < settings.recaptcha_min_score:
        raise HTTPException(status_code=400, detail="Failed captcha")
