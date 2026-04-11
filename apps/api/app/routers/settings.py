from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.auth.router import current_active_user
from app.db import get_async_session
from app.models.settings import Settings
from app.models.user import User
from app.schemas.settings import SettingsRead, SettingsUpdate

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("", response_model=SettingsRead)
async def get_settings(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> SettingsRead:
    res = await session.execute(select(Settings).where(Settings.user_id == user.id))
    user_settings = res.scalars().first()
    if user_settings is None:
        raise HTTPException(status_code=404, detail="Settings not found")
    return user_settings


@router.patch("", response_model=SettingsRead)
async def update_settings(
    payload: SettingsUpdate,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> SettingsRead:
    res = await session.execute(select(Settings).where(Settings.user_id == user.id))
    user_settings = res.scalars().first()
    if user_settings is None:
        raise HTTPException(status_code=404, detail="Settings not found")
    
    update_data = payload.model_dump(exclude_unset=True)

    print("Payload:", update_data)

    for field, val in update_data.items():
        setattr(user_settings, field, val)
    
    session.add(user_settings)
    await session.commit()
    await session.refresh(user_settings)
    return user_settings
