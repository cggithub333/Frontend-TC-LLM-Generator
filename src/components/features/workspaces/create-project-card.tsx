/**
 * CreateProjectCard Component
 * Premium call-to-action card for creating new projects
 */

import { Plus } from "lucide-react";

interface CreateProjectCardProps {
  onClick: () => void;
}

export function CreateProjectCard({ onClick }: CreateProjectCardProps) {
  return (
    <button
      className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/50 p-6 hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 h-full min-h-[240px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      onClick={onClick}
      aria-label="Create new project"
    >
      {/* Glow ring on hover */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5" />
      <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
        <Plus className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-base font-bold text-foreground/80 group-hover:text-primary transition-colors mb-1">
        Create New Project
      </h3>
      <p className="text-xs text-center text-muted-foreground max-w-[200px]">
        Set up a new QA environment for your team
      </p>
    </button>
  );
}
