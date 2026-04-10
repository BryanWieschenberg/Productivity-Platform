from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel


class TaskLabel(SQLModel, table=True):
    __tablename__ = "task_labels"

    task_id: UUID = Field(foreign_key="tasks.id", primary_key=True)
    label_id: UUID = Field(foreign_key="labels.id", primary_key=True)
