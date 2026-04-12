type WeekStart = "sunday" | "monday" | "saturday";
type DateFormat = "MM/DD" | "DD/MM";
type TimeFormat = "12h" | "24h";

export type UserSettings = {
    timezone: string;
    week_start: WeekStart;
    date_format: DateFormat;
    time_format: TimeFormat;
    split_screen: boolean;
    auto_rollover: boolean;
    def_event_mins: number;
    def_notify_mins: number;
    keybinds: Record<string, string>;
};
