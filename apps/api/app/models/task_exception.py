from uuid import UUID, uuid4
from datetime import datetime
from sqlmodel import Field, SQLModel


class TaskException(SQLModel, table=True):
    __tablename__ = "task_exceptions"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    task_id: UUID = Field(foreign_key="tasks.id", index=True)

    original_date: datetime
    is_skipped: bool = Field(default=True)
