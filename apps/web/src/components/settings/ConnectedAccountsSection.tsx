import { useState } from "react";

import { api, ApiError } from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import { config } from "@/config";
import Section from "@/components/settings/Section";
import { SkeletonBlock } from "@/components/ui/SkeletonLoad";

type OAuthAccount = {
    id: string;
    oauth_name: string;
    account_email: string;
};

export default function ConnectedAccountsSection({ loading }: { loading: boolean }) {
    const { user, refresh } = useAuth();
    const accounts: OAuthAccount[] = (user as any)?.oauth_accounts ?? [];
    const [error, setError] = useState<string | null>(null);
    const [unlinking, setUnlinking] = useState<string | null>(null);

    const isLinked = (provider: string) => accounts.some((a) => a.oauth_name === provider);
    const getAccountEmail = (provider: string) =>
        accounts.find((a) => a.oauth_name === provider)?.account_email;

    const handleUnlink = async (provider: string) => {
        setError(null);
        setUnlinking(provider);
        try {
            await api(`oauth/${provider}`, { method: "DELETE" });
            await refresh();
        } catch (err) {
            setError(err instanceof ApiError ? err.detail : "Failed to unlink");
        } finally {
            setUnlinking(null);
        }
    };

    return (
        <Section title="Connected accounts" description="Link accounts for easier sign-in.">
            {error && <p className="text-sm text-danger mb-2">{error}</p>}

            <div className="space-y-3">
                <ProviderRow
                    name="Google"
                    provider="google"
                    linked={isLinked("google")}
                    email={getAccountEmail("google")}
                    unlinking={unlinking === "google"}
                    loading={loading}
                    onUnlink={() => handleUnlink("google")}
                />
                <ProviderRow
                    name="GitHub"
                    provider="github"
                    linked={isLinked("github")}
                    email={getAccountEmail("github")}
                    unlinking={unlinking === "github"}
                    loading={loading}
                    onUnlink={() => handleUnlink("github")}
                />
            </div>
        </Section>
    );
}

function ProviderRow({
    name,
    provider,
    linked,
    email,
    unlinking,
    loading,
    onUnlink,
}: {
    name: string;
    provider: string;
    linked: boolean;
    email?: string;
    unlinking: boolean;
    loading: boolean;
    onUnlink: () => void;
}) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <div className="text-sm font-medium text-text">
                    {loading ? <SkeletonBlock className="h-4 w-20" /> : name}
                </div>
                {(linked || loading) && (
                    <div className="text-xs text-text-muted mt-0.5">
                        {loading ? <SkeletonBlock className="h-3 w-32 mt-1" /> : email}
                    </div>
                )}
            </div>
            {loading ? (
                <SkeletonBlock className="h-8 w-16" />
            ) : linked ? (
                <button
                    onClick={onUnlink}
                    disabled={unlinking}
                    className="px-3 py-1.5 text-sm border border-border rounded text-text hover:bg-surface-hover disabled:opacity-50 transition-colors cursor-pointer"
                >
                    {unlinking ? "Unlinking..." : "Unlink"}
                </button>
            ) : (
                <a
                    href={`${config.apiUrl}/api/auth/associate/${provider}/authorize`}
                    className="px-3 py-1.5 text-sm bg-brand hover:bg-brand-hover text-brand-fg rounded transition-colors"
                >
                    Link
                </a>
            )}
        </div>
    );
}
