/**
 * Centralized environment configuration.
 * All external URLs and secrets are read from environment variables here.
 * If a required variable is missing, the app will fail fast with a clear error
 * at RUNTIME (not build time — Docker build doesn't have .env).
 */

/**
 * Lazily read a required env var.
 * Throws a clear error the first time the value is accessed at runtime
 * if the variable is not set. Safe during `next build`.
 */
function lazyEnv(key: string): () => string {
  let cached: string | undefined;
  return () => {
    if (cached !== undefined) return cached;
    const value = process.env[key];
    if (!value) {
      throw new Error(
        `❌ Missing required environment variable: ${key}. Check your .env file.`
      );
    }
    cached = value;
    return cached;
  };
}

const _getBackendApiUrl = lazyEnv("BACKEND_API_URL");

/** Backend API base URL (server-side only — used by Next.js Route Handlers) */
export function getBackendApiUrl(): string {
  return _getBackendApiUrl();
}
