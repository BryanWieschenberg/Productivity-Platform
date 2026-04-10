from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel


class TaskEvent(SQLModel, table=True):
    __tablename__ = "task_events"

    task_id: UUID = Field(foreign_key="tasks.id", primary_key=True)
    event_id: UUID = Field(foreign_key="events.id", primary_key=True)
