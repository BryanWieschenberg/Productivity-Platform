from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel


class View(SQLModel, table=True):
    __tablename__ = "views"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    
    name: str = Field(max_length=50)
    params: str = Field(max_length=500)
    position: int = Field(default=0)
