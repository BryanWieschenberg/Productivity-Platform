import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings as SettingsIcon, LogOut, Monitor, Sun, Moon } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

function getInitials(username: string): string {
    const parts = username.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return username[0]?.toUpperCase() ?? "U";
}

export default function ProfileMenu() {
    const { user, signOut } = useAuth();
    const { pref, setPref } = useTheme();
    const nav = useNavigate();

    const [open, setOpen] = useState(false);
    const [themeOpen, setThemeOpen] = useState(false);

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
                setThemeOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const initials = getInitials(user?.username ?? "?");

    const handleSignOut = async () => {
        setOpen(false);
        await signOut();
        nav("/signin");
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((o) => !o)}
                className="w-9 h-9 rounded-md bg-brand text-brand-fg text-sm font-medium flex items-center justify-center hover:bg-brand-hover hover:cursor-pointer transition-colors"
                aria-label="Profile menu"
            >
                {initials}
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-surface border border-border rounded-md shadow-lg py-1 z-50">
                    <button
                        onClick={() => {
                            setOpen(false);
                            nav("/settings");
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-text hover:text-text hover:bg-surface-hover hover:cursor-pointer flex items-center gap-2 transition-colors"
                    >
                        <SettingsIcon className="w-4 h-4" />
                        Settings
                    </button>

                    <div
                        className="relative"
                        onMouseEnter={() => setThemeOpen(true)}
                        onMouseLeave={() => setThemeOpen(false)}
                    >
                        <button className="w-full px-3 py-2 text-left text-sm text-text hover:text-text hover:bg-surface-hover hover:cursor-pointer flex items-center gap-2 transition-colors">
                            {pref === "system" && <Monitor className="w-4 h-4" />}
                            {pref === "light" && <Sun className="w-4 h-4" />}
                            {pref === "dark" && <Moon className="w-4 h-4" />}
                            Theme
                        </button>

                        {themeOpen && (
                            <div className="absolute right-full top-0 w-32 bg-surface border border-border rounded-md shadow-lg py-1">
                                {(["system", "light", "dark"] as const).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setPref(t)}
                                        className={`w-full px-3 py-2 text-left text-sm capitalize transition-colors ${
                                            pref === t
                                                ? "text-brand font-medium"
                                                : "text-text hover:text-text hover:bg-surface-hover hover:cursor-pointer"
                                        }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="h-px bg-border my-1" />

                    <button
                        onClick={handleSignOut}
                        className="w-full px-3 py-2 text-left text-sm text-text hover:text-text hover:bg-surface-hover hover:cursor-pointer flex items-center gap-2 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign out
                    </button>
                </div>
            )}
        </div>
    );
}
