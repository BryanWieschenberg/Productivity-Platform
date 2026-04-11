import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { api } from "@/api/client";

type User = {
    id: string;
    email: string;
    username: string;
};

type AuthContextValue = {
    user?: User;
    loading: boolean;
    refresh: () => Promise<void>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refresh = async () => {
        try {
            const data = await api<User>("users/me");
            setUser(data);
        } catch (err) {
            if (err?.status === 401 || err?.status === 403) {
                setUser(null);
            } else {
                throw err;
            }
        }
    };

    const signOut = async () => {
        try {
            await api("auth/logout", { method: "POST" });
        } catch (err) {
            console.error("Logout failed:", err);
        }
        setUser(null);
    };

    useEffect(() => {
        const init = async () => {
            await refresh();
            setLoading(false);
        };

        init();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, refresh, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
