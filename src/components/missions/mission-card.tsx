"use client";

import { useState } from "react";
import { Check, SkipForward, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type Props = {
  mission: {
    id: string;
    category: "language" | "sensory" | "cognitive";
    title: string;
    description: string;
    instructions: string;
  };
  childId: string | null;
  isCompleted?: boolean;
};

const categoryConfig = {
  language: { emoji: "🗣️", color: "border-orange-200 bg-orange-50" },
  sensory: { emoji: "🎨", color: "border-green-200 bg-green-50" },
  cognitive: { emoji: "🧩", color: "border-blue-200 bg-blue-50" },
};

export function MissionCard({ mission, childId, isCompleted = false }: Props) {
  const [status, setStatus] = useState<"idle" | "completed" | "skipped">(
    isCompleted ? "completed" : "idle"
  );
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const config = categoryConfig[mission.category];

  async function handleAction(actionStatus: "completed" | "skipped") {
    if (!childId || loading) return;
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.from("mission_logs").insert({
      child_id: childId,
      mission_id: mission.id,
      status: actionStatus,
    });

    if (!error) {
      setStatus(actionStatus);
    }
    setLoading(false);
  }

  return (
    <div
      className={cn(
        "rounded-2xl border p-5 transition-all",
        status === "completed"
          ? "border-green-300 bg-green-50 opacity-80"
          : status === "skipped"
            ? "border-border bg-muted opacity-60"
            : config.color
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{config.emoji}</span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {mission.category}
            </p>
            <h3 className="text-base font-semibold text-foreground">
              {mission.title}
            </h3>
          </div>
        </div>
        {status === "completed" && (
          <div className="rounded-full bg-green-500 p-1">
            <Check className="h-4 w-4 text-white" />
          </div>
        )}
      </div>

      {/* Description */}
      <p className="mb-3 text-sm text-muted-foreground">
        {mission.description}
      </p>

      {/* Expandable Instructions */}
      {expanded && (
        <div className="mb-4 rounded-xl bg-white/60 p-4 text-sm leading-relaxed text-foreground">
          <p className="mb-1 font-medium">How to do it:</p>
          {mission.instructions}
        </div>
      )}

      {/* Actions */}
      {status === "idle" && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            {expanded ? "Hide steps" : "Show steps"}
          </button>
          <button
            onClick={() => handleAction("completed")}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Check className="h-4 w-4" /> Done
              </>
            )}
          </button>
          <button
            onClick={() => handleAction("skipped")}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            <SkipForward className="h-4 w-4" /> Skip
          </button>
        </div>
      )}

      {status !== "idle" && (
        <p className="text-sm font-medium text-muted-foreground">
          {status === "completed" ? "✅ Completed!" : "⏭️ Skipped"}
        </p>
      )}
    </div>
  );
}
