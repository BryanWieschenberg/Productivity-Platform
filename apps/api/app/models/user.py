from typing import TYPE_CHECKING
from uuid import UUID, uuid4
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.oauth_account import OAuthAccount


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True)

    email: str = Field(unique=True, index=True, max_length=320)
    hashed_password: str = Field(max_length=1024)
    is_active: bool = Field(default=True)
    is_superuser: bool = Field(default=False)
    is_verified: bool = Field(default=False)

    username: str = Field(default="", max_length=50)
    has_usable_password: bool = Field(default=False)

    oauth_accounts: list["OAuthAccount"] = Relationship(
        sa_relationship_kwargs={
            "lazy": "joined",
            "cascade": "all, delete",
        },
        back_populates="user",
    )
