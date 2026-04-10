from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel

from app.models.helpers import fk_cascade


class TaskLabel(SQLModel, table=True):
    __tablename__ = "task_labels"

    task_id: UUID = Field(sa_column=fk_cascade("tasks.id", index=False, primary_key=True))
    label_id: UUID = Field(sa_column=fk_cascade("labels.id", index=False, primary_key=True))
