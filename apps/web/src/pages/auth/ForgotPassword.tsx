import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import { api, ApiError } from "@/api/client";
import { useCaptcha } from "@/hooks/useCaptcha";

export default function ForgotPassword() {
    const { execute } = useCaptcha();

    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const captchaToken = await execute("forgot_password");
            await api("auth/forgot-password", {
                method: "POST",
                body: { email },
                captchaToken,
            });
            setSubmitted(true);
        } catch (err) {
            setError(
                err instanceof ApiError ? err.detail : "Something went wrong. Please try again.",
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center bg-bg p-4">
            <div className="w-full max-w-md bg-surface border border-border rounded-lg p-8">
                <h1 className="text-2xl font-semibold text-text mb-2">Forgot your password?</h1>
                <p className="text-sm text-text-muted mb-6">
                    Enter your email and we'll send you a link to reset it.
                </p>

                {submitted ? (
                    <div className="p-4 bg-success/10 border border-success/30 rounded text-text text-sm">
                        A reset link has been sent. Check your inbox.
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded text-danger text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-2">
                            <div>
                                <label className="block text-sm font-medium text-text mb-1">
                                    Email
                                </label>
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

                            <button
                                type="submit"
                                disabled={submitting}
                                className={`w-full mt-2 py-2 bg-brand hover:bg-brand-hover text-brand-fg rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${!submitting && "hover:cursor-pointer"}`}
                            >
                                {submitting ? "Sending..." : "Send reset link"}
                            </button>
                        </form>
                    </>
                )}

                <p className="mt-6 text-center text-sm text-text-muted">
                    Remember your password?{" "}
                    <Link to="/signin" className="text-brand hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
