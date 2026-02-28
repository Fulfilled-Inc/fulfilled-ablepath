"use client";

type MoodEntry = {
  logged_date: string;
  mood: string;
};

type Props = {
  entries: MoodEntry[];
};

const moodEmoji: Record<string, string> = {
  great: "😄",
  good: "🙂",
  neutral: "😐",
  bad: "😟",
  awful: "😢",
};

export function MoodCalendar({ entries }: Props) {
  // 최근 30일 표시
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split("T")[0];
  });

  const entryMap = new Map(entries.map((e) => [e.logged_date, e.mood]));

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-foreground">
        Last 30 Days
      </h3>
      <div className="grid grid-cols-7 gap-2">
        {/* Day labels */}
        {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
          <div
            key={i}
            className="text-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}

        {/* Mood cells */}
        {days.map((date) => {
          const mood = entryMap.get(date);
          const isToday = date === new Date().toISOString().split("T")[0];

          return (
            <div
              key={date}
              className={`flex h-10 items-center justify-center rounded-lg text-lg ${
                isToday ? "ring-2 ring-primary ring-offset-1" : ""
              } ${mood ? "bg-muted" : "bg-background"}`}
              title={`${date}: ${mood ?? "no record"}`}
            >
              {mood ? moodEmoji[mood] ?? "·" : "·"}
            </div>
          );
        })}
      </div>
    </div>
  );
}
