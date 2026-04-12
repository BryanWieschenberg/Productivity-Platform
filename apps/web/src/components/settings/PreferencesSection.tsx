import { useState } from "react";

import { api, ApiError } from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import { type UserSettings } from "@/types/settings";
import Section from "@/components/settings/Section";

export default function PreferencesSection({
    draft,
    onChange,
}: {
    draft: UserSettings;
    onChange: (next: UserSettings) => void;
}) {
    const { user } = useAuth();

    return (
        <Section title="Preferences" description="Manage your preferences.">
            <div>hi</div>
        </Section>
    );
}
