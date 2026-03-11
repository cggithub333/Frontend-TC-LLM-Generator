"use client";

import { useState, useEffect, useCallback } from "react";

export interface DailyCount {
  date: string;
  count: number;
}

export interface RecentActivity {
  event: string;
  userName: string;
  userEmail: string;
  timestamp: string;
  status: string;
}

export interface TopWorkspace {
  workspaceId: string;
  name: string;
  memberCount: number;
  projectCount: number;
}

export interface AdminOverviewData {
  totalUsers: number;
  activeUsers: number;
  totalWorkspaces: number;
  totalProjects: number;
  totalTestCases: number;
  userGrowth: DailyCount[];
  roleDistribution: Record<string, number>;
  recentActivities: RecentActivity[];
  topWorkspaces: TopWorkspace[];
}

export function useAdminOverview() {
  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/proxy/admin/overview");
      if (!res.ok) throw new Error("Failed to fetch overview data");
      const json = await res.json();
      // ApiResponse wraps: { success, data, message }
      setData(json.data ?? json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return { data, loading, error, refetch: fetchOverview };
}
