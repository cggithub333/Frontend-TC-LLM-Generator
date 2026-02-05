/**
 * Project-related constants
 * Centralized configuration for icons, colors, and status mappings
 */

import {
  Smartphone,
  CreditCard,
  Shield,
  ShoppingCart,
  Layers,
  LayoutDashboard,
  Code,
  Puzzle,
  type LucideIcon,
} from "lucide-react";
import type { ProjectIconType, ProjectStatus, StatusColorConfig } from "@/types/workspace.types";

/**
 * Maps project icon string identifiers to Lucide icon components
 */
export const PROJECT_ICON_MAP: Record<ProjectIconType, LucideIcon> = {
  smartphone: Smartphone,
  "credit-card": CreditCard,
  shield: Shield,
  "shopping-cart": ShoppingCart,
  layers: Layers,
  "dashboard-customize": LayoutDashboard,
  api: Code,
  "integration-instructions": Puzzle,
} as const;

/**
 * Maps project status to Tailwind CSS classes for styling
 * Supports both light and dark mode
 */
export const PROJECT_STATUS_COLOR_MAP: Record<ProjectStatus, StatusColorConfig> = {
  "AI Processing": {
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-400",
    badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  Review: {
    bg: "bg-orange-50 dark:bg-orange-900/20",
    text: "text-orange-700 dark:text-orange-400",
    badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  Done: {
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-400",
    badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  Active: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-400",
    badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  Archived: {
    bg: "bg-gray-50 dark:bg-gray-900/20",
    text: "text-gray-700 dark:text-gray-400",
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  },
} as const;

/**
 * Default icon to use when project icon type is not found
 */
export const DEFAULT_PROJECT_ICON: LucideIcon = Layers;

/**
 * Default status color configuration
 */
export const DEFAULT_STATUS_COLOR: StatusColorConfig = PROJECT_STATUS_COLOR_MAP.Active;
