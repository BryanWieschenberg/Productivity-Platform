from uuid import UUID
from fastapi_users import schemas
from typing import Optional


class OAuthAccountRead(schemas.BaseModel):
    id: UUID
    oauth_name: str
    account_email: str


class UserRead(schemas.BaseUser[UUID]):
    username: str
    has_usable_password: bool
    oauth_accounts: list[OAuthAccountRead] = []


class UserCreate(schemas.BaseUserCreate):
    username: str


class UserUpdate(schemas.BaseUserUpdate):
    username: Optional[str] = None
