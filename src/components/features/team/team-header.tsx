/**
 * Team Header Component
 * Displays breadcrumb navigation, page title, search bar, and invite member button
 */

import { Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Project } from "@/types/workspace.types";

interface TeamHeaderProps {
  project: Project;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onInviteMember: () => void;
}

export function TeamHeader({
  project,
  searchQuery,
  onSearchChange,
  onInviteMember,
}: TeamHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-8 py-4 sticky top-0 z-10">
      <div className="flex flex-col gap-1">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap gap-2" aria-label="Breadcrumb">
          <a
            href="/workspaces"
            className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Workspace
          </a>
          <span className="text-xs font-medium text-muted-foreground" aria-hidden="true">
            /
          </span>
          <a
            href={`/projects/${project.id}`}
            className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            {project.name}
          </a>
          <span className="text-xs font-medium text-muted-foreground" aria-hidden="true">
            /
          </span>
          <span className="text-xs font-medium">
            Team
          </span>
        </nav>

        {/* Title */}
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">
            Project Team Management
          </h2>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <label className="flex flex-col min-w-64">
          <div className="flex w-full items-stretch rounded-lg h-10 border border-input bg-background">
            <div className="text-muted-foreground flex items-center justify-center pl-3">
              <Search className="h-5 w-5" aria-hidden="true" />
            </div>
            <Input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search project members..."
              className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-3 text-sm"
              aria-label="Search project members"
            />
          </div>
        </label>

        {/* Invite Member Button */}
        <Button
          onClick={onInviteMember}
          className="h-10 px-5 gap-2"
          aria-label="Invite new member to project"
        >
          <UserPlus className="h-5 w-5" aria-hidden="true" />
          <span>Invite Member</span>
        </Button>
      </div>
    </header>
  );
}
