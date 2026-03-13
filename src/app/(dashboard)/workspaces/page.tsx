"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
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
import {
  Search,
  Plus,
  LayoutDashboard,
  ArrowUpDown,
  SlidersHorizontal,
  Sparkles,
  ArrowRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Workspace } from "@/types/workspace.types";

/** Generic entity event from the centralized WebSocket broadcaster */
interface EntityEvent {
  entityType: string;
  action: "CREATED" | "UPDATED" | "DELETED";
  entityId: string;
  parentId?: string;
  payload?: unknown;
  performedBy: string;
}

type SortKey = "name" | "updatedAt" | "createdAt";
type SortDir = "asc" | "desc";
type RoleFilter = "all" | "owner" | "member";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "updatedAt", label: "Last Updated" },
  { value: "createdAt", label: "Created Date" },
  { value: "name", label: "Name (A-Z)" },
];

export default function WorkspacesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(
    null,
  );
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);

  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();
  const { data: workspacesResult, isLoading, error, refetch } = useWorkspaces();
  const router = useRouter();

  // Subscribe to real-time workspace events
  useWebSocket<EntityEvent>({
    topic: "/topic/workspaces",
    onMessage: (event) => {
      console.log("[WS] Workspace event:", event.action, event.entityId);
      // Invalidate workspace queries to trigger re-fetch
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });

  const workspaces = workspacesResult?.items;

  // P0: Auto-redirect if user has exactly 1 workspace
  useEffect(() => {
    if (!isLoading && workspaces && workspaces.length === 1 && !searchQuery.trim()) {
      router.replace(`/workspaces/${workspaces[0].workspaceId}`);
    }
  }, [workspaces, isLoading, searchQuery, router]);

  // Check if this is close to a first-time experience (no workspaces or just created first)
  const isFirstTime = !isLoading && workspaces && workspaces.length === 0;

  // Filtered + sorted workspaces
  const filteredWorkspaces = useMemo(() => {
    if (!workspaces) return [];

    let result = [...workspaces];

    // Role filter
    if (roleFilter !== "all" && user) {
      result = result.filter((ws) => {
        const isOwner = ws.ownerUserId === user.id;
        return roleFilter === "owner" ? isOwner : !isOwner;
      });
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (ws) =>
          ws.name.toLowerCase().includes(q) ||
          ws.description?.toLowerCase().includes(q),
      );
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") {
        cmp = a.name.localeCompare(b.name);
      } else if (sortKey === "updatedAt") {
        cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      } else if (sortKey === "createdAt") {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortDir === "desc" ? -cmp : cmp;
    });

    return result;
  }, [workspaces, searchQuery, sortKey, sortDir, roleFilter, user]);

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

  const toggleSortDir = () => {
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  };

  // Active filter count for indicator
  const activeFilterCount =
    (roleFilter !== "all" ? 1 : 0) +
    (sortKey !== "updatedAt" ? 1 : 0);

  let content;

  if (error) {
    content = <ErrorState onRetry={refetch} />;
  } else if (isLoading) {
    content = <LoadingSkeleton />;
  } else if (isFirstTime) {
    // First-time user experience — enhanced empty state with onboarding
    content = (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="size-24 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center mb-8 animate-pulse">
          <Sparkles className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-2xl font-bold mb-3">
          Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! 👋
        </h3>
        <p className="text-muted-foreground text-center max-w-lg mb-8 leading-relaxed">
          Get started by creating your first workspace. Workspaces help you organize
          projects, user stories, and test cases for your team.
        </p>

        {/* Quick Start Steps */}
        <div className="flex flex-wrap items-center gap-3 mb-10 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5 bg-primary/10 text-primary rounded-full px-3 py-1.5 font-medium">
            <span className="size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">1</span>
            Create workspace
          </span>
          <ArrowRight className="h-4 w-4 hidden sm:block" />
          <span className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1.5">
            <span className="size-5 rounded-full bg-muted-foreground/20 flex items-center justify-center text-[10px] font-bold">2</span>
            Add project
          </span>
          <ArrowRight className="h-4 w-4 hidden sm:block" />
          <span className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1.5">
            <span className="size-5 rounded-full bg-muted-foreground/20 flex items-center justify-center text-[10px] font-bold">3</span>
            Write stories
          </span>
          <ArrowRight className="h-4 w-4 hidden sm:block" />
          <span className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1.5">
            <span className="size-5 rounded-full bg-muted-foreground/20 flex items-center justify-center text-[10px] font-bold">4</span>
            Generate tests
          </span>
        </div>

        <Button
          onClick={() => setCreateOpen(true)}
          size="lg"
          className="gap-2 text-base px-8 py-6"
        >
          <Plus className="h-5 w-5" />
          Create Your First Workspace
        </Button>
      </div>
    );
  } else if (filteredWorkspaces.length === 0) {
    // Search/filter returned no results
    content = (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="size-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <Search className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold mb-2">No workspaces found</h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          {searchQuery.trim()
            ? `No results for "${searchQuery}". Try a different search term.`
            : roleFilter !== "all"
              ? `No workspaces where you are ${roleFilter === "owner" ? "the owner" : "a member"}.`
              : "Try adjusting your filters."}
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setSearchQuery("");
            setRoleFilter("all");
          }}
        >
          Clear Filters
        </Button>
      </div>
    );
  } else {
    content = (
      <main className="p-8">
        {/* Welcome banner for returning users (dismissible) */}
        {!welcomeDismissed && workspaces && workspaces.length <= 3 && (
          <div className="mb-6 relative rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-blue-500/5 p-4 flex items-center gap-4">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                💡 Quick tip: Organize your test cases by creating separate workspaces for different teams or products.
              </p>
            </div>
            <button
              onClick={() => setWelcomeDismissed(true)}
              className="shrink-0 p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss tip"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Sort & Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Sort dropdown */}
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <Select value={sortKey} onValueChange={(val) => setSortKey(val as SortKey)}>
              <SelectTrigger className="w-[160px] h-8 bg-transparent border-border" aria-label="Sort workspaces by">
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

          {/* Role filter pills */}
          <div className="flex items-center gap-1 ml-2">
            {(["all", "owner", "member"] as RoleFilter[]).map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                  roleFilter === role
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "bg-muted text-muted-foreground hover:bg-accent border border-transparent"
                }`}
              >
                {role === "all" ? "All" : role === "owner" ? "Owner" : "Member"}
              </button>
            ))}
          </div>

          {/* Active filter indicator */}
          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                setSortKey("updatedAt");
                setSortDir("desc");
                setRoleFilter("all");
              }}
              className="text-xs text-muted-foreground hover:text-foreground underline ml-auto transition-colors"
            >
              Reset filters
            </button>
          )}

          {/* Workspace count */}
          <span className="text-xs text-muted-foreground ml-auto">
            {filteredWorkspaces.length} workspace{filteredWorkspaces.length !== 1 ? "s" : ""}
          </span>
        </div>

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
            className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/50 p-6 shadow-sm hover:shadow-md hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer min-h-[220px] focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            aria-label="Create new workspace"
          >
            <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Plus className="h-7 w-7 text-primary" />
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
          <span className="text-xs font-medium text-muted-foreground">My Workspaces</span>
          <h1 className="text-xl font-bold">Workspaces</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <label className="flex flex-col min-w-64">
            <div className="flex w-full items-stretch rounded-lg h-10 border border-input dark:border-white/10 bg-background dark:bg-muted/50">
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
