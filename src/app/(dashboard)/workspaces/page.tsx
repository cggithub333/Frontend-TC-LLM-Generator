"use client";

/**
 * Workspaces Page
 * Main workspace view displaying projects in a grid layout
 * Follows clean architecture patterns and component composition
 */

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useProjects } from "@/hooks/use-projects";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { filterProjectsByQuery } from "@/lib/utils/project.utils";

// Feature components
import {
  WorkspaceHeader,
  ProjectCard,
  CreateProjectCard,
  EmptyState,
  LoadingSkeleton,
  ErrorState,
  CreateProjectDialog,
} from "@/components/features/workspaces";

export default function WorkspacesPage() {
  const router = useRouter();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Data fetching
  const {
    data: workspaces,
    isLoading: workspacesLoading,
    error: workspacesError,
    refetch: refetchWorkspaces
  } = useWorkspaces();

  const {
    data: projects,
    isLoading: projectsLoading,
    error: projectsError,
    refetch: refetchProjects
  } = useProjects();

  // Computed values
  const currentWorkspace = workspaces?.[0];
  const isLoading = workspacesLoading || projectsLoading;
  const hasError = workspacesError || projectsError;

  // Memoized filtered projects
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return filterProjectsByQuery(projects, searchQuery);
  }, [projects, searchQuery]);

  // Event handlers
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCreateProject = useCallback(() => {
    setCreateDialogOpen(true);
  }, []);

  const handleManageTeam = useCallback(
    (projectId: number) => {
      router.push(`/projects/${projectId}/team`);
    },
    [router]
  );

  const handleViewDetails = useCallback((projectId: number) => {
    // TODO: Navigate to project details page
    console.log("View details for project:", projectId);
  }, []);

  const handleMenuClick = useCallback((projectId: number) => {
    // TODO: Open project menu
    console.log("Menu clicked for project:", projectId);
  }, []);

  const handleRetry = useCallback(() => {
    refetchWorkspaces();
    refetchProjects();
  }, [refetchWorkspaces, refetchProjects]);

  // Render error state
  if (hasError) {
    return (
      <>
        <WorkspaceHeader
          workspace={currentWorkspace}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onCreateProject={handleCreateProject}
        />
        <ErrorState onRetry={handleRetry} />
      </>
    );
  }

  // Render loading state
  if (isLoading) {
    return (
      <>
        <WorkspaceHeader
          workspace={currentWorkspace}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onCreateProject={handleCreateProject}
        />
        <LoadingSkeleton />
      </>
    );
  }

  // Render empty state
  if (!filteredProjects || filteredProjects.length === 0) {
    const isSearching = searchQuery.trim().length > 0;

    return (
      <>
        <WorkspaceHeader
          workspace={currentWorkspace}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onCreateProject={handleCreateProject}
        />
        {isSearching ? (
          <div className="p-8">
            <EmptyState onCreateProject={handleCreateProject} />
          </div>
        ) : (
          <EmptyState onCreateProject={handleCreateProject} />
        )}
      </>
    );
  }

  // Render projects grid
  return (
    <>
      <WorkspaceHeader
        workspace={currentWorkspace}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onCreateProject={handleCreateProject}
      />

      <main className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Project Cards */}
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onManageTeam={handleManageTeam}
              onViewDetails={handleViewDetails}
              onMenuClick={handleMenuClick}
            />
          ))}

          {/* Create New Project Card */}
          <CreateProjectCard onClick={handleCreateProject} />
        </div>
      </main>

      {/* Create Project Dialog */}
      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        workspaceId={currentWorkspace?.id || 1}
        onSuccess={() => {
          // Refetch projects after successful creation
          refetchProjects();
        }}
      />
    </>
  );
}
