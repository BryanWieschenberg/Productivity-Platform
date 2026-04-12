import { useAuth } from "@/context/AuthContext";
import { api } from "@/api/client";

export default function Workspace() {
    const { user, refresh } = useAuth();

    const handleSignOut = async () => {
        try {
            await api("auth/logout", { method: "POST" });
            await refresh();
        } catch (err) {
            console.error("Failed to sign out", err);
        }
    };

    return (
        <div className="p-8">
            <h1 className="font-bold text-xl mb-2">Signed in as:</h1>
            <p>Username: {user.username}</p>
            <p>Email: {user.email}</p>

            <button
                onClick={handleSignOut}
                className="mt-4 px-4 py-2 bg-surface hover:bg-surface-hover border border-border text-text rounded text-sm font-medium transition-colors hover:cursor-pointer"
            >
                Sign out
            </button>
        </div>
    );
}
