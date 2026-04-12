import { useState } from "react";
import { api, ApiError } from "@/api/client";

import { useAuth } from "@/context/AuthContext";
import Section from "@/components/settings/Section";

export default function DangerZoneSection() {
    const { user } = useAuth();

    return (
        <Section title="Danger Zone" description="For dangerous operations. Be careful!">
            <div>hi</div>
        </Section>
    );
}
