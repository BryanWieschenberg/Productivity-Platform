import { useAuth } from "@/context/AuthContext";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const { loading } = useAuth();

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-bg">
                <div className="w-8 h-8 rounded-full border-2 border-border border-t-brand animate-spin" />
            </div>
        );
    }

    return <>{children}</>;
}
