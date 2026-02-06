/**
 * CreateProjectCard Component
 * Call-to-action card for creating new projects
 */

import { Plus } from "lucide-react";

interface CreateProjectCardProps {
  onClick: () => void;
}

export function CreateProjectCard({ onClick }: CreateProjectCardProps) {
  return (
    <button
      className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 p-6 hover:border-primary hover:bg-primary/5 transition-all h-full min-h-[240px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      onClick={onClick}
      aria-label="Create new project"
    >
      <div className="size-16 rounded-full bg-card flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
        <Plus className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
      </div>
      <h3 className="font-bold text-base mb-1">Create New Project</h3>
      <p className="text-sm text-center text-muted-foreground max-w-[200px]">
        Set up a new QA environment for your team
      </p>
    </button>
  );
}
