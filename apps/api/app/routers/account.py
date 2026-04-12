from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.manager import UserManager, get_user_manager
from app.auth.router import current_active_user
from app.db import get_async_session
from app.models.user import User

router = APIRouter(prefix="/api/account", tags=["account"])


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=1024)
    new_password: str = Field(min_length=8, max_length=1024)


@router.post("/change-password", status_code=204)
async def change_password(
    payload: ChangePasswordRequest,
    user: User = Depends(current_active_user),
    user_manager: UserManager = Depends(get_user_manager),
    session: AsyncSession = Depends(get_async_session),
):
    verified, _ = user_manager.password_helper.verify_and_update(
        payload.current_password, user.hashed_password
    )
    if not verified:
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    try:
        await user_manager.validate_password(payload.new_password, user)
    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err))

    user.hashed_password = user_manager.password_helper.hash(payload.new_password)
    user.has_usable_password = True
    session.add(user)
    await session.commit()
