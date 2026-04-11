import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";

import { api, ApiError } from "@/api/client";
import { useCaptcha } from "@/hooks/useCaptcha";
import { useAuth } from "@/context/AuthContext";
import { config } from "@/config";
import OAuthSection from "@/components/OAuthSection";
import PasswordInput from "@/components/ui/PasswordInput";

const ERROR_MESSAGES: Record<string, string> = {
    LOGIN_BAD_CREDENTIALS: "The email or password you entered is incorrect.",
    LOGIN_USER_NOT_VERIFIED: "Please verify your email address before signing in.",
};

export default function SignIn() {
    const nav = useNavigate();
    const { execute } = useCaptcha();
    const { refresh } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<ReactNode | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const captchaToken = await execute("signin");
            const response = await fetch(`${config.apiUrl}/api/auth/login`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "X-Captcha-Token": captchaToken,
                },
                body: new URLSearchParams({
                    username: email,
                    password,
                }).toString(),
            });

            if (!response.ok) {
                if (response.status === 429) {
                    throw new ApiError(
                        429,
                        "You are performing this action too quickly. Please wait a moment and try again.",
                    );
                }
                const data = await response.json().catch(() => ({}));
                throw new ApiError(response.status, data.detail ?? "Sign in failed");
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

            nav("/workspace");
        } catch (err) {
            if (err instanceof ApiError && err.detail === "LOGIN_USER_NOT_VERIFIED") {
                setError(
                    <span>
                        Please{" "}
                        <Link
                            to="/verify-pending"
                            className="underline font-semibold hover:opacity-80 text-brand"
                        >
                            verify
                        </Link>{" "}
                        your email address before signing in.
                    </span>,
                );
                return;
            }
            setError(
                err instanceof ApiError
                    ? ERROR_MESSAGES[err.detail] || err.detail
                    : "Something went wrong. Please try again.",
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center bg-bg p-4">
            <div className="w-full max-w-md bg-surface border border-border rounded-lg p-8">
                <h1 className="text-2xl font-semibold text-text mb-6">Log in to AskJet</h1>

                {error && (
                    <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded text-danger text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-2">
                    <div>
                        <label className="block text-sm font-medium text-text mb-1">Email</label>
                        <input
                            type="email"
                            placeholder="test@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            maxLength={320}
                            className="w-full px-3 py-2 bg-bg border border-border rounded text-text focus:outline-none focus:border-brand"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text mb-1">Password</label>
                        <PasswordInput
                            type="password"
                            placeholder="..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            maxLength={1024}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className={`w-full mt-2 py-2 bg-brand hover:bg-brand-hover text-brand-fg rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${!submitting && "hover:cursor-pointer"}`}
                    >
                        {submitting ? "Logging in..." : "Log in"}
                    </button>
                </form>

                <OAuthSection />

                <div className="flex justify-between mt-6 text-center text-sm text-text-muted">
                    <div>
                        <Link to="/forgot-password" className="text-sm text-brand hover:underline">
                            Forgot password?
                        </Link>
                    </div>

                    <div>
                        Need an account?{" "}
                        <Link to="/signup" className="text-brand hover:underline">
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
