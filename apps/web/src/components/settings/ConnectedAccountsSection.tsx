import { useState } from "react";
import { api, ApiError } from "@/api/client";

import { useAuth } from "@/context/AuthContext";
import Section from "@/components/settings/Section";

export default function ConnectedAccountsSection() {
    const { user } = useAuth();

    return (
        <Section title="Connected Accounts" description="Manage your connected accounts.">
            <div>hi</div>
        </Section>
    );
}
