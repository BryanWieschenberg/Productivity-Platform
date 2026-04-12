from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from fastapi_users.exceptions import UserNotExists

from app.auth.router import current_active_user
from app.db import get_async_session
from app.models.oauth_account import OAuthAccount
from app.models.user import User
from app.auth.manager import UserManager, get_user_manager

router = APIRouter(prefix="/api/oauth", tags=["oauth"])


@router.delete("/{provider}", status_code=204)
async def unlink_oauth(
    provider: str,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    if provider not in ("google", "github"):
        raise HTTPException(status_code=400, detail="Unknown provider")
    
    res = await session.execute(select(OAuthAccount).where(OAuthAccount.user_id == user.id))
    accounts = res.all()

    target = next((a for a in accounts if a.oauth_name == provider), None)
    if target is None:
        raise HTTPException(status_code=404, detail=f"No linked {provider} account")
    
    other_oauth_ct = sum(1 for a in accounts if a.oauth_name != provider)
    if not user.has_usable_password and other_oauth_ct == 0:
        raise HTTPException(status_code=400, detail="Cannot unlink your only sign-in method. Set a password first.")
    
    await session.delete(target)
    await session.commit()


@router.post("/set-password", status_code=202)
async def request_set_password(
    user: User = Depends(current_active_user),
    user_manager: UserManager = Depends(get_user_manager),
):
    try:
        await user_manager.forgot_password(user)
    except UserNotExists:
        pass
