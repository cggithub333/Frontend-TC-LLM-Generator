const CHANNEL_NAME = "qa-artifacts-auth";
const LOGOUT_EVENT = "logout";

let channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel {
  if (!channel) {
    channel = new BroadcastChannel(CHANNEL_NAME);
  }
  return channel;
}

export function broadcastLogout() {
  try {
    getChannel().postMessage({ type: LOGOUT_EVENT });
  } catch {
    localStorage.setItem(LOGOUT_EVENT, Date.now().toString());
  }
}

export function onLogoutBroadcast(callback: () => void): () => void {
  const handleBroadcast = (event: MessageEvent) => {
    if (event.data?.type === LOGOUT_EVENT) callback();
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === LOGOUT_EVENT) callback();
  };

  try {
    getChannel().addEventListener("message", handleBroadcast);
  } catch {
    // fallback for environments without BroadcastChannel
  }

  window.addEventListener("storage", handleStorage);

  return () => {
    try {
      getChannel().removeEventListener("message", handleBroadcast);
    } catch {
      // noop
    }
    window.removeEventListener("storage", handleStorage);
  };
}
