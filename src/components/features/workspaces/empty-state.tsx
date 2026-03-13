/**
 * EmptyState Component
 * Displayed when no projects are found — contextual messaging
 */

import { FolderOpen, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateProject: () => void;
  isSearchResult?: boolean;
  searchQuery?: string;
  onClearSearch?: () => void;
}

export function EmptyState({
  onCreateProject,
  isSearchResult = false,
  searchQuery = "",
  onClearSearch,
}: EmptyStateProps) {
  if (isSearchResult) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="size-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <SearchX className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold mb-2">No projects found</h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          {searchQuery
            ? `No results for "${searchQuery}". Try a different search term.`
            : "No projects match your current filters."}
        </p>
        {onClearSearch && (
          <Button variant="outline" onClick={onClearSearch}>
            Clear Search
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="size-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <FolderOpen className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-bold mb-2">No projects yet</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Get started by creating your first project to organize your test cases and stories.
      </p>
      <Button onClick={onCreateProject} size="lg">
        Create Your First Project
      </Button>
    </div>
  );
}
