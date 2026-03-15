/**
 * Shared status color map — single source of truth for status badge styling.
 * Ensures consistent color-to-meaning mapping across all pages.
 */

export type StatusKey =
  | "DONE"
  | "IN_PROGRESS"
  | "DRAFT"
  | "ACTIVE"
  | "COMPLETED"
  | "PASSED"
  | "FAILED"
  | "BLOCKED"
  | "PENDING"
  | "CANCELLED";

const STATUS_STYLES: Record<string, string> = {
  // Green family — success/complete
  DONE: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  COMPLETED:
    "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  PASSED:
    "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",

  // Blue family — active/in-progress
  IN_PROGRESS:
    "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  ACTIVE: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",

  // Slate family — draft/neutral
  DRAFT: "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  PENDING:
    "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400",

  // Red family — failure/blocked
  FAILED: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  BLOCKED: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",

  // Amber family — cancelled/warning
  CANCELLED:
    "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
};

/**
 * Returns consistent Tailwind classes for a given status string.
 * Falls back to a neutral slate style for unknown statuses.
 */
export function getStatusStyles(status?: string | null): string {
  if (!status) return STATUS_STYLES.DRAFT;
  return (
    STATUS_STYLES[status.toUpperCase()] ?? STATUS_STYLES.DRAFT
  );
}
