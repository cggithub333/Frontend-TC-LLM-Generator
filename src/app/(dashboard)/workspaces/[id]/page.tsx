"use client";

import { useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProjectsByWorkspace } from "@/hooks/use-projects";
import { useWorkspace } from "@/hooks/use-workspaces";
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

export default function WorkspaceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.id as string;

  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const {
    data: workspace,
    isLoading: workspaceLoading,
    error: workspaceError,
  } = useWorkspace(workspaceId);

  const {
    data: projectsResult,
    isLoading: projectsLoading,
    error: projectsError,
    refetch: refetchProjects,
  } = useProjectsByWorkspace(workspaceId);

  const projects = projectsResult?.items;
  const isLoading = workspaceLoading || projectsLoading;
  const hasError = workspaceError || projectsError;

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

  const handleViewDetails = useCallback(
    (projectId: string) => {
      router.push(`/projects/${projectId}`);
    },
    [router]
  );

  const handleMenuClick = useCallback((_projectId: string) => {
    // TODO: Open project menu
  }, []);

  const handleRetry = useCallback(() => {
    // refetch
  }, []);

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
        workspace={workspace}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onCreateProject={handleCreateProject}
      />

      {content}

      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        workspaceId={workspaceId}
        onSuccess={() => {
          refetchProjects();
        }}
      />
    </>
  );
}
