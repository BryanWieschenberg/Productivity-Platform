import uuid
from sqlmodel import SQLModel, Field
from typing import List, Optional


class User(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(index=True, unique=True, nullable=False)
    hashed_password: str = Field(nullable=False)
    is_active: bool = Field(default=True, nullable=False)
    is_superuser: bool = Field(default=False, nullable=False)
    is_verified: bool = Field(default=False, nullable=False)


class Todo(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    title: str = Field(nullable=False)
    description: Optional[str] = Field(default=None)
    completed: bool = Field(default=False)
    position: int = Field(default=0)


class TodoCreate(SQLModel):
    title: str
    description: Optional[str] = None
    position: int = 0


class TodoRead(SQLModel):
    id: int
    title: str
    description: Optional[str] = None
    completed: bool
    position: int
    user_id: uuid.UUID


class TodoReorderItem(SQLModel):
    id: int
    position: int


class TodoReorder(SQLModel):
    items: List[TodoReorderItem]
