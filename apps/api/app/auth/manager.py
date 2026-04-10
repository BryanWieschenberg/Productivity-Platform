from uuid import UUID
from typing import Optional
from fastapi import Depends, Request
from fastapi_users import BaseUserManager, UUIDIDMixin
from fastapi_users_db_sqlmodel import SQLModelUserDatabaseAsync
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_session
from app.models.user import User
from app.models.oauth_account import OAuthAccount
from app.config import settings
import resend

resend.api_key = settings.resend_api_key


class UserManager(UUIDIDMixin, BaseUserManager[User, UUID]):
    reset_password_token_secret = settings.reset_password_token_secret
    verification_token_secret = settings.verification_token_secret
    
    async def on_after_register(self, user: User, request: Optional[Request] = None):
        await self.request_verify(user, request)
    
    async def on_after_request_verify(self, user: User, token: str, request: Optional[Request] = None):
        resend.Emails.send({
            "from": settings.email_from,
            "to": user.email,
            "subject": "Verify Your AsKJet Account",
            "html": f"<a href=\"{settings.frontend_url}/verify?token={token}\">Click here to verify</a>",
        })
    
    async def on_after_forgot_password(self, user: User, token: str, request: Optional[Request] = None):
        resend.Emails.send({
            "from": settings.email_from,
            "to": user.email,
            "subject": "Reset Your AsKJet Password",
            "html": f"<a href=\"{settings.frontend_url}/reset-password?token={token}\">Click here to reset your password</a>",
        })


async def get_user_db(session: AsyncSession = Depends(get_session)):
    yield SQLModelUserDatabaseAsync(session, User, OAuthAccount)


async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)
