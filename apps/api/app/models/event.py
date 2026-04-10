from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel


class Event(SQLModel, table=True):
    __tablename__ = "events"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    group_id: UUID = Field(foreign_key="calendars.id", index=True)

    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    location: Optional[str] = Field(default=None, max_length=200)
    color: Optional[str] = Field(default=None, max_length=6)
    start_time: datetime
    end_time: datetime
    all_day: bool = Field(default=False)
    is_fixed: bool = Field(default=True)
    notify_mins: Optional[int] = Field(default=None)
    rrule: Optional[str] = Field(default=None, max_length=500)
