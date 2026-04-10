from typing import Optional
from sqlmodel import SQLModel

from app.models.settings import WeekStart, DateFormat, TimeFormat


class SettingsRead(SQLModel):
    timezone: str
    week_start: WeekStart
    date_format: DateFormat
    time_format: TimeFormat
    auto_rollover: bool
    split_screen: bool
    def_event_mins: int
    def_notify_mins: int
    keybinds: dict


class SettingsUpdate(SQLModel):
    timezone: Optional[str] = None
    week_start: Optional[WeekStart] = None
    date_format: Optional[DateFormat] = None
    time_format: Optional[TimeFormat] = None
    auto_rollover: Optional[bool] = None
    split_screen: Optional[bool] = None
    def_event_mins: Optional[int] = None
    def_notify_mins: Optional[int] = None
    keybinds: Optional[dict] = None
