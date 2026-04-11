from uuid import UUID, uuid4
from enum import Enum
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel

from app.models.helpers import fk_cascade


class WeekStart(str, Enum):
    SUNDAY = "sunday"
    MONDAY = "monday"
    SATURDAY = "saturday"


class DateFormat(str, Enum):
    MDY = "MM/DD"
    DMY = "DD/MM"


class TimeFormat(str, Enum):
    TWELVE = "12h"
    TWENTY_FOUR = "24h"


class Settings(SQLModel, table=True):
    __tablename__ = "settings"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(sa_column=fk_cascade("users.id", unique=True))

    timezone: str = Field(default="UTC", max_length=50)
    week_start: WeekStart = Field(default=WeekStart.SUNDAY)
    date_format: DateFormat = Field(default=DateFormat.MDY)
    time_format: TimeFormat = Field(default=TimeFormat.TWELVE)
    split_screen: bool = Field(default=True)
    auto_rollover: bool = Field(default=False)
    def_event_mins: int = Field(default=60)
    def_notify_mins: int = Field(default=30)
    keybinds: dict = Field(default={}, sa_column=Column(JSONB, nullable=False, server_default="{}"))
