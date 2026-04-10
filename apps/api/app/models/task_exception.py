from uuid import UUID, uuid4
from datetime import datetime
from sqlmodel import Field, SQLModel

from app.models.helpers import fk_cascade


class TaskException(SQLModel, table=True):
    __tablename__ = "task_exceptions"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    task_id: UUID = Field(sa_column=fk_cascade("tasks.id"))

    original_date: datetime
    is_skipped: bool = Field(default=True)
