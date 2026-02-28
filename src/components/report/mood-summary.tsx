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

const moodScore: Record<string, number> = {
  great: 5,
  good: 4,
  neutral: 3,
  bad: 2,
  awful: 1,
};

export function MoodSummary({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-foreground">
          Mood This Week
        </h3>
        <p className="text-sm text-muted-foreground">
          No mood records this week.
        </p>
      </div>
    );
  }

  // 평균 무드 점수
  const avgScore =
    entries.reduce((sum, e) => sum + (moodScore[e.mood] ?? 3), 0) /
    entries.length;

  // 가장 많은 무드
  const moodCounts: Record<string, number> = {};
  entries.forEach((e) => {
    moodCounts[e.mood] = (moodCounts[e.mood] ?? 0) + 1;
  });
  const dominantMood = Object.entries(moodCounts).sort(
    (a, b) => b[1] - a[1]
  )[0][0];

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-foreground">
        Mood This Week
      </h3>

      {/* 요일별 이모지 */}
      <div className="mb-4 flex justify-between">
        {entries.map((entry) => {
          const dayName = new Date(entry.logged_date).toLocaleDateString(
            "en",
            { weekday: "short" }
          );
          return (
            <div key={entry.logged_date} className="flex flex-col items-center gap-1">
              <span className="text-xs text-muted-foreground">{dayName}</span>
              <span className="text-2xl">{moodEmoji[entry.mood] ?? "·"}</span>
            </div>
          );
        })}
      </div>

      {/* 요약 */}
      <div className="flex items-center justify-between rounded-xl bg-muted p-4">
        <div>
          <p className="text-sm text-muted-foreground">Average mood</p>
          <p className="text-lg font-semibold">{avgScore.toFixed(1)} / 5.0</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Most common</p>
          <p className="text-3xl">{moodEmoji[dominantMood]}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Days recorded</p>
          <p className="text-lg font-semibold">{entries.length} / 7</p>
        </div>
      </div>
    </div>
  );
}
