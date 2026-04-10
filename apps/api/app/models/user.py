from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel

class User(SQLModel, table=True):
    __tablename__ = "users"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)

    email: str = Field(unique=True, index=True, max_length=320)
    hashed_password: str = Field(max_length=1024)
    is_active: bool = Field(default=True)
    is_superuser: bool = Field(default=False)
    is_verified: bool = Field(default=False)
    username: str = Field(max_length=50)
