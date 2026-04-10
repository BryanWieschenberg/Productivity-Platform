from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel

from app.models.helpers import fk_cascade


class TaskEvent(SQLModel, table=True):
    __tablename__ = "task_events"

    task_id: UUID = Field(sa_column=fk_cascade("tasks.id", index=False, primary_key=True))
    event_id: UUID = Field(sa_column=fk_cascade("events.id", index=False, primary_key=True))
