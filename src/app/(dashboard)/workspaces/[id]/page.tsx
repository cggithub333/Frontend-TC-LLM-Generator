"use client";

import { useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { useProjectsByWorkspace } from "@/hooks/use-projects";
import { useWorkspace } from "@/hooks/use-workspaces";
import { useCurrentUser } from "@/hooks/use-auth";
import { filterProjectsByQuery } from "@/lib/utils/project.utils";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/use-websocket";

interface EntityEvent {
  entityType: string;
  action: "CREATED" | "UPDATED" | "DELETED";
  entityId: string;
  parentId?: string;
  payload?: unknown;
  performedBy: string;
}

import {
  WorkspaceHeader,
  ProjectCard,
  CreateProjectCard,
  EmptyState,
  LoadingSkeleton,
  ErrorState,
  CreateProjectDialog,
  EditProjectDialog,
  DeleteProjectDialog,
} from "@/components/features/workspaces";
import type { Project } from "@/types/workspace.types";

export default function WorkspaceDetailPage() {
  const params = useParams();
  const workspaceId = params.id as string;

  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { data: user } = useCurrentUser();

  const {
    data: workspace,
    isLoading: workspaceLoading,
    error: workspaceError,
  } = useWorkspace(workspaceId);

  const {
    data: projectsResult,
    isLoading: projectsLoading,
    error: projectsError,
  } = useProjectsByWorkspace(workspaceId);

  const queryClient = useQueryClient();

  // Subscribe to real-time project events for this workspace
  useWebSocket<EntityEvent>({
    topic: `/topic/workspaces/${workspaceId}/projects`,
    onMessage: (event) => {
      console.log("[WS] Project event:", event.action, event.entityId);
      // Invalidate project queries to trigger re-fetch
      queryClient.invalidateQueries({
        queryKey: ["projects", "workspace", workspaceId],
      });
    },
  });

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

  const handleEditProject = useCallback((project: Project) => {
    setSelectedProject(project);
    setEditDialogOpen(true);
  }, []);

  const handleDeleteProject = useCallback((project: Project) => {
    setSelectedProject(project);
    setDeleteDialogOpen(true);
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
              isCreator={project.createdByUserId === user?.id}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
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
      />

      {content}

      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        workspaceId={workspaceId}
      />

      <EditProjectDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        project={selectedProject}
      />

      <DeleteProjectDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        project={selectedProject}
      />
    </>
  );
}
