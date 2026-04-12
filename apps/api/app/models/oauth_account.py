from typing import TYPE_CHECKING
from uuid import UUID
from fastapi_users_db_sqlmodel import SQLModelBaseOAuthAccount
from sqlmodel import Field, Relationship

from app.models.helpers import fk_cascade

if TYPE_CHECKING:
    from app.models.user import User


class OAuthAccount(SQLModelBaseOAuthAccount, table=True):
    __tablename__ = "oauth_accounts"

    user_id: UUID = Field(sa_column=fk_cascade("users.id", index=False))

    user: "User" = Relationship(back_populates="oauth_accounts",)
