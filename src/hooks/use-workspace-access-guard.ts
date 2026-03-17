import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Periodically checks if the current user still has access to the workspace.
 * If they've been removed, shows a toast and redirects to /workspaces.
 *
 * Works by polling the workspace endpoint every 10s — if a 403 comes back,
 * the user has been removed.
 */
export function useWorkspaceAccessGuard(workspaceId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (!workspaceId || redirectedRef.current) return;

    let timer: ReturnType<typeof setInterval>;

    const checkAccess = async () => {
      if (redirectedRef.current) return;
      try {
        const axios = (await import("@/lib/axios")).default;
        await axios.get(`/workspace-members/workspace/${workspaceId}?page=0&size=1`);
      } catch {
        if (redirectedRef.current) return;
        redirectedRef.current = true;

        toast.error("You have been removed from this workspace", {
          description: "Redirecting to your workspaces...",
          duration: 4000,
        });

        queryClient.invalidateQueries({ queryKey: ["workspaces"] });
        router.replace("/workspaces");
      }
    };

    // First check after 3s (give time for normal page load)
    const initialTimer = setTimeout(() => {
      checkAccess();
      // Then check every 10s
      timer = setInterval(checkAccess, 10_000);
    }, 3000);

    return () => {
      clearTimeout(initialTimer);
      if (timer) clearInterval(timer);
    };
  }, [workspaceId, queryClient, router]);
}
