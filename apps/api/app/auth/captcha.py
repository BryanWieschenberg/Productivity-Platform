from httpx import AsyncClient
from fastapi import Header, HTTPException

from app.config import settings

VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify"


async def verify_captcha(x_captcha_token: str = Header(...)):
    if not settings.is_prod and x_captcha_token == "dev-bypass":
        return

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
