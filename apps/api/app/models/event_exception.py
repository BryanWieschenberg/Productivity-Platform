from uuid import UUID, uuid4
from datetime import datetime
from sqlmodel import Field, SQLModel


class EventException(SQLModel, table=True):
    __tablename__ = "event_exceptions"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    event_id: UUID = Field(foreign_key="events.id", index=True)

    original_date: datetime
    is_skipped: bool = Field(default=True)
