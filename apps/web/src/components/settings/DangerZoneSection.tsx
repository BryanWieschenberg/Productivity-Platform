// src/components/settings/DangerZoneSection.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import Section from "@/components/settings/Section";

export default function DangerZoneSection() {
    const nav = useNavigate();
    const { signOut } = useAuth();
    const [confirming, setConfirming] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (confirmText !== "Delete my account") return;
        setDeleting(true);
        try {
            await api("users/me", { method: "DELETE" });
            await signOut();
            nav("/signin");
        } catch {
            setDeleting(false);
        }
    };

    return (
        <Section title="Danger zone" description="Irreversible actions.">
            {!confirming ? (
                <button
                    onClick={() => setConfirming(true)}
                    className="px-3 py-1.5 text-sm border border-danger text-danger rounded hover:bg-danger/10 hover:cursor-pointer transition-colors"
                >
                    Delete account
                </button>
            ) : (
                <div className="space-y-3 p-4 border border-danger/30 rounded bg-danger/5">
                    <p className="text-sm text-text">
                        This will permanently delete your account and all your data. This cannot be
                        undone.
                    </p>
                    <p className="text-sm text-text">
                        Type <strong className="text-danger">Delete my account</strong> to confirm:
                    </p>
                    <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="Delete my account"
                        className="w-full px-3 py-2 bg-bg border border-border rounded text-text focus:outline-none focus:border-danger"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleDelete}
                            disabled={confirmText !== "Delete my account" || deleting}
                            className="px-3 py-1.5 text-sm bg-danger text-white rounded disabled:opacity-50 hover:cursor-pointer transition-colors"
                        >
                            {deleting ? "Deleting..." : "Permanently delete"}
                        </button>
                        <button
                            onClick={() => {
                                setConfirming(false);
                                setConfirmText("");
                            }}
                            className="px-3 py-1.5 text-sm text-text-muted hover:text-text hover:cursor-pointer transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </Section>
    );
}
