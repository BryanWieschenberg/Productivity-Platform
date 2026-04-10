from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PG_UUID


def fk_cascade(target: str, unique: bool = False, index: bool = True, nullable: bool = False, primary_key: bool = False):
    return Column(
        PG_UUID(as_uuid=True),
        ForeignKey(target, ondelete="CASCADE"),
        unique=unique,
        index=index,
        nullable=nullable,
        primary_key=primary_key,
    )
