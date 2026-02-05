/**
 * WorkspaceHeader Component
 * Displays workspace breadcrumb, title, search, and create button
 */

import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Workspace } from "@/types/workspace.types";

interface WorkspaceHeaderProps {
  workspace?: Workspace;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateProject: () => void;
}

export function WorkspaceHeader({
  workspace,
  searchQuery,
  onSearchChange,
  onCreateProject,
}: WorkspaceHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-8 py-4 sticky top-0 z-10">
      {/* Left Section - Breadcrumb & Title */}
      <div className="flex flex-col gap-1">
        <nav className="flex flex-wrap gap-2" aria-label="Breadcrumb">
          <a
            href="#"
            className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Workspaces
          </a>
          <span className="text-xs font-medium text-muted-foreground" aria-hidden="true">
            /
          </span>
          <span className="text-xs font-medium">Owner View</span>
        </nav>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">
            {workspace?.name || "My Workspace"}
          </h2>
        </div>
      </div>

      {/* Right Section - Search & Create Button */}
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <label className="flex flex-col min-w-64">
          <div className="flex w-full items-stretch rounded-lg h-10 border border-input bg-background">
            <div className="text-muted-foreground flex items-center justify-center pl-3">
              <Search className="h-5 w-5" aria-hidden="true" />
            </div>
            <Input
              type="search"
              className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-3 text-sm"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search projects"
            />
          </div>
        </label>

        {/* Create Project Button */}
        <Button
          className="h-10 px-5 gap-2"
          onClick={onCreateProject}
          aria-label="Create new project"
        >
          <Plus className="h-5 w-5" aria-hidden="true" />
          <span>Create Project</span>
        </Button>
      </div>
    </header>
  );
}
