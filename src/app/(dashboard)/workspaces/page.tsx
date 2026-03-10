"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useProjects } from "@/hooks/use-projects";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { filterProjectsByQuery } from "@/lib/utils/project.utils";

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

  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const {
    data: workspacesResult,
    isLoading: workspacesLoading,
    error: workspacesError,
    refetch: refetchWorkspaces,
  } = useWorkspaces();

  const {
    data: projectsResult,
    isLoading: projectsLoading,
    error: projectsError,
    refetch: refetchProjects,
  } = useProjects();

  const currentWorkspace = workspacesResult?.items?.[0];
  const projects = projectsResult?.items;
  const isLoading = workspacesLoading || projectsLoading;
  const hasError = workspacesError || projectsError;

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return filterProjectsByQuery(projects, searchQuery);
  }, [projects, searchQuery]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCreateProject = useCallback(() => {
    setCreateDialogOpen(true);
  }, []);

  const handleManageTeam = useCallback(
    (projectId: string) => {
      router.push(`/projects/${projectId}/team`);
    },
    [router]
  );

  const handleViewDetails = useCallback((projectId: string) => {
    router.push(`/projects/${projectId}`);
  }, [router]);

  const handleMenuClick = useCallback((_projectId: string) => {
    // TODO: Open project menu
  }, []);

  const handleRetry = useCallback(() => {
    refetchWorkspaces();
    refetchProjects();
  }, [refetchWorkspaces, refetchProjects]);

  let content;

  if (hasError) {
    content = <ErrorState onRetry={handleRetry} />;
  } else if (isLoading) {
    content = <LoadingSkeleton />;
  } else if (!filteredProjects || filteredProjects.length === 0) {
    const isSearching = searchQuery.trim().length > 0;
    content = isSearching ? (
      <div className="p-8">
        <EmptyState onCreateProject={handleCreateProject} />
      </div>
    ) : (
      <EmptyState onCreateProject={handleCreateProject} />
    );
  } else {
    content = (
      <main className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.projectId}
              project={project}
              onManageTeam={handleManageTeam}
              onViewDetails={handleViewDetails}
              onMenuClick={handleMenuClick}
            />
          ))}
          <CreateProjectCard onClick={handleCreateProject} />
        </div>
      </main>
    );
  }

  return (
    <>
      <WorkspaceHeader
        workspace={currentWorkspace}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onCreateProject={handleCreateProject}
      />

      {content}

      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        workspaceId={currentWorkspace?.workspaceId || ""}
        onSuccess={() => {
          refetchProjects();
        }}
      />
    </>
  );
}
