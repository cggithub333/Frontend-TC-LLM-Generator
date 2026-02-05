/**
 * Form validation utilities
 */

import type { ProjectKeyValidation } from "@/types/project.types";

/**
 * Validate project name
 * @param name - Project name to validate
 * @returns Error message or undefined if valid
 */
export function validateProjectName(name: string): string | undefined {
  if (!name || name.trim().length === 0) {
    return "Project name is required";
  }
  if (name.length < 3) {
    return "Project name must be at least 3 characters";
  }
  if (name.length > 100) {
    return "Project name must not exceed 100 characters";
  }
  return undefined;
}

/**
 * Validate project key
 * Must be uppercase letters and numbers only, 2-10 characters
 * @param key - Project key to validate
 * @returns Validation result with status and message
 */
export function validateProjectKey(key: string): ProjectKeyValidation {
  if (!key || key.trim().length === 0) {
    return {
      isValid: false,
      message: "Project key is required",
    };
  }

  const trimmedKey = key.trim();

  if (trimmedKey.length < 2) {
    return {
      isValid: false,
      message: "Project key must be at least 2 characters",
    };
  }

  if (trimmedKey.length > 10) {
    return {
      isValid: false,
      message: "Project key must not exceed 10 characters",
    };
  }

  // Only uppercase letters and numbers
  const keyPattern = /^[A-Z0-9]+$/;
  if (!keyPattern.test(trimmedKey)) {
    return {
      isValid: false,
      message: "Project key must contain only uppercase letters and numbers",
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Validate Jira site ID
 * @param siteId - Jira site ID to validate
 * @returns Error message or undefined if valid
 */
export function validateJiraSiteId(siteId: string): string | undefined {
  if (!siteId || siteId.trim().length === 0) {
    return undefined; // Optional field
  }

  // Basic URL/domain validation
  const sitePattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;
  if (!sitePattern.test(siteId.trim())) {
    return "Invalid Jira site ID format";
  }

  return undefined;
}

/**
 * Validate Jira project key
 * Only required if Jira site ID is provided
 * @param jiraKey - Jira project key to validate
 * @param jiraSiteId - Jira site ID (to check if required)
 * @returns Error message or undefined if valid
 */
export function validateJiraProjectKey(
  jiraKey: string,
  jiraSiteId?: string
): string | undefined {
  // If Jira site ID is provided, project key is required
  if (jiraSiteId && jiraSiteId.trim().length > 0) {
    if (!jiraKey || jiraKey.trim().length === 0) {
      return "Jira Project Key is required for integration";
    }

    // Jira project keys are typically uppercase letters
    const jiraKeyPattern = /^[A-Z][A-Z0-9]+$/;
    if (!jiraKeyPattern.test(jiraKey.trim())) {
      return "Invalid Jira project key format";
    }
  }

  return undefined;
}

/**
 * Auto-generate project key from project name
 * Takes first letters of words, max 10 characters, uppercase
 * @param projectName - Project name to generate key from
 * @returns Generated project key
 */
export function generateProjectKey(projectName: string): string {
  if (!projectName || projectName.trim().length === 0) {
    return "";
  }

  // Split by spaces and special characters, take first letter of each word
  const words = projectName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, " ") // Replace special chars with space
    .split(/\s+/) // Split by whitespace
    .filter((word) => word.length > 0);

  if (words.length === 0) {
    return "";
  }

  // If single word, take first 5 chars
  if (words.length === 1) {
    return words[0].substring(0, 5);
  }

  // Multiple words: take first letter of each, up to 10 chars
  const key = words
    .map((word) => word[0])
    .join("")
    .substring(0, 10);

  return key;
}
