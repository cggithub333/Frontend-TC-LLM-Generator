/**
 * Team Stats Cards Component
 * Displays project team statistics in card format
 */

import { Users, CheckSquare } from "lucide-react";
import type { ProjectTeamStats } from "@/types/team.types";

interface TeamStatsCardsProps {
  stats: ProjectTeamStats;
}

export function TeamStatsCards({ stats }: TeamStatsCardsProps) {
  return (
    <div className="flex flex-wrap gap-6 mb-8">
      {/* Project Members Card */}
      <div className="flex-1 min-w-[200px] flex flex-col gap-2 rounded-xl p-6 bg-card border border-border shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            Project Members
          </p>
          <Users className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <p className="text-3xl font-bold">
          {stats.totalMembers}
        </p>
      </div>

      {/* Available Slots Card */}
      <div className="flex-1 min-w-[200px] flex flex-col gap-2 rounded-xl p-6 bg-card border border-border shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            Available Slots
          </p>
          <CheckSquare className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <p className="text-3xl font-bold">
          {stats.availableSlots}
        </p>
      </div>
    </div>
  );
}
