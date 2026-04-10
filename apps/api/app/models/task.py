from uuid import UUID, uuid4
from datetime import datetime
from enum import Enum
from typing import Optional
from sqlmodel import Field, SQLModel


class TaskStatus(str, Enum):
    CANT_START = "cant_start"
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    WAITING = "waiting"
    DONE = "done"


class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Effort(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    group_id: UUID = Field(foreign_key="groups.id", index=True)

    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    color: Optional[str] = Field(default=None, max_length=6)
    status: TaskStatus = Field(default=TaskStatus.NOT_STARTED)
    priority: Optional[Priority] = Field(default=None)
    effort_estimate: Optional[Effort] = Field(default=None)
    time_estimate_mins: Optional[int] = Field(default=None)
    start_time: Optional[datetime] = Field(default=None)
    end_time: Optional[datetime] = Field(default=None)
    is_fixed: bool = Field(default=True)
    position: int = Field(default=0)
    notify_mins: Optional[int] = Field(default=None)
    rrule: Optional[str] = Field(default=None, max_length=500)
