import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/use-websocket";
import { toast } from "sonner";

interface MemberEvent {
  entityType: string;
  action: "CREATED" | "UPDATED" | "DELETED";
  entityId: string;
  parentId?: string;
  payload?: { userId?: string; userFullName?: string };
  performedBy: string;
}

/**
 * Monitors workspace member events. If the current user is removed,
 * shows a toast and redirects to /workspaces.
 */
export function useWorkspaceAccessGuard(workspaceId: string) {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();
  const redirectedRef = useRef(false);

  useWebSocket<MemberEvent>({
    topic: `/topic/workspaces/${workspaceId}/members`,
    onMessage: (event) => {
      // If someone was removed — check if it's the current user
      if (event.action === "DELETED" && user?.id) {
        // The payload won't have userId for DELETE, but we can check
        // by refetching the members list; if current user is no longer
        // in it, redirect.
        queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceId] });

        // After invalidation, check access by calling the API
        // If the API returns 403, we know we were removed
        setTimeout(async () => {
          if (redirectedRef.current) return;
          try {
            const axios = (await import("@/lib/axios")).default;
            await axios.get(`/workspace-members/workspace/${workspaceId}?page=0&size=1`);
          } catch {
            // 403 = we were removed
            redirectedRef.current = true;
            toast.error("You have been removed from this workspace", {
              description: "Redirecting to your workspaces...",
              duration: 4000,
            });
            queryClient.invalidateQueries({ queryKey: ["workspaces"] });
            router.replace("/workspaces");
          }
        }, 500);
      }
    },
  });
}
