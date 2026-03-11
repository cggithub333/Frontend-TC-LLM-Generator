"use client";

import { useState, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/use-auth";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useWebSocket } from "@/hooks/use-websocket";
import {
  WorkspaceCard,
  CreateWorkspaceDialog,
  EditWorkspaceDialog,
  DeleteWorkspaceDialog,
  LoadingSkeleton,
  ErrorState,
} from "@/components/features/workspaces";
import { Search, Plus, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Workspace } from "@/types/workspace.types";

interface WorkspaceEvent {
  action: "CREATED" | "UPDATED" | "DELETED";
  workspace: Workspace | null;
  workspaceId: string;
  performedBy: string;
}

export default function WorkspacesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);

  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();
  const {
    data: workspacesResult,
    isLoading,
    error,
    refetch,
  } = useWorkspaces();

  // Subscribe to real-time workspace events
  const { status: wsStatus } = useWebSocket<WorkspaceEvent>({
    topic: "/topic/workspaces",
    onMessage: (event) => {
      console.log("[WS] Workspace event:", event.action, event.workspaceId);
      // Invalidate workspace queries to trigger re-fetch
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });

  const workspaces = workspacesResult?.items;

  const filteredWorkspaces = useMemo(() => {
    if (!workspaces) return [];
    if (!searchQuery.trim()) return workspaces;
    const q = searchQuery.toLowerCase();
    return workspaces.filter(
      (ws) =>
        ws.name.toLowerCase().includes(q) ||
        ws.description?.toLowerCase().includes(q)
    );
  }, [workspaces, searchQuery]);

  const handleEdit = useCallback((workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setEditOpen(true);
  }, []);

  const handleDelete = useCallback((workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setDeleteOpen(true);
  }, []);

  const handleSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  let content;

  if (error) {
    content = <ErrorState onRetry={refetch} />;
  } else if (isLoading) {
    content = <LoadingSkeleton />;
  } else if (!filteredWorkspaces || filteredWorkspaces.length === 0) {
    content = (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="size-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <LayoutDashboard className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold mb-2">
          {searchQuery.trim()
            ? "No workspaces found"
            : "No workspaces yet"}
        </h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          {searchQuery.trim()
            ? "Try a different search query."
            : "Create your first workspace to start organizing your projects and test cases."}
        </p>
        {!searchQuery.trim() && (
          <Button onClick={() => setCreateOpen(true)} size="lg">
            Create Your First Workspace
          </Button>
        )}
      </div>
    );
  } else {
    content = (
      <main className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredWorkspaces.map((workspace) => (
            <WorkspaceCard
              key={workspace.workspaceId}
              workspace={workspace}
              isOwner={workspace.ownerUserId === user?.id}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
          {/* Create Workspace Card */}
          <button
            onClick={() => setCreateOpen(true)}
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/50 p-6 shadow-sm hover:shadow-md hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer min-h-[220px]"
            aria-label="Create new workspace"
          >
            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <span className="text-sm font-bold text-muted-foreground">
              Create Workspace
            </span>
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-card px-8 py-4 sticky top-0 z-10">
        <div className="flex flex-col gap-1">
          <nav className="flex flex-wrap gap-2" aria-label="Breadcrumb">
            <span className="text-xs font-medium">My Workspaces</span>
          </nav>
          <h2 className="text-xl font-bold">Workspaces</h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <label className="flex flex-col min-w-64">
            <div className="flex w-full items-stretch rounded-lg h-10 border border-input bg-background">
              <div className="text-muted-foreground flex items-center justify-center pl-3">
                <Search className="h-5 w-5" aria-hidden="true" />
              </div>
              <Input
                type="search"
                className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-3 text-sm"
                placeholder="Search workspaces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search workspaces"
              />
            </div>
          </label>

          {/* Create Button */}
          <Button
            className="h-10 px-5 gap-2"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-5 w-5" />
            <span>New Workspace</span>
          </Button>
        </div>
      </header>

      {content}

      {/* Dialogs */}
      <CreateWorkspaceDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={handleSuccess}
      />
      <EditWorkspaceDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        workspace={selectedWorkspace}
        onSuccess={handleSuccess}
      />
      <DeleteWorkspaceDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        workspace={selectedWorkspace}
        onSuccess={handleSuccess}
      />
    </>
  );
}
