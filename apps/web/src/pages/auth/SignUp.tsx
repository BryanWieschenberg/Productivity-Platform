import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { api, ApiError } from "@/api/client";
import { useCaptcha } from "@/hooks/useCaptcha";
import OAuthSection from "@/components/OAuthSection";
import PasswordInput from "@/components/ui/PasswordInput";

export default function SignUp() {
    const nav = useNavigate();
    const { execute } = useCaptcha();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setSubmitting(true);
        try {
            const captchaToken = await execute("signup");
            await api("auth/register", {
                method: "POST",
                body: { email, password, username },
                captchaToken,
            });

            nav("/verify-pending", { state: { email } });
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
                <h1 className="text-2xl font-semibold text-text mb-6">
                    Create your AskJet account
                </h1>

                {error && (
                    <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded text-danger text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-2">
                    <div>
                        <label className="block text-sm font-medium text-text mb-1">Username</label>
                        <input
                            type="text"
                            placeholder="John Doe"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            maxLength={50}
                            className="w-full px-3 py-2 bg-bg border border-border rounded text-text focus:outline-none focus:border-brand"
                        />
                    </div>

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

                    <div>
                        <label className="block text-sm font-medium text-text mb-1">
                            Confirm Password
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
                        className={`w-full mt-2 py-2 bg-brand hover:bg-brand-hover text-brand-fg rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${!submitting && "hover:cursor-pointer"}`}
                    >
                        {submitting ? "Creating account..." : "Sign up"}
                    </button>
                </form>

                <OAuthSection />

                <p className="mt-6 text-center text-sm text-text-muted">
                    Already have an account?{" "}
                    <Link to="/signin" className="text-brand hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
