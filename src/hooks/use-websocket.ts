/**
 * React hook for subscribing to STOMP WebSocket topics.
 * Auto-subscribes on mount and unsubscribes on unmount.
 */

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import type { IMessage, StompSubscription } from "@stomp/stompjs";
import { getStompClient, fetchAccessToken, disconnect } from "@/lib/websocket";

export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

interface UseWebSocketOptions<T> {
  /** STOMP topic to subscribe to, e.g. "/topic/workspaces" */
  topic: string;
  /** Callback when a message is received */
  onMessage: (data: T) => void;
  /** Whether the subscription is active (default: true) */
  enabled?: boolean;
}

/**
 * Hook to subscribe to a STOMP WebSocket topic.
 *
 * @example
 * ```tsx
 * useWebSocket({
 *   topic: "/topic/workspaces",
 *   onMessage: (event) => {
 *     console.log("Workspace event:", event);
 *     queryClient.invalidateQueries({ queryKey: ["workspaces"] });
 *   },
 * });
 * ```
 */
export function useWebSocket<T = unknown>({
  topic,
  onMessage,
  enabled = true,
}: UseWebSocketOptions<T>) {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const subscriptionRef = useRef<StompSubscription | null>(null);
  const onMessageRef = useRef(onMessage);

  // Keep onMessage ref up to date (in layout effect to avoid mutating ref during render)
  useLayoutEffect(() => {
    onMessageRef.current = onMessage;
  });

  const handleMessage = useCallback((message: IMessage) => {
    try {
      const data = JSON.parse(message.body) as T;
      onMessageRef.current(data);
    } catch (err) {
      console.error("[useWebSocket] Failed to parse message:", err);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("disconnected");
      return;
    }

    let mounted = true;

    async function connect() {
      try {
        if (mounted) setStatus("connecting");

        const token = await fetchAccessToken();
        const client = await getStompClient(token);

        if (!mounted) return;

        setStatus("connected");

        // Subscribe to the topic
        subscriptionRef.current = client.subscribe(topic, handleMessage);
      } catch (err) {
        console.error("[useWebSocket] Connection failed:", err);
        if (mounted) setStatus("error");
      }
    }

    connect();

    return () => {
      mounted = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [topic, enabled, handleMessage]);

  return { status, disconnect };
}
