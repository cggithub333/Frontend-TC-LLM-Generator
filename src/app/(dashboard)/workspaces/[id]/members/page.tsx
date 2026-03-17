"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useWorkspace } from "@/hooks/use-workspaces";
import { useCurrentUser } from "@/hooks/use-auth";
import {
  useWorkspaceMembers,
  useWorkspaceInvitations,
  useSendWorkspaceInvitation,
  useCancelWorkspaceInvitation,
  useUpdateWorkspaceMember,
  useRemoveWorkspaceMember,
} from "@/hooks/use-workspace-members";
import type { WorkspaceMember, WorkspaceInvitation } from "@/types/workspace.types";
import {
  Users,
  Mail,
  Crown,
  Shield,
  User,
  MoreHorizontal,
  Trash2,
  UserPlus,
  Clock,
  XCircle,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const ROLE_ICON: Record<string, typeof Crown> = {
  Owner: Crown,
  Admin: Shield,
  Member: User,
};

const ROLE_COLOR: Record<string, string> = {
  Owner: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  Admin: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  Member: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20",
};

export default function WorkspaceMembersPage() {
  const params = useParams();
  const workspaceId = params.id as string;

  const { data: workspace } = useWorkspace(workspaceId);
  const { data: user } = useCurrentUser();
  const { data: membersResult, isLoading: membersLoading } = useWorkspaceMembers(workspaceId);
  const { data: invitations, isLoading: invitationsLoading } = useWorkspaceInvitations(workspaceId);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Member");
  const [removeTarget, setRemoveTarget] = useState<WorkspaceMember | null>(null);

  const sendInvitation = useSendWorkspaceInvitation();
  const cancelInvitation = useCancelWorkspaceInvitation();
  const updateMember = useUpdateWorkspaceMember();
  const removeMember = useRemoveWorkspaceMember();

  const members = membersResult?.items ?? [];
  const isOwner = workspace?.ownerUserId === user?.id;

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) return;
    try {
      await sendInvitation.mutateAsync({
        workspaceId,
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      setInviteRole("Member");
      setInviteOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send invitation";
      toast.error(msg);
    }
  };

  const handleCancelInvitation = async (inv: WorkspaceInvitation) => {
    try {
      await cancelInvitation.mutateAsync({
        workspaceId,
        invitationId: inv.invitationId,
      });
      toast.success("Invitation cancelled");
    } catch {
      toast.error("Failed to cancel invitation");
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      await updateMember.mutateAsync({
        workspaceId,
        memberId,
        role: newRole,
      });
      toast.success("Role updated");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update role";
      toast.error(msg);
    }
  };

  const handleRemoveMember = async () => {
    if (!removeTarget) return;
    try {
      await removeMember.mutateAsync({
        workspaceId,
        memberId: removeTarget.workspaceMemberId,
      });
      toast.success(`${removeTarget.userFullName} removed from workspace`);
      setRemoveTarget(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to remove member";
      toast.error(msg);
    }
  };

  const pendingInvitations = invitations?.filter((i) => i.status === "PENDING") ?? [];

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Members
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage members and invitations for{" "}
            <span className="font-medium text-foreground">{workspace?.name}</span>
          </p>
        </div>

        {isOwner && (
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invite Member</DialogTitle>
                <DialogDescription>
                  Send an email invitation to join this workspace.
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
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setInviteOpen(false)}
                >
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
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="members" className="w-full">
        <TabsList>
          <TabsTrigger value="members" className="gap-2">
            <Users className="h-4 w-4" />
            Members
            <Badge variant="secondary" className="ml-1 text-xs">
              {members.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            <Mail className="h-4 w-4" />
            Pending
            {pendingInvitations.length > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs">
                {pendingInvitations.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="mt-4">
          {membersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No members yet</p>
            </div>
          ) : (
            <div className="rounded-lg border divide-y">
              {members.map((member) => {
                const RoleIcon = ROLE_ICON[member.role] ?? User;
                const isCurrentUser = member.userId === user?.id;
                const isMemberOwner = member.role === "Owner";

                return (
                  <div
                    key={member.workspaceMemberId}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {member.userFullName?.charAt(0)?.toUpperCase() ?? "?"}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">
                          {member.userFullName}
                        </span>
                        {isCurrentUser && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            You
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {member.userEmail}
                      </p>
                    </div>

                    {/* Role badge */}
                    <Badge
                      variant="outline"
                      className={`gap-1 text-xs ${ROLE_COLOR[member.role] ?? ""}`}
                    >
                      <RoleIcon className="h-3 w-3" />
                      {member.role}
                    </Badge>

                    {/* Actions */}
                    {isOwner && !isMemberOwner && !isCurrentUser && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              handleRoleChange(
                                member.workspaceMemberId,
                                member.role === "Admin" ? "Member" : "Admin",
                              )
                            }
                          >
                            <ChevronDown className="h-4 w-4 mr-2" />
                            {member.role === "Admin"
                              ? "Demote to Member"
                              : "Promote to Admin"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setRemoveTarget(member)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Pending Invitations Tab */}
        <TabsContent value="pending" className="mt-4">
          {invitationsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : pendingInvitations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No pending invitations</p>
            </div>
          ) : (
            <div className="rounded-lg border divide-y">
              {pendingInvitations.map((inv) => (
                <div
                  key={inv.invitationId}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
                    <Clock className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {inv.inviteeEmail}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Invited as <span className="font-medium">{inv.role}</span>
                      {" · "}
                      Expires{" "}
                      {new Date(inv.expiresAt).toLocaleDateString()}
                    </p>
                  </div>

                  <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-600 border-orange-500/20">
                    Pending
                  </Badge>

                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleCancelInvitation(inv)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Remove confirmation dialog */}
      <AlertDialog open={!!removeTarget} onOpenChange={() => setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <strong>{removeTarget?.userFullName}</strong> from this workspace?
              They will lose access to all projects in this workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
