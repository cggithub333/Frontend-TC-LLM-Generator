/**
 * CreateProjectCard Component
 * Flat tint CTA card following Gold Standard pattern
 */

import { Plus } from "lucide-react";

interface CreateProjectCardProps {
  onClick: () => void;
}

export function CreateProjectCard({ onClick }: CreateProjectCardProps) {
  return (
    <button
      className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/25 bg-primary/[0.02] p-5 hover:border-primary/50 hover:bg-primary/[0.06] transition-all duration-200 h-full min-h-[240px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      onClick={onClick}
      aria-label="Create new project"
    >
      <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors duration-200">
        <Plus className="h-6 w-6 text-primary group-hover:rotate-90 transition-transform duration-200" />
      </div>
      <h3 className="text-sm font-semibold text-foreground/80 group-hover:text-primary transition-colors duration-150">
        New Project
      </h3>
    </button>
  );
}
