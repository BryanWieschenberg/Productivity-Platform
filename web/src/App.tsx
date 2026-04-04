import React, { useState, useEffect, useCallback } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

interface Todo {
    id: number;
    title: string;
    completed: boolean;
    position: number;
}

function SortableTodoItem({
    todo,
    toggleTodo,
    deleteTodo,
}: {
    todo: Todo;
    toggleTodo: (id: number) => void;
    deleteTodo: (id: number) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: todo.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <li
            ref={setNodeRef}
            style={style}
            className={`group p-5 flex items-center gap-4 transition-colors select-none ${
                isDragging ? "opacity-50 bg-[#252b3b] z-10 relative" : "hover:bg-[#252b3b]"
            }`}
        >
            <div
                {...attributes}
                {...listeners}
                className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing outline-none"
            >
                <svg
                    className="w-5 h-5 focus:outline-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8h16M4 16h16"
                    />
                </svg>
            </div>
            <button
                onClick={() => toggleTodo(todo.id)}
                className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                    todo.completed
                        ? "bg-indigo-500 border-indigo-500"
                        : "border-gray-500 hover:border-indigo-400 group-hover:scale-110"
                }`}
            >
                {todo.completed && (
                    <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                )}
            </button>
            <span
                className={`flex-1 text-lg transition-all ${
                    todo.completed ? "text-gray-500 line-through" : "text-gray-200"
                }`}
            >
                {todo.title}
            </span>
            <button
                onClick={() => deleteTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                aria-label="Delete"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                </svg>
            </button>
        </li>
    );
}

function App() {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [isLoginView, setIsLoginView] = useState(true);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [authError, setAuthError] = useState("");

    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodoStr, setNewTodoStr] = useState("");

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const logout = useCallback(() => {
        setToken(null);
        localStorage.removeItem("token");
        setTodos([]);
    }, []);

    useEffect(() => {
        if (!token) return;

        const fetchTodos = async () => {
            const res = await fetch(`${API_URL}/todos`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setTodos(await res.json());
            else if (res.status === 401) logout();
        };

        fetchTodos();
    }, [token, logout]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError("");

        if (isLoginView) {
            const formData = new URLSearchParams();
            formData.append("username", email);
            formData.append("password", password);

            const res = await fetch(`${API_URL}/auth/jwt/login`, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setToken(data.access_token);
                localStorage.setItem("token", data.access_token);
            } else {
                setAuthError("Failed to login. Please check credentials.");
            }
        } else {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                setIsLoginView(true);
                setAuthError("Registered successfully! Please login.");
            } else {
                const data = await res.json();
                setAuthError(data.detail || "Registration failed.");
            }
        }
    };

    const addTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTodoStr.trim()) return;

        const res = await fetch(`${API_URL}/todos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ title: newTodoStr }),
        });

        if (res.ok) {
            const data = await res.json();
            setTodos([...todos, data]);
            setNewTodoStr("");
        }
    };

    const reorderTodos = async (newTodos: Todo[]) => {
        setTodos(newTodos);
        const items = newTodos.map((t, index) => ({ id: t.id, position: index }));
        await fetch(`${API_URL}/todos/reorder`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ items }),
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = todos.findIndex((t) => t.id === active.id);
            const newIndex = todos.findIndex((t) => t.id === over.id);

            const newTodos = arrayMove(todos, oldIndex, newIndex);
            setTodos(newTodos);
            reorderTodos(newTodos);
        }
    };

    const toggleTodo = async (id: number) => {
        const res = await fetch(`${API_URL}/todos/${id}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
            const updated = await res.json();
            setTodos(todos.map((t) => (t.id === id ? updated : t)));
        }
    };

    const deleteTodo = async (id: number) => {
        const res = await fetch(`${API_URL}/todos/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
            setTodos(todos.filter((t) => t.id !== id));
        }
    };

    if (!token) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-md p-8 rounded-2xl bg-[#1e2330] shadow-2xl border border-[#2a3040] transition-all">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent text-center mb-8">
                        Productivity Platform
                    </h1>
                    <form className="flex flex-col gap-5" onSubmit={handleAuth}>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-[#0f111a] border border-[#2a3040] rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-white placeholder-gray-600"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-[#0f111a] border border-[#2a3040] rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-white placeholder-gray-600"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                        {authError && (
                            <p className="text-red-400 text-sm text-center font-medium animate-pulse">
                                {authError}
                            </p>
                        )}
                        <button className="w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 mt-2">
                            {isLoginView ? "Sign In" : "Create Account"}
                        </button>
                    </form>
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsLoginView(!isLoginView);
                                setAuthError("");
                            }}
                            className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                        >
                            {isLoginView
                                ? "Need an account? Register"
                                : "Already have an account? Sign In"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8 pt-12 min-h-screen flex flex-col">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                        Your Goals
                    </h1>
                    <p className="text-gray-400 mt-2 font-medium">Get things done, efficiently.</p>
                </div>
                <button
                    onClick={logout}
                    className="px-5 py-2 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white transition-all font-medium"
                >
                    Sign out
                </button>
            </div>

            <form onSubmit={addTodo} className="flex gap-3 mb-8 relative">
                <input
                    type="text"
                    value={newTodoStr}
                    onChange={(e) => setNewTodoStr(e.target.value)}
                    placeholder="What needs to be done?"
                    className="flex-1 px-5 py-4 bg-[#1e2330] rounded-2xl border border-[#2a3040] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all shadow-lg text-lg placeholder-gray-500"
                />
                <button
                    type="submit"
                    className="px-8 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-1 active:translate-y-0 flex items-center justify-center"
                >
                    Add
                </button>
            </form>

            <div className="flex-1 bg-[#1e2330] rounded-2xl border border-[#2a3040] shadow-xl overflow-hidden flex flex-col">
                {todos.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <svg
                                className="w-8 h-8 text-gray-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-300">No tasks yet!</h3>
                        <p className="text-gray-500 mt-2 max-w-sm">
                            Add a task above to start tracking your goals.
                        </p>
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <ul className="divide-y divide-[#2a3040]">
                            <SortableContext
                                items={todos.map((t) => t.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {todos.map((todo) => (
                                    <SortableTodoItem
                                        key={todo.id}
                                        todo={todo}
                                        toggleTodo={toggleTodo}
                                        deleteTodo={deleteTodo}
                                    />
                                ))}
                            </SortableContext>
                        </ul>
                    </DndContext>
                )}
            </div>
        </div>
    );
}

export default App;
