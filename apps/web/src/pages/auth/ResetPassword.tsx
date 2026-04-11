import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { api, ApiError } from "@/api/client";
import { useCaptcha } from "@/hooks/useCaptcha";
import PasswordInput from "@/components/ui/PasswordInput";

export default function ResetPassword() {
    const nav = useNavigate();
    const { execute } = useCaptcha();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    if (!token) {
        return (
            <div className="flex items-center justify-center bg-bg p-4">
                <div className="w-full max-w-md bg-surface border border-border rounded-lg p-8">
                    <h1 className="text-2xl font-semibold text-text mb-2">Invalid reset link</h1>
                    <p className="text-sm text-text-muted mb-6">
                        This password reset link is missing a token. Please request a new one.
                    </p>
                    <Link
                        to="/forgot-password"
                        className="block w-full py-2 text-center bg-brand hover:bg-brand-hover text-brand-fg rounded font-medium transition-colors"
                    >
                        Request new link
                    </Link>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setSubmitting(true);
        try {
            const captchaToken = await execute("reset_password");
            await api("auth/reset-password", {
                method: "POST",
                body: { token, password },
                captchaToken,
            });
            nav("/signin");
        } catch (err) {
            setError(
                err instanceof ApiError
                    ? "This reset link is invalid or has expired."
                    : "Something went wrong. Please try again.",
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center bg-bg p-4">
            <div className="w-full max-w-md bg-surface border border-border rounded-lg p-8">
                <h1 className="text-2xl font-semibold text-text mb-2">Set a new password</h1>
                <p className="text-sm text-text-muted mb-6">
                    Enter a new password for your account.
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded text-danger text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-2">
                    <div>
                        <label className="block text-sm font-medium text-text mb-1">
                            New password
                        </label>
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

                    <div>
                        <label className="block text-sm font-medium text-text mb-1">
                            Confirm new password
                        </label>
                        <PasswordInput
                            type="password"
                            placeholder="..."
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={8}
                            maxLength={1024}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full mt-2 py-2 bg-brand hover:bg-brand-hover text-brand-fg rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {submitting ? "Resetting..." : "Reset password"}
                    </button>
                </form>
            </div>
        </div>
    );
}
