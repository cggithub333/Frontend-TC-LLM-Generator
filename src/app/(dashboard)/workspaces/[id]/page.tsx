"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProjectsByWorkspace } from "@/hooks/use-projects";
import { useWorkspace } from "@/hooks/use-workspaces";
import { useCurrentUser } from "@/hooks/use-auth";
import { useWorkspaceMembers } from "@/hooks/use-workspace-members";
import { useWorkspaceAccessGuard } from "@/hooks/use-workspace-access-guard";
import { toast } from "sonner";
import { filterProjectsByQuery } from "@/lib/utils/project.utils";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/use-websocket";
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

// Sort & filter types
type SortKey = "name" | "updatedAt" | "status";
type SortDir = "asc" | "desc";
type StatusFilter = "all" | "ACTIVE" | "ARCHIVED";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "updatedAt", label: "Last Updated" },
  { value: "name", label: "Name (A–Z)" },
  { value: "status", label: "Status" },
];

export default function WorkspaceDetailPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const router = useRouter();

  // Search, sort & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { data: user } = useCurrentUser();

  const {
    data: workspace,
    isLoading: workspaceLoading,
    error: workspaceError,
    refetch: refetchWorkspace,
  } = useWorkspace(workspaceId);

  const {
    data: projectsResult,
    isLoading: projectsLoading,
    error: projectsError,
    refetch: refetchProjects,
  } = useProjectsByWorkspace(workspaceId);

  const queryClient = useQueryClient();

  // Subscribe to real-time project events for this workspace
  useWebSocket<EntityEvent>({
    topic: `/topic/workspaces/${workspaceId}/projects`,
    onMessage: (event) => {
      console.log("[WS] Project event:", event.action, event.entityId);
      queryClient.invalidateQueries({
        queryKey: ["projects", "workspace", workspaceId],
      });
    },
  });

  const projects = projectsResult?.items;
  const isLoading = workspaceLoading || projectsLoading;
  const hasError = workspaceError || projectsError;
  const isOwner = workspace?.ownerUserId === user?.id;

  // Check if current user is Admin via workspace members
  const { data: membersResult } = useWorkspaceMembers(workspaceId);
  const currentUserMember = (membersResult?.items ?? []).find((m: { userId: string }) => m.userId === user?.id);
  const isAdmin = currentUserMember?.role === "Admin";
  const canManage = isOwner || isAdmin;

  // Redirect if user lost access to workspace (e.g. removed by owner)
  useEffect(() => {
    if (!workspaceLoading && !projectsLoading && (workspaceError || projectsError)) {
      const errorMsg = workspaceError?.message || projectsError?.message || "";
      if (
        errorMsg.includes("do not have access") ||
        errorMsg.includes("not a member") ||
        errorMsg.includes("Forbidden") ||
        errorMsg.includes("403")
      ) {
        toast.error("You have been removed from this workspace", {
          description: "Redirecting to your workspaces...",
          duration: 4000,
        });
        router.replace("/workspaces");
      }
    }
  }, [workspaceError, projectsError, workspaceLoading, projectsLoading, router]);

  // Polling fallback: periodically checks membership, redirects if removed
  useWorkspaceAccessGuard(workspaceId);

  // Filter by search + status, then sort
  const filteredProjects = useMemo(() => {
    if (!projects) return [];

    // 1. Search filter
    let result = filterProjectsByQuery(projects, searchQuery);

    // 2. Status filter
    if (statusFilter !== "all") {
      result = result.filter(
        (p) => p.status.toUpperCase() === statusFilter
      );
    }

    // 3. Sort
    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "updatedAt":
          cmp =
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [projects, searchQuery, statusFilter, sortKey, sortDir]);

  const toggleSortDir = () => {
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  };

  // Active filter count for reset button
  const activeFilterCount =
    (searchQuery.trim() ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (sortKey !== "updatedAt" ? 1 : 0);

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
    refetchWorkspace();
    refetchProjects();
  }, [refetchWorkspace, refetchProjects]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("all");
  }, []);

  let content;

  if (hasError) {
    content = <ErrorState onRetry={handleRetry} />;
  } else if (isLoading) {
    content = <LoadingSkeleton />;
  } else if (!projects || projects.length === 0) {
    // Workspace has zero projects
    content = <EmptyState onCreateProject={handleCreateProject} />;
  } else if (filteredProjects.length === 0) {
    // Search/filter returned no results
    content = (
      <div className="p-8">
        <EmptyState
          isSearchResult
          searchQuery={searchQuery}
          onCreateProject={handleCreateProject}
          onClearSearch={handleClearSearch}
        />
      </div>
    );
  } else {
    content = (
      <main className="p-8">
        {/* Control Bar: Search + Sort + Status Filter */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Search — primary action, placed left-most */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm">
            <div className="flex w-full items-stretch rounded-lg h-9 border border-input dark:border-white/10 bg-background dark:bg-muted/50">
              <div className="text-muted-foreground flex items-center justify-center pl-3">
                <Search className="h-4 w-4" aria-hidden="true" />
              </div>
              <Input
                type="search"
                className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-3 text-sm h-full"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search projects"
              />
            </div>
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <Select value={sortKey} onValueChange={(val) => setSortKey(val as SortKey)}>
              <SelectTrigger className="w-[160px] h-8 bg-transparent border-border" aria-label="Sort projects by">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              onClick={toggleSortDir}
              className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              aria-label={`Sort ${sortDir === "asc" ? "descending" : "ascending"}`}
              title={sortDir === "asc" ? "Oldest first" : "Newest first"}
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>

          {/* Status filter pills */}
          <div className="flex items-center gap-1">
            {(["all", "ACTIVE", "ARCHIVED"] as StatusFilter[]).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                  statusFilter === status
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "bg-muted text-muted-foreground hover:bg-accent border border-transparent"
                }`}
              >
                {status === "all" ? "All" : status === "ACTIVE" ? "Active" : "Archived"}
              </button>
            ))}
          </div>

          {/* Active filter indicator + count */}
          <div className="flex items-center gap-3 ml-auto">
            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  setSortKey("updatedAt");
                  setSortDir("desc");
                  setStatusFilter("all");
                  setSearchQuery("");
                }}
                className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
              >
                Reset filters
              </button>
            )}
            <span className="text-xs text-muted-foreground">
              {filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.projectId}
              project={project}
              isCreator={project.createdByUserId === user?.id}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
            />
          ))}
          {canManage && <CreateProjectCard onClick={handleCreateProject} />}
        </div>
      </main>
    );
  }

  return (
    <>
      <WorkspaceHeader
        workspace={workspace}
        isOwner={isOwner}
        projectCount={projects?.length ?? 0}
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
