import { useEffect } from "react";
import { useBlocker } from "react-router-dom";

export function useUnsavedChanges(isDirty: boolean) {
    useBlocker(({ currentLocation, nextLocation }) => {
        if (!isDirty) return false;
        if (currentLocation.pathname === nextLocation.pathname) return false;
        return !window.confirm("You have unsaved changes. Leave anyway?");
    });

    useEffect(() => {
        if (!isDirty) return;

        const handler = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = "";
        };

        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [isDirty]);
}
