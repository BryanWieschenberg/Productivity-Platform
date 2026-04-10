from uuid import UUID, uuid4
from datetime import datetime
from sqlmodel import Field, SQLModel

from app.models.helpers import fk_cascade


class EventException(SQLModel, table=True):
    __tablename__ = "event_exceptions"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    event_id: UUID = Field(sa_column=fk_cascade("events.id"))

    original_date: datetime
    is_skipped: bool = Field(default=True)
