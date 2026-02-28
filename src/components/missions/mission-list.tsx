"use client";

import { MissionCard } from "./mission-card";

type Mission = {
  id: string;
  category: "language" | "sensory" | "cognitive";
  title: string;
  description: string;
  instructions: string;
};

type Props = {
  missions: Mission[];
  childId: string | null;
  completedMissionIds: string[];
};

export function MissionList({ missions, childId, completedMissionIds }: Props) {
  if (!childId) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <p className="text-4xl mb-3">👶</p>
        <p className="font-medium text-foreground">No child registered yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Go to Settings to add your child&apos;s information first.
        </p>
      </div>
    );
  }

  if (missions.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <p className="text-4xl mb-3">📚</p>
        <p className="font-medium text-foreground">No missions available</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Missions will be added soon. Check back later!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {missions.map((mission) => (
        <MissionCard
          key={mission.id}
          mission={mission}
          childId={childId}
          isCompleted={completedMissionIds.includes(mission.id)}
        />
      ))}
    </div>
  );
}
