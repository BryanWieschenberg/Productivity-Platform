from app.auth.oauth import fetch_oauth_username
from sqlalchemy.exc import IntegrityError
from sqlmodel import select
from uuid import UUID
from typing import Optional
from fastapi import Depends, Request, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi_users import BaseUserManager, UUIDIDMixin
from fastapi_users_db_sqlmodel import SQLModelUserDatabaseAsync
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi_users import InvalidPasswordException
import resend

from app.db import get_async_session
from app.auth.schemas import UserCreate
from app.models.user import User
from app.models.oauth_account import OAuthAccount
from app.config import settings
from app.models.settings import Settings
from app.models.group import Group
from app.models.calendar import Calendar

resend.api_key = settings.resend_api_key

OAUTH_PATHS = ("google", "github")


class UserManager(UUIDIDMixin, BaseUserManager[User, UUID]):
    reset_password_token_secret = settings.reset_password_token_secret
    verification_token_secret = settings.verification_token_secret

    async def validate_password(self, password: str, user: UserCreate | User) -> None:
        if len(password) < 8:
            raise InvalidPasswordException(reason="Password must be at least 8 characters long")
        if len(password) > 128:
            raise InvalidPasswordException(reason="Password must be at most 128 characters long")
        if user.email.lower() in password.lower():
            raise InvalidPasswordException(reason="Password cannot contain your email")

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        is_oauth_signup = request and any(f"/{p}/" in request.url.path for p in OAUTH_PATHS)
        if not is_oauth_signup:
            user.has_usable_password = True
            session = self.user_db.session
            session.add(user)
            await session.commit()
        if not user.is_verified:
            await self.request_verify(user, request)
    
    async def on_after_verify(self, user: User, request: Optional[Request] = None):
        session = self.user_db.session

        user_settings = Settings(user_id=user.id)
        def_group = Group(user_id=user.id, name="My Tasks", position=0)
        def_cal = Calendar(user_id=user.id, name="My Calendar", position=0)

        session.add(user_settings)
        session.add(def_group)
        session.add(def_cal)
        
        try:
            await session.commit()
        except IntegrityError:
            await session.rollback()

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
    
    async def on_after_reset_password(self, user: User, request: Optional[Request] = None):
        user.has_usable_password = True
        session = self.user_db.session
        session.add(user)
        await session.commit()
    
    async def authenticate(self, credentials: OAuth2PasswordRequestForm) -> Optional[User]:
        user = await super().authenticate(credentials)

        if user and not user.is_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="LOGIN_USER_NOT_VERIFIED"
            )
        
        return user
    
    async def oauth_callback(
        self,
        oauth_name: str,
        access_token: str,
        account_id: str,
        account_email: str,
        expires_at: Optional[int] = None,
        refresh_token: Optional[str] = None,
        request: Optional[Request] = None,
        *,
        associate_by_email: bool = False,
        is_verified_by_default: bool = False,
    ) -> User:
        user = await super().oauth_callback(
            oauth_name,
            access_token,
            account_id,
            account_email,
            expires_at=expires_at,
            refresh_token=refresh_token,
            request=request,
            associate_by_email=associate_by_email,
            is_verified_by_default=is_verified_by_default,
        )

        session: AsyncSession = self.user_db.session

        if not user.username:
            username = await fetch_oauth_username(oauth_name, access_token)
            if username:
                user.username = username[:50]
                session.add(user)
                await session.commit()

        existing_settings = await session.execute(
            select(Settings).where(Settings.user_id == user.id)
        )
        if existing_settings.first() is None:
            session.add(Settings(user_id=user.id))
            session.add(Group(user_id=user.id, name="My Tasks", position=0))
            session.add(Calendar(user_id=user.id, name="My Calendar", position=0))
            try:
                await session.commit()
            except IntegrityError:
                await session.rollback()
        return user


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLModelUserDatabaseAsync(session, User, OAuthAccount)


async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)
