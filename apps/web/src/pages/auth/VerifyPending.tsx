import { useState, type FormEvent } from "react";
import { useLocation, Link } from "react-router-dom";

import { api, ApiError } from "@/api/client";
import { useCaptcha } from "@/hooks/useCaptcha";

type Status = "idle" | "submitting" | "success" | "error";

export default function VerifyPending() {
    const location = useLocation();
    const { execute } = useCaptcha();
    const initEmail = location.state?.email || "";

    const [email, setEmail] = useState(initEmail);
    const [status, setStatus] = useState<Status>("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const handleResend = async (e?: FormEvent) => {
        if (e) e.preventDefault();
        setStatus("submitting");

        try {
            const captchaToken = await execute("resend_verification");
            await api("auth/request-verify-token", {
                method: "POST",
                body: { email },
                captchaToken,
            });
            setStatus("success");
        } catch (err) {
            setStatus("error");
            setErrorMsg(
                err instanceof ApiError ? err.detail : "Something went wrong. Please try again.",
            );
        }
    };

    return (
        <div className="flex items-center justify-center bg-bg p-4">
            <div className="w-full max-w-md bg-surface border border-border rounded-lg p-8 text-center">
                <h1 className="text-2xl font-semibold text-text mb-2">
                    {initEmail || status === "success" ? "Check your email" : "Verify your email"}
                </h1>
                <p className="text-sm text-text-muted mb-6">
                    {initEmail || status === "success"
                        ? "We've sent a verification link to your email address. Please click the link to verify your account."
                        : "Enter your email address to request a new verification link."}{" "}
                </p>

                {status === "success" ? (
                    <div className="p-4 bg-success/10 border border-success/30 rounded text-text text-sm">
                        Verification email sent! Please check your inbox.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {status === "error" && (
                            <div className="p-3 bg-danger/10 border border-danger/30 rounded text-danger text-sm">
                                {errorMsg}
                            </div>
                        )}

                        {!initEmail ? (
                            <form onSubmit={handleResend} className="space-y-2 text-left">
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
                                    disabled={status === "submitting"}
                                    className="w-full mt-2 py-2 bg-brand hover:cursor-pointer hover:bg-brand-hover text-brand-fg rounded font-medium disabled:opacity-50 transition-colors"
                                >
                                    {status === "submitting"
                                        ? "Sending..."
                                        : "Resend verification email"}
                                </button>
                            </form>
                        ) : (
                            <div>
                                <p className="text-sm text-text-muted mb-2">
                                    Didn't receive an email?
                                </p>
                                <button
                                    onClick={() => handleResend()}
                                    disabled={status === "submitting"}
                                    className="text-brand hover:cursor-pointer hover:underline font-medium disabled:opacity-50"
                                >
                                    {status === "submitting" ? "Sending..." : "Click to resend"}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-8">
                    <Link to="/signin" className="text-sm text-brand hover:underline">
                        Back to sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
