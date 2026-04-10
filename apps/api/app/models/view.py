from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel

from app.models.helpers import fk_cascade


class View(SQLModel, table=True):
    __tablename__ = "views"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(sa_column=fk_cascade("users.id"))
    
    name: str = Field(max_length=50)
    params: str = Field(max_length=500)
    position: int = Field(default=0)
