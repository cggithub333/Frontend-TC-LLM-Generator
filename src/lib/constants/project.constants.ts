/**
 * Project-related constants
 * Centralized configuration for colors and status mappings
 */

import { type LucideIcon, Layers } from "lucide-react";
import type { StatusColorConfig } from "@/types/workspace.types";

export const PROJECT_STATUS_COLOR_MAP: Record<string, StatusColorConfig> = {
  "AI Processing": {
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-400",
    badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  Review: {
    bg: "bg-orange-50 dark:bg-orange-900/20",
    text: "text-orange-700 dark:text-orange-400",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
  Done: {
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-400",
    badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  Active: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-400",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  Archived: {
    bg: "bg-gray-50 dark:bg-gray-900/20",
    text: "text-gray-700 dark:text-gray-400",
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  },
};

export const DEFAULT_PROJECT_ICON: LucideIcon = Layers;

export const DEFAULT_STATUS_COLOR: StatusColorConfig = PROJECT_STATUS_COLOR_MAP.Active;
