import { type UserSettings } from "@/types/settings";
import Section from "@/components/settings/Section";
import { SkeletonBlock, SkeletonInput } from "@/components/ui/SkeletonLoad";

const TIMEZONES = Intl.supportedValuesOf("timeZone");

export default function PreferencesSection({
    draft,
    onChange,
}: {
    draft: UserSettings | null;
    onChange: (next: UserSettings) => void;
}) {
    const loading = !draft;

    const update = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
        if (!draft) return;
        onChange({ ...draft, [key]: value });
    };

    const selectClasses =
        "w-full px-3 py-2 bg-bg border border-border rounded text-text focus:outline-none focus:border-brand";
    const inputClasses = selectClasses;

    return (
        <Section title="Preferences" description="Customize how AskJet works for you.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text mb-1">Timezone</label>
                    {loading ? (
                        <SkeletonInput />
                    ) : (
                        <select
                            value={draft.timezone}
                            onChange={(e) => update("timezone", e.target.value)}
                            className={selectClasses}
                        >
                            {TIMEZONES.map((tz) => (
                                <option key={tz} value={tz}>
                                    {tz.replace(/_/g, " ")}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-text mb-1">
                        Week starts on
                    </label>
                    {loading ? (
                        <SkeletonInput />
                    ) : (
                        <select
                            value={draft.week_start}
                            onChange={(e) =>
                                update("week_start", e.target.value as UserSettings["week_start"])
                            }
                            className={selectClasses}
                        >
                            <option value="sunday">Sunday</option>
                            <option value="monday">Monday</option>
                            <option value="saturday">Saturday</option>
                        </select>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-text mb-1">Date format</label>
                    {loading ? (
                        <SkeletonInput />
                    ) : (
                        <select
                            value={draft.date_format}
                            onChange={(e) =>
                                update("date_format", e.target.value as UserSettings["date_format"])
                            }
                            className={selectClasses}
                        >
                            <option value="MM/DD">12/31 (MM/DD)</option>
                            <option value="DD/MM">31/12 (DD/MM)</option>
                        </select>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-text mb-1">Time format</label>
                    {loading ? (
                        <SkeletonInput />
                    ) : (
                        <select
                            value={draft.time_format}
                            onChange={(e) =>
                                update("time_format", e.target.value as UserSettings["time_format"])
                            }
                            className={selectClasses}
                        >
                            <option value="12h">1:00 PM</option>
                            <option value="24h">13:00</option>
                        </select>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-text mb-1">
                        Default event duration (mins)
                    </label>
                    {loading ? (
                        <SkeletonInput />
                    ) : (
                        <input
                            type="number"
                            value={draft.def_event_mins}
                            onChange={(e) =>
                                update("def_event_mins", parseInt(e.target.value) || 0)
                            }
                            min={5}
                            max={480}
                            className={inputClasses}
                        />
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-text mb-1">
                        Default notification (mins before)
                    </label>
                    {loading ? (
                        <SkeletonInput />
                    ) : (
                        <input
                            type="number"
                            value={draft.def_notify_mins}
                            onChange={(e) =>
                                update("def_notify_mins", parseInt(e.target.value) || 0)
                            }
                            min={0}
                            max={10080}
                            className={inputClasses}
                        />
                    )}
                </div>
            </div>

            <div className="space-y-3 pt-2">
                <Toggle
                    label="Auto-rollover"
                    description="Automatically move incomplete tasks to the next day"
                    checked={draft?.auto_rollover ?? false}
                    onChange={(val) => update("auto_rollover", val)}
                    loading={loading}
                />
                <Toggle
                    label="Split-screen layout"
                    description="Show tasks and calendar side by side on desktop"
                    checked={draft?.split_screen ?? false}
                    onChange={(val) => update("split_screen", val)}
                    loading={loading}
                />
            </div>
        </Section>
    );
}

function Toggle({
    label,
    description,
    checked,
    onChange,
    loading,
}: {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (val: boolean) => void;
    loading: boolean;
}) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <div className="text-sm font-medium text-text">
                    {loading ? <SkeletonBlock className="h-4 w-32" /> : label}
                </div>
                {description && (
                    <div className="text-xs text-text-muted">
                        {loading ? <SkeletonBlock className="h-3 w-48 mt-1" /> : description}
                    </div>
                )}
            </div>
            {loading ? (
                <SkeletonBlock className="w-10 h-6 rounded-full" />
            ) : (
                <button
                    role="switch"
                    aria-checked={checked}
                    onClick={() => onChange(!checked)}
                    className={`relative w-10 h-6 rounded-full transition-colors hover:cursor-pointer ${
                        checked ? "bg-brand" : "bg-border"
                    }`}
                >
                    <span
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            checked ? "translate-x-4" : ""
                        }`}
                    />
                </button>
            )}
        </div>
    );
}
