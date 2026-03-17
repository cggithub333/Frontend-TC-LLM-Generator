"use client";

import { useParams, useRouter } from "next/navigation";
import { useInvitationInfo, useAcceptInvitation } from "@/hooks/use-workspace-members";
import { useCurrentUser } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Users, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AcceptInvitationPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const { data: invitation, isLoading, error } = useInvitationInfo(token);
  const { data: user } = useCurrentUser();
  const acceptMutation = useAcceptInvitation();

  const handleAccept = async () => {
    if (!user) {
      // Redirect to login with return URL
      router.push(`/login?redirect=/invite/${token}`);
      return;
    }

    try {
      await acceptMutation.mutateAsync(token);
      toast.success("You've joined the workspace!");
      // Use window.location.href to break out of (auth) layout group
      if (invitation?.workspaceId) {
        window.location.href = `/workspaces/${invitation.workspaceId}`;
      } else {
        window.location.href = "/workspaces";
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to accept invitation";
      toast.error(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full mx-4">
          <div className="rounded-xl border bg-card p-8 text-center shadow-sm">
            <XCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h1 className="text-xl font-bold mb-2">Invalid Invitation</h1>
            <p className="text-sm text-muted-foreground mb-6">
              This invitation link is invalid or has expired.
            </p>
            <Button variant="outline" onClick={() => router.push("/login")}>
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isExpired = invitation.status === "EXPIRED" || new Date(invitation.expiresAt) < new Date();
  const isAccepted = invitation.status === "ACCEPTED";
  const isCancelled = invitation.status === "CANCELLED";
  const isPending = invitation.status === "PENDING" && !isExpired;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-4">
        <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
          {/* Header */}
          <div className="bg-zinc-900 dark:bg-zinc-800 px-8 py-6 text-center">
            <h1 className="text-lg font-bold text-white tracking-tight">
              ✓ QA Artifacts
            </h1>
          </div>

          {/* Body */}
          <div className="p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
              <Users className="h-7 w-7 text-primary" />
            </div>

            <h2 className="text-xl font-bold mb-2">Workspace Invitation</h2>

            <p className="text-sm text-muted-foreground mb-6">
              <strong>{invitation.inviterName}</strong> invited you to join
            </p>

            <div className="rounded-lg bg-muted/50 border px-4 py-3 mb-6">
              <p className="font-semibold text-lg">{invitation.workspaceName}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Role: <span className="font-medium text-foreground">{invitation.role}</span>
              </p>
            </div>

            {isPending && (
              <>
                {!user ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Please log in to accept this invitation.
                    </p>
                    <Button
                      className="w-full"
                      onClick={() => router.push(`/login?redirect=/invite/${token}`)}
                    >
                      Log in to Accept
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push(`/signup?redirect=/invite/${token}`)}
                    >
                      Create Account
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleAccept}
                    disabled={acceptMutation.isPending}
                  >
                    {acceptMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept Invitation
                      </>
                    )}
                  </Button>
                )}
              </>
            )}

            {isAccepted && (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Already accepted</span>
                </div>
                <Button variant="outline" onClick={() => { window.location.href = `/workspaces/${invitation.workspaceId}`; }}>
                  Go to Workspace
                </Button>
              </div>
            )}

            {isExpired && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Clock className="h-5 w-5" />
                <span className="font-medium">This invitation has expired</span>
              </div>
            )}

            {isCancelled && (
              <div className="flex items-center justify-center gap-2 text-destructive">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">This invitation was cancelled</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-muted/30 border-t text-center">
            <p className="text-xs text-muted-foreground">
              Invitation sent to <strong>{invitation.inviteeEmail}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
