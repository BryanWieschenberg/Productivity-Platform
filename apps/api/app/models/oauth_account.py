from fastapi_users_db_sqlmodel import SQLModelBaseOAuthAccount
from uuid import UUID
from sqlmodel import Field

from app.models.helpers import fk_cascade


class OAuthAccount(SQLModelBaseOAuthAccount, table=True):
    __tablename__ = "oauth_accounts"

    user_id: UUID = Field(sa_column=fk_cascade("users.id", index=False))
