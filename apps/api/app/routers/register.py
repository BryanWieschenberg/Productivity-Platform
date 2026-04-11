from fastapi import APIRouter, Depends, status, Request, HTTPException
from fastapi_users.exceptions import UserAlreadyExists, InvalidPasswordException

from app.auth.captcha import verify_captcha
from app.auth.manager import UserManager, get_user_manager
from app.auth.schemas import UserCreate
from app.limit import limiter

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post(
    "/register",
    status_code=status.HTTP_202_ACCEPTED,
    dependencies=[Depends(verify_captcha)],
)
@limiter.limit("5/minute")
async def register(
    request: Request,
    user_create: UserCreate,
    user_manager: UserManager = Depends(get_user_manager),
):
    try:
        user = await user_manager.create(user_create, safe=True)
        await user_manager.on_after_register(user, request)
    except UserAlreadyExists:
        user_manager.password_helper.hash(user_create.password)
    except InvalidPasswordException as e:
        raise HTTPException(status_code=400, detail=str(e.reason))

    return {"status": "ok"}
