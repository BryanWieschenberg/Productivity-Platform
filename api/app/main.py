from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from contextlib import asynccontextmanager

from .database import create_db_and_tables, get_async_session
from .users import fastapi_users, auth_backend, current_active_user
from .schemas import UserRead, UserCreate, UserUpdate
from .models import Todo, TodoCreate, TodoRead, TodoReorder, User


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_and_tables()
    yield


app = FastAPI(title="Todo App")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth/jwt",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)


@app.get("/todos", response_model=List[TodoRead])
async def get_todos(
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    query = select(Todo).where(Todo.user_id == user.id).order_by(Todo.position, Todo.id)
    result = await session.execute(query)
    return result.scalars().all()


@app.get("/todos/{todo_id}", response_model=TodoRead)
async def get_todo(
    todo_id: int,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    query = select(Todo).where(Todo.id == todo_id, Todo.user_id == user.id)
    result = await session.execute(query)
    todo = result.scalar_one_or_none()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo


@app.post("/todos", response_model=TodoRead)
async def create_todo(
    todo_in: TodoCreate,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    todo = Todo(
        title=todo_in.title,
        description=todo_in.description,
        position=todo_in.position,
        user_id=user.id,
    )
    session.add(todo)
    await session.commit()
    await session.refresh(todo)
    return todo


@app.put("/todos/{todo_id}", response_model=TodoRead)
async def toggle_todo_completed(
    todo_id: int,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    query = select(Todo).where(Todo.id == todo_id, Todo.user_id == user.id)
    result = await session.execute(query)
    todo = result.scalar_one_or_none()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")

    todo.completed = not todo.completed
    session.add(todo)
    await session.commit()
    await session.refresh(todo)
    return todo


@app.delete("/todos/{todo_id}")
async def delete_todo(
    todo_id: int,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    query = select(Todo).where(Todo.id == todo_id, Todo.user_id == user.id)
    result = await session.execute(query)
    todo = result.scalar_one_or_none()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")

    await session.delete(todo)
    await session.commit()
    return {"ok": True}


@app.post("/todos/reorder")
async def reorder_todos(
    reorder_in: TodoReorder,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    item_ids = [item.id for item in reorder_in.items]
    query = select(Todo).where(Todo.id.in_(item_ids), Todo.user_id == user.id)
    result = await session.execute(query)
    todos_db = {todo.id: todo for todo in result.scalars().all()}

    for item in reorder_in.items:
        if item.id in todos_db:
            todos_db[item.id].position = item.position
            session.add(todos_db[item.id])

    await session.commit()
    return {"ok": True}
