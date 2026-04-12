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
                setTimeout(() => {
                    setDraft(data);
                }, 3000);
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

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-text">Settings</h1>
                <div className="flex items-center gap-3">
                    {success && <span className="text-sm text-success">Saved</span>}
                    {error && <span className="text-sm text-danger">{error}</span>}
                    <button
                        onClick={handleSave}
                        disabled={!isDirty || saving}
                        className="px-4 py-2 bg-brand hover:bg-brand-hover text-brand-fg rounded font-medium disabled:invisible transition-colors hover:cursor-pointer"
                    >
                        {saving ? "Saving..." : "Save changes"}
                    </button>
                </div>
            </div>

            <AccountSection username={username} onUsernameChange={setUsername} />
            {/* <PreferencesSection draft={draft} onChange={setDraft} />
            <ConnectedAccountsSection />
            <DangerZoneSection /> */}
        </div>
    );
}
