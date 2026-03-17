"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useWebSocket } from "@/hooks/use-websocket";
import { useSendWorkspaceInvitation } from "@/hooks/use-workspace-members";
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
  ArrowRight,
  X,
  Lightbulb,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select as RoleSelect,
  SelectContent as RoleSelectContent,
  SelectItem as RoleSelectItem,
  SelectTrigger as RoleSelectTrigger,
  SelectValue as RoleSelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
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
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteWorkspace, setInviteWorkspace] = useState<Workspace | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Member");
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(
    null,
  );
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);

  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();
  const { data: workspacesResult, isLoading, error, refetch } = useWorkspaces();
  const router = useRouter();
  const sendInvitation = useSendWorkspaceInvitation();

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

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (ws) =>
          ws.name.toLowerCase().includes(q) ||
          ws.description?.toLowerCase().includes(q),
      );
    }

    // Sort (descending by default)
    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") {
        cmp = a.name.localeCompare(b.name);
      } else if (sortKey === "updatedAt") {
        cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      } else if (sortKey === "createdAt") {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortKey === "name" ? cmp : -cmp;
    });

    return result;
  }, [workspaces, searchQuery, sortKey]);

  const handleEdit = useCallback((workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setEditOpen(true);
  }, []);

  const handleDelete = useCallback((workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setDeleteOpen(true);
  }, []);

  const handleInvite = useCallback((workspace: Workspace) => {
    setInviteWorkspace(workspace);
    setInviteEmail("");
    setInviteRole("Member");
    setInviteOpen(true);
  }, []);

  const handleSendInvite = async () => {
    if (!inviteEmail.trim() || !inviteWorkspace) return;
    try {
      await sendInvitation.mutateAsync({
        workspaceId: inviteWorkspace.workspaceId,
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteOpen(false);
      setInviteEmail("");
      setInviteRole("Member");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send invitation";
      toast.error(msg);
    }
  };

  const handleSuccess = useCallback(() => {
    refetch();
  }, [refetch]);


  let content;

  if (error) {
    content = <ErrorState onRetry={refetch} />;
  } else if (isLoading) {
    content = <LoadingSkeleton />;
  } else if (isFirstTime) {
    // First-time user experience — enhanced empty state with onboarding
    content = (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mb-8">
          <LayoutDashboard className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-2xl font-bold mb-3">
          Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""}!
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
          No results for &ldquo;{searchQuery}&rdquo;. Try a different search term.
        </p>
        <Button
          variant="outline"
          onClick={() => setSearchQuery("")}
        >
          Clear Search
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
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                Quick tip: Organize your test cases by creating separate workspaces for different teams or products.
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

        {/* Control Bar — simplified: Search + Sort + Count */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm">
            <div className="flex w-full items-stretch rounded-lg h-9 border border-input dark:border-white/10 bg-background dark:bg-muted/50">
              <div className="text-muted-foreground flex items-center justify-center pl-3">
                <Search className="h-4 w-4" aria-hidden="true" />
              </div>
              <Input
                type="search"
                className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-3 text-sm h-full"
                placeholder="Search workspaces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search workspaces"
              />
            </div>
          </div>

          {/* Sort dropdown */}
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

          {/* Count + Reset */}
          <div className="flex items-center gap-3 ml-auto">
            {searchQuery.trim() && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
              >
                Clear search
              </button>
            )}
            <span className="text-xs text-muted-foreground">
              {filteredWorkspaces.length} workspace{filteredWorkspaces.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredWorkspaces.map((workspace) => (
            <WorkspaceCard
              key={workspace.workspaceId}
              workspace={workspace}
              isOwner={workspace.ownerUserId === user?.id}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onInvite={handleInvite}
            />
          ))}
          {/* Create Workspace Card */}
          <button
            onClick={() => setCreateOpen(true)}
            className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/25 bg-primary/[0.02] p-6 hover:border-primary/50 hover:bg-primary/[0.06] transition-all duration-200 cursor-pointer min-h-[180px] focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            aria-label="Create new workspace"
          >
            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-primary/15 transition-all duration-200">
              <Plus className="h-6 w-6 text-primary transition-transform duration-200 group-hover:rotate-90" />
            </div>
            <span className="text-sm font-medium text-foreground/70 group-hover:text-primary transition-colors duration-150">
              New Workspace
            </span>
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Header — clean, title-only */}
      <header className="flex items-center justify-between border-b border-border bg-card px-8 py-4 sticky top-0 z-10">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">My Workspaces</span>
          <h1 className="text-xl font-bold">Workspaces</h1>
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

      {/* Invite Member Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
            <DialogDescription>
              Send an email invitation to join <strong>{inviteWorkspace?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email address</label>
              <Input
                type="email"
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <RoleSelect value={inviteRole} onValueChange={setInviteRole}>
                <RoleSelectTrigger>
                  <RoleSelectValue />
                </RoleSelectTrigger>
                <RoleSelectContent>
                  <RoleSelectItem value="Admin">Admin</RoleSelectItem>
                  <RoleSelectItem value="Member">Member</RoleSelectItem>
                </RoleSelectContent>
              </RoleSelect>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendInvite}
              disabled={!inviteEmail.trim() || sendInvitation.isPending}
            >
              {sendInvitation.isPending ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
