import { useEffect, useState } from "react";

import { api, ApiError } from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { type UserSettings } from "@/types/settings";
import AccountSection from "@/components/settings/AccountSection";
import PreferencesSection from "@/components/settings/PreferencesSection";
import ConnectedAccountsSection from "@/components/settings/ConnectedAccountsSection";
import DangerZoneSection from "@/components/settings/DangerZoneSection";

export default function Settings() {
    const { user, refresh } = useAuth();

    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [draft, setDraft] = useState<UserSettings | null>(null);
    const [username, setUsername] = useState(user?.username ?? "");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const isDirty =
        !!settings &&
        !!draft &&
        (JSON.stringify(settings) !== JSON.stringify(draft) || username !== user?.username);

    useUnsavedChanges(isDirty);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await api<UserSettings>("settings");
                setSettings(data);
                setDraft(data);
            } catch {
                setError("Failed to load settings");
            }
        };

        load();
    }, []);

    const handleSave = async () => {
        if (!draft) return;
        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            if (username !== user?.username) {
                await api("users/me", {
                    method: "PATCH",
                    body: { username },
                });
            }

            if (JSON.stringify(settings) !== JSON.stringify(draft)) {
                await api("settings", {
                    method: "PATCH",
                    body: draft,
                });
            }

            setSettings(draft);
            await refresh();
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err instanceof ApiError ? err.detail : "Failed to save");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (!settings) return;
        setDraft(settings);
        setUsername(user?.username ?? "");
        setError(null);
    };

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6 pb-32">
            <div className="relative flex items-center justify-center">
                <h1 className="text-3xl font-semibold text-text">Settings</h1>
            </div>

            <AccountSection username={username} onUsernameChange={setUsername} />
            <PreferencesSection draft={draft} onChange={setDraft} />
            <ConnectedAccountsSection loading={!draft} />
            <DangerZoneSection />

            <div
                className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center px-4 py-2 
                bg-surface/80 backdrop-blur-md border border-border shadow-2xl rounded-full 
                transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
                ${isDirty ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0 pointer-events-none"}`}
            >
                <div className="flex flex-col pl-2">
                    <span className="text-sm font-medium text-text whitespace-nowrap">
                        You have unsaved changes.
                    </span>
                    {error && (
                        <span className="text-[10px] text-danger font-medium animate-pulse">
                            {error}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCancel}
                        className="pl-5 pr-4 py-1.5 text-sm font-medium text-text-muted hover:text-text transition-colors hover:cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-5 py-1.5 bg-brand hover:bg-brand-hover text-brand-fg rounded-full text-sm font-semibold 
                        transition-all active:scale-95 hover:cursor-pointer disabled:opacity-50"
                    >
                        {saving ? (
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 border-2 border-brand-fg/30 border-t-white rounded-full animate-spin" />
                                <span>Saving...</span>
                            </div>
                        ) : (
                            "Save"
                        )}
                    </button>
                </div>
            </div>

            {success && (
                <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-success/90 text-success-fg px-4 py-1.5 rounded-full text-sm font-medium z-60 animate-in fade-in slide-in-from-top-4 duration-300">
                    Changes saved
                </div>
            )}
        </div>
    );
}
