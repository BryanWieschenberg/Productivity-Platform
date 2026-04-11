import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { api, ApiError } from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import { useCaptcha } from "@/hooks/useCaptcha";

type Status = "verifying" | "success" | "error";

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const { refresh } = useAuth();
    const { execute } = useCaptcha();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<Status>("verifying");
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        const verify = async () => {
            try {
                const captchaToken = await execute("verify_email");
                await api("auth/verify", {
                    method: "POST",
                    body: { token },
                    captchaToken,
                });
                await refresh();
                setStatus("success");
            } catch (err) {
                setStatus("error");
                setErrorMsg(
                    err instanceof ApiError
                        ? "This verification link is invalid or has expired."
                        : "Something went wrong. Please try again.",
                );
            }
        };

        verify();
    }, [token, refresh, execute]);

    if (!token) {
        return (
            <div className="flex items-center justify-center bg-bg p-4">
                <div className="w-full max-w-md bg-surface border border-border rounded-lg p-8">
                    <h1 className="text-2xl font-semibold text-text mb-2">
                        Invalid verification link
                    </h1>
                    <p className="text-sm text-text-muted mb-6">
                        This verification link is missing a token. Please request a new one.
                    </p>
                    <Link
                        to="/verify-pending"
                        className="block w-full py-2 text-center bg-brand hover:bg-brand-hover text-brand-fg rounded font-medium transition-colors"
                    >
                        Request new link
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center bg-bg p-4">
            <div className="w-full max-w-md bg-surface border border-border rounded-lg p-8 text-center">
                {status === "verifying" && (
                    <>
                        <h1 className="text-2xl font-semibold text-text mb-2">
                            Verifying your email...
                        </h1>
                        <p className="text-sm text-text-muted">Just a moment.</p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <h1 className="text-2xl font-semibold text-text mb-2">Email verified!</h1>
                        <Link
                            to="/signin"
                            className="block w-full py-2 text-center bg-brand hover:bg-brand-hover text-brand-fg rounded font-medium transition-colors"
                        >
                            Go to sign in
                        </Link>
                    </>
                )}

                {status === "error" && (
                    <>
                        <h1 className="text-2xl font-semibold text-text mb-2">
                            Verification failed
                        </h1>
                        <p className="text-sm text-text-muted mb-6">{errorMsg}</p>
                        <Link
                            to="/signin"
                            className="block w-full py-2 text-center bg-brand hover:bg-brand-hover text-brand-fg rounded font-medium transition-colors"
                        >
                            Go to sign in
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
