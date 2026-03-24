/**
 * WebSocket client using STOMP over SockJS.
 * Connects directly to the backend (bypassing Next.js proxy).
 */

import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// Backend WebSocket URL — connect directly to backend, not through Next.js proxy
// NEXT_PUBLIC_ vars must be read directly for Next.js to inline them at build time
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "";

let stompClient: Client | null = null;
let connectionPromise: Promise<Client> | null = null;

/**
 * Get or create the singleton STOMP client.
 * Authenticates using the JWT access token from cookies.
 */
export function getStompClient(token?: string): Promise<Client> {
  if (!WS_URL) {
    return Promise.reject(
      new Error("[WebSocket] NEXT_PUBLIC_WS_URL is not configured. Check your .env file.")
    );
  }

  if (stompClient?.connected) {
    return Promise.resolve(stompClient);
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = new Promise<Client>((resolve, reject) => {
    const client = new Client({
      // Use SockJS for transport (fallback for browsers without WebSocket)
      webSocketFactory: () => new SockJS(WS_URL) as unknown as WebSocket,

      // Pass JWT token in STOMP CONNECT headers
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},

      // Reconnect settings
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      // Debug logging (dev only)
      debug: (str) => {
        if (process.env.NODE_ENV === "development") {
          console.log("[STOMP]", str);
        }
      },

      onConnect: () => {
        console.log("[WebSocket] Connected to STOMP broker");
        stompClient = client;
        connectionPromise = null;
        resolve(client);
      },

      onStompError: (frame) => {
        console.error("[WebSocket] STOMP error:", frame.headers.message);
        connectionPromise = null;
        reject(new Error(frame.headers.message || "STOMP connection error"));
      },

      onDisconnect: () => {
        console.log("[WebSocket] Disconnected");
        stompClient = null;
        connectionPromise = null;
      },

      onWebSocketClose: () => {
        console.log("[WebSocket] WebSocket closed");
        stompClient = null;
        connectionPromise = null;
      },
    });

    client.activate();
  });

  return connectionPromise;
}

/**
 * Subscribe to a STOMP topic.
 * Returns an unsubscribe function.
 */
export async function subscribe(
  topic: string,
  callback: (message: IMessage) => void,
  token?: string
): Promise<StompSubscription> {
  const client = await getStompClient(token);
  return client.subscribe(topic, callback);
}

/**
 * Disconnect the STOMP client.
 */
export function disconnect(): void {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
    connectionPromise = null;
  }
}

/**
 * Get the access token from server-side API route.
 * Needed because the accessToken cookie is httpOnly.
 */
export async function fetchAccessToken(): Promise<string | undefined> {
  try {
    const res = await fetch("/api/auth/ws-token");
    if (!res.ok) return undefined;
    const data = await res.json();
    return data.token ?? undefined;
  } catch {
    return undefined;
  }
}
