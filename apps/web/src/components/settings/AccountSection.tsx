import { useState } from "react";

import { api, ApiError } from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import Section from "@/components/settings/Section";
import PasswordInput from "../ui/PasswordInput";

export default function AccountSection({
    username,
    onUsernameChange,
}: {
    username: string;
    onUsernameChange: (val: string) => void;
}) {
    const { user } = useAuth();
    const hasPassword = user?.has_usable_password ?? false;

    const [changingPassword, setChangingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleChangePassword = async () => {
        setPasswordError(null);

        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match.");
            return;
        }

        setSubmitting(true);
        try {
            await api("account/change-password", {
                method: "POST",
                body: {
                    current_password: currentPassword,
                    new_password: newPassword,
                },
            });
            setPasswordSuccess(true);
            setChangingPassword(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => setPasswordSuccess(false), 3000);
        } catch (err) {
            setPasswordError(err instanceof ApiError ? err.detail : "Failed to change password");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSetPassword = async () => {
        setSubmitting(true);
        try {
            await api("oauth/set-password", { method: "POST" });
            setPasswordSuccess(true);
            setTimeout(() => setPasswordSuccess(false), 3000);
        } catch {
            setPasswordError("Failed to send password reset email");
        } finally {
            setSubmitting(false);
        }
    };

    const inputClasses =
        "w-full px-3 py-2 bg-bg border border-border rounded text-text focus:outline-none focus:border-brand";

    return (
        <Section title="Account" description="Manage your profile and password.">
            <div>
                <label className="block text-sm font-medium text-text mb-1">Username</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => onUsernameChange(e.target.value)}
                    maxLength={50}
                    className={inputClasses}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-text mb-1">Password</label>

                {passwordSuccess && (
                    <p className="text-sm text-success mb-2">
                        {hasPassword ? "Password updated." : "Check your email for a reset link."}
                    </p>
                )}

                {passwordError && <p className="text-sm text-danger mb-2">{passwordError}</p>}

                {hasPassword ? (
                    <>
                        {!changingPassword ? (
                            <button
                                onClick={() => setChangingPassword(true)}
                                className="text-sm text-brand hover:underline hover:cursor-pointer"
                            >
                                Change password
                            </button>
                        ) : (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleChangePassword();
                                }}
                                className="space-y-2"
                            >
                                <PasswordInput
                                    type="password"
                                    placeholder="Current password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    minLength={8}
                                    maxLength={1024}
                                    className={inputClasses}
                                    required
                                />
                                <PasswordInput
                                    type="password"
                                    placeholder="New password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    minLength={8}
                                    maxLength={1024}
                                    className={inputClasses}
                                    required
                                />
                                <PasswordInput
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={inputClasses}
                                    minLength={8}
                                    maxLength={1024}
                                    required
                                />
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-3 py-1.5 text-sm bg-brand hover:bg-brand-hover hover:cursor-pointer text-brand-fg rounded disabled:opacity-50 transition-colors"
                                    >
                                        {submitting ? "Saving..." : "Update password"}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setChangingPassword(false);
                                            setCurrentPassword("");
                                            setNewPassword("");
                                            setConfirmPassword("");
                                            setPasswordError(null);
                                        }}
                                        className="px-3 py-1.5 text-sm text-text-muted hover:text-text hover:cursor-pointer transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </>
                ) : (
                    <div>
                        <p className="text-sm text-text-muted mb-2">
                            You signed up with OAuth. Set a password to enable email sign-in.
                        </p>
                        <button
                            onClick={handleSetPassword}
                            disabled={submitting}
                            className="px-3 py-1.5 text-sm bg-brand hover:bg-brand-hover text-brand-fg rounded disabled:opacity-50 hover:cursor-pointer transition-colors"
                        >
                            {submitting ? "Sending..." : "Set a Password"}
                        </button>
                    </div>
                )}
            </div>
        </Section>
    );
}
