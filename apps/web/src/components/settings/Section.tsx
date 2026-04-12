import type { ReactNode } from "react";

export default function Section({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <section className="bg-surface border border-border rounded-lg p-6">
            <h2 className="text-lg font-medium text-text mb-1">{title}</h2>
            {description ? (
                <p className="text-sm text-text-muted mb-4">{description}</p>
            ) : (
                <div className="mb-4" />
            )}
            <div className="space-y-4">{children}</div>
        </section>
    );
}
