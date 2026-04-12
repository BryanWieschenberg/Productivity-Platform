import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { config } from "@/config";
import { api } from "@/api/client";

export default function OAuthCallback({ provider }: { provider: string }) {
    const [searchParams] = useSearchParams();
    const { refresh } = useAuth();
    const nav = useNavigate();

    const called = useRef(false);

    useEffect(() => {
        const finish = async () => {
            try {
                await fetch(
                    `${config.apiUrl}/api/auth/${provider}/callback?${searchParams.toString()}`,
                    { credentials: "include" },
                );
            } catch (err) {
                console.error("Couldn't finish OAuth flow:", err);
            }
            await refresh();

            if (!localStorage.getItem("hasInitTz")) {
                try {
                    const osTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    await api("settings", {
                        method: "PATCH",
                        body: { timezone: osTz },
                    });
                    localStorage.setItem("hasInitTz", "1");
                } catch (err) {
                    console.error("Failed to initialize timezone", err);
                }
            }
            nav("/workspace", { replace: true });
        };

        if (called.current) return;
        called.current = true;

        const code = searchParams.get("code");
        const state = searchParams.get("state");

        if (!code || !state) {
            nav("/signin", { replace: true });
            return;
        }

        finish();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="h-screen flex items-center justify-center bg-bg">
            <div className="w-8 h-8 rounded-full border-2 border-border border-t-brand animate-spin" />
        </div>
    );
}
