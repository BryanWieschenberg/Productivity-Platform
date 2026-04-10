from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel
from typing import Optional


class Calendar(SQLModel, table=True):
    __tablename__ = "calendars"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    
    name: str = Field(max_length=50)
    color: Optional[str] = Field(default=None, max_length=6)
    position: int = Field(default=0)
    is_visible: bool = Field(default=True)
