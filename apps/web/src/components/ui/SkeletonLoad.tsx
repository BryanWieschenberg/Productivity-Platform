export function SkeletonBlock({ className = "" }: { className?: string }) {
    return <div className={`animate-pulse rounded-md bg-surface-hover ${className}`} />;
}

export function SkeletonText({
    className = "",
    lines = 1,
}: {
    className?: string;
    lines?: number;
}) {
    if (lines === 1) return <SkeletonBlock className={`h-4 w-full rounded ${className}`} />;

    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <SkeletonBlock
                    key={i}
                    className={`h-4 rounded ${i === lines - 1 ? "w-4/5" : "w-full"}`}
                />
            ))}
        </div>
    );
}

export function SkeletonInput({ className = "" }: { className?: string }) {
    return <SkeletonBlock className={`h-10 w-full ${className}`} />;
}
