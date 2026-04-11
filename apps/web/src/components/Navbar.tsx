import { Link, NavLink, Outlet } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Sparkle, Plus, Bell, Mic, ChevronDown } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import ProfileMenu from "@/components/ProfileMenu";

export default function Navbar() {
    const { user } = useAuth();
    const signedIn = !!user;

    const savedViews: { id: string; name: string }[] = [];

    return (
        <>
            <header className="sticky top-0 z-50 h-12 bg-surface border-b border-border flex items-center px-8 gap-4">
                <Link
                    to={signedIn ? "/workspace" : "/"}
                    className="flex items-center"
                    aria-label="AskJet home"
                >
                    <img
                        src="/logo.png"
                        alt="AskJet"
                        className="w-8 h-8 object-contain text-brand"
                    />
                </Link>
                <nav className="flex items-center gap-1">
                    <TabLink to="/workspace" label="Workspace" signedIn={signedIn} />
                    <TabLink to="/workspace/upcoming" label="Upcoming" signedIn={signedIn} />
                    <TabLink to="/workspace/today" label="Today" signedIn={signedIn} />
                    <TabLink to="/workspace/focus" label="Focus" signedIn={signedIn} />
                    {signedIn && savedViews.length > 0 && <ViewsDropdown views={savedViews} />}
                </nav>
                <div className="ml-auto flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <button
                            disabled={!signedIn}
                            className={`transition-all duration-200 ${
                                signedIn
                                    ? "text-brand hover:text-brand-hover hover:scale-105 cursor-pointer"
                                    : "text-text-muted cursor-not-allowed"
                            }`}
                            aria-label="Jet Actions"
                        >
                            <Sparkle className="w-5 h-5" />
                        </button>

                        <div
                            className={`w-64 flex items-center justify-between px-2 py-1.5 bg-bg border border-border rounded text-sm ${
                                signedIn
                                    ? "text-text focus-within:border-text-muted"
                                    : "text-text-muted cursor-not-allowed"
                            }`}
                        >
                            <div className="flex items-center gap-2 flex-1">
                                <Plus className="w-4 h-4 shrink-0 hover:cursor-pointer" />
                                <input
                                    type="text"
                                    disabled={!signedIn}
                                    placeholder="Ask Jet anything..."
                                    aria-label="AskJet Prompt"
                                    className={`bg-transparent border-none outline-none w-full flex-1 placeholder:text-text-muted ${
                                        signedIn ? "cursor-text" : "cursor-not-allowed"
                                    }`}
                                />
                            </div>
                            <button
                                disabled={!signedIn}
                                className={`shrink-0 ml-2 ${signedIn ? "transition-colors hover:cursor-pointer" : "cursor-not-allowed"}`}
                                aria-label="Voice input"
                            >
                                <Mic className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <button
                        disabled={!signedIn}
                        className={`p-2 rounded ${
                            signedIn
                                ? "text-text hover:bg-surface-hover cursor-pointer transition-colors"
                                : "text-text-muted cursor-not-allowed"
                        }`}
                        aria-label="Notifications"
                    >
                        <Bell className="w-5 h-5" />
                    </button>
                    {!!user ? (
                        <ProfileMenu />
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                to="/signin"
                                className="px-4 py-1.5 text-md text-text hover:bg-surface-hover rounded transition-colors"
                            >
                                Log in
                            </Link>
                            <Link
                                to="/signup"
                                className="px-4 py-1.5 text-md bg-brand hover:bg-brand-hover text-brand-fg rounded transition-colors font-medium"
                            >
                                Create Account
                            </Link>
                        </div>
                    )}
                </div>{" "}
            </header>

            <main>
                <Outlet />
            </main>
        </>
    );
}

function TabLink({ to, label, signedIn }: { to: string; label: string; signedIn: boolean }) {
    const baseClasses = "px-4 py-1.5 text-md rounded transition-colors";

    if (!signedIn) {
        return <span className={`${baseClasses} text-text-muted cursor-not-allowed`}>{label}</span>;
    }

    return (
        <NavLink
            to={to}
            end
            className={({ isActive }) =>
                `${baseClasses} ${
                    isActive
                        ? "bg-surface-hover text-text"
                        : "text-text-muted hover:bg-surface-hover/60 hover:text-text"
                }`
            }
        >
            {label}
        </NavLink>
    );
}

function ViewsDropdown({ views }: { views: { id: string; name: string }[] }) {
    const [open, setOpen] = useState(false);

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-1 px-4 py-1.5 text-md text-text-muted hover:bg-surface-hover hover:text-text rounded transition-colors"
            >
                Views
                <ChevronDown className="w-3 h-3" />
            </button>

            {open && (
                <div className="absolute left-0 top-full mt-2 w-48 bg-surface border border-border rounded-md shadow-lg py-1 z-50">
                    {views.map((v) => (
                        <Link
                            key={v.id}
                            to={`/workspace?view=${v.id}`}
                            onClick={() => setOpen(false)}
                            className="block px-4 py-2 text-md text-text hover:bg-surface-hover"
                        >
                            {v.name}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
