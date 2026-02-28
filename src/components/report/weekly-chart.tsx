"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type DayData = {
  day: string;
  language: number;
  sensory: number;
  cognitive: number;
};

type Props = {
  data: DayData[];
};

export function WeeklyChart({ data }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-foreground">
        Missions Completed This Week
      </h3>

      {data.every((d) => d.language + d.sensory + d.cognitive === 0) ? (
        <div className="flex h-48 items-center justify-center text-muted-foreground">
          No data yet. Complete missions to see your progress!
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" />
            <XAxis
              dataKey="day"
              tick={{ fill: "#8A8580", fontSize: 12 }}
              axisLine={{ stroke: "#E8E0D8" }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "#8A8580", fontSize: 12 }}
              axisLine={{ stroke: "#E8E0D8" }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #E8E0D8",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            />
            <Legend />
            <Bar
              dataKey="language"
              name="Language"
              fill="#FF8B5E"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="sensory"
              name="Sensory"
              fill="#6CB4A0"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="cognitive"
              name="Cognitive"
              fill="#5B9BD5"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
