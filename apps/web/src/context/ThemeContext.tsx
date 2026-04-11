import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type ThemePref = "system" | "light" | "dark";
type ThemeResolved = "light" | "dark";

type ThemeContextValue = {
    pref: ThemePref;
    resolved: ThemeResolved;
    setPref: (pref: ThemePref) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSysTheme(): ThemeResolved {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitTheme(): ThemePref {
    const stored = localStorage.getItem("theme");
    if (stored === "system" || stored === "light" || stored === "dark") return stored;
    return "system";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [pref, setPrefState] = useState<ThemePref>(getInitTheme);
    const [resolved, setResolved] = useState<ThemeResolved>(() =>
        getInitTheme() === "system" ? getSysTheme() : (getInitTheme() as ThemeResolved),
    );

    useEffect(() => {
        const next: ThemeResolved = pref === "system" ? getSysTheme() : pref;
        setResolved(next);

        const root = document.documentElement;
        root.classList.toggle("dark", next === "dark");

        localStorage.setItem("theme", pref);

        if (pref === "system") {
            const mql = window.matchMedia("(prefers-color-scheme: dark)");
            const handler = () => setResolved(getSysTheme());

            mql.addEventListener("change", handler);
            return () => mql.removeEventListener("change", handler);
        }
    }, [pref]);

    const setPref = (p: ThemePref) => setPrefState(p);

    return (
        <ThemeContext.Provider value={{ pref, resolved, setPref }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
    return ctx;
}
