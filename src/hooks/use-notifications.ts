import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { useWebSocket } from "./use-websocket";

// ─── Types ──────────────────────────────────────────────────────────

export interface AppNotification {
  notificationId: string;
  type: string;
  title: string;
  message: string;
  resourceType?: string;
  resourceId?: string;
  workspaceId?: string;
  projectId?: string;
  actorName?: string;
  isRead: boolean;
  createdAt: string;
}

interface UnreadCountResponse {
  unreadCount: number;
}

// ─── Queries ────────────────────────────────────────────────────────

export function useNotifications(page = 0, size = 20) {
  return useQuery({
    queryKey: ["notifications", page, size],
    queryFn: async (): Promise<AppNotification[]> => {
      const { data } = await axios.get("/notifications", {
        params: { page, size },
      });
      // Spring Page response: data.content is the array
      return (data as { content: AppNotification[] }).content ?? [];
    },
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async (): Promise<number> => {
      const { data } = await axios.get<UnreadCountResponse>(
        "/notifications/unread-count"
      );
      return (data as unknown as UnreadCountResponse).unreadCount;
    },
    refetchInterval: 30_000, // Poll every 30s as fallback
  });
}

// ─── Mutations ──────────────────────────────────────────────────────

export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      await axios.patch(`/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await axios.patch("/notifications/read-all");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

// ─── Real-time WebSocket ────────────────────────────────────────────

export function useNotificationWebSocket() {
  const qc = useQueryClient();

  useWebSocket<AppNotification>({
    topic: "/user/queue/notifications",
    onMessage: (notification) => {
      // Add new notification to cache
      qc.setQueryData(
        ["notifications", 0, 20],
        (old: AppNotification[] | undefined) => {
          if (!old) return [notification];
          return [notification, ...old];
        }
      );

      // Update unread count
      qc.setQueryData(
        ["notifications", "unread-count"],
        (old: number | undefined) => (old ?? 0) + 1
      );
    },
  });
}
