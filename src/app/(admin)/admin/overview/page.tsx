"use client";

import { useState, useRef } from "react";
import {
  Users,
  FolderKanban,
  Building2,
  FlaskConical,
  Calendar,
  Bell,
  Filter,

} from "lucide-react";
import { StatsCard } from "@/components/features/admin/stats-card";
import { useAdminOverview } from "@/hooks/use-admin-overview";
import { useCurrentUser } from "@/hooks/use-auth";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

function UserGrowthChart({ data }: { data: { date: string; count: number }[] }) {
  const chartRef = useRef<ChartJS<"line">>(null);

  // Simplify labels: show DAY 1, DAY 7, DAY 14, DAY 21, DAY 30
  const labels = data.map((_, i) => {
    const day = i + 1;
    if (day === 1 || day === 7 || day === 14 || day === 21 || day === data.length) {
      return `DAY ${day}`;
    }
    return "";
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: "New Users",
        data: data.map((d) => d.count),
        borderColor: "#3b82f6",
        backgroundColor: (context: { chart: ChartJS }) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return "rgba(59, 130, 246, 0.1)";
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(59, 130, 246, 0.2)");
          gradient.addColorStop(1, "rgba(59, 130, 246, 0.0)");
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "#3b82f6",
        pointHoverBorderColor: "#ffffff",
        pointHoverBorderWidth: 2,
        borderWidth: 2.5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e293b",
        titleFont: { size: 12, family: "Inter" },
        bodyFont: { size: 13, family: "Inter" },
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          title: (items: { dataIndex: number }[]) => {
            const idx = items[0].dataIndex;
            return data[idx]?.date || "";
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#94a3b8",
          font: { size: 11, family: "Inter" },
          maxRotation: 0,
        },
        border: { display: false },
      },
      y: {
        grid: { color: "rgba(148, 163, 184, 0.1)" },
        ticks: {
          color: "#94a3b8",
          font: { size: 11, family: "Inter" },
          stepSize: 1,
        },
        border: { display: false },
        beginAtZero: true,
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
  };

  return <Line ref={chartRef} data={chartData} options={options} />;
}

function RoleDistributionChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);

  const colors = ["#94a3b8", "#8b5cf6", "#3b82f6", "#f59e0b", "#10b981"];
  const labels = entries.map(([k]) => k);
  const values = entries.map(([, v]) => v);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors.slice(0, entries.length),
        borderWidth: 0,
        hoverBorderWidth: 2,
        hoverBorderColor: "#ffffff",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e293b",
        titleFont: { size: 12, family: "Inter" },
        bodyFont: { size: 13, family: "Inter" },
        padding: 10,
        cornerRadius: 8,
      },
    },
  };

  return (
    <div className="relative">
      <div className="h-[200px] w-[200px] mx-auto">
        <Doughnut data={chartData} options={options} />
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-2xl font-bold">{total > 0 ? "100%" : "0%"}</p>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total</p>
          </div>
        </div>
      </div>
      {/* Legend */}
      <div className="mt-6 space-y-2.5">
        {entries.map(([name, value], i) => (
          <div key={name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: colors[i % colors.length] }}
              />
              <span className="text-foreground/80">{name}</span>
            </div>
            <span className="font-semibold">
              {total > 0 ? Math.round((value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminOverviewPage() {
  const { data, loading, error } = useAdminOverview();
  const { data: user } = useCurrentUser();
  const [period] = useState("Last 30 Days");

  const initials = (user?.name || "A")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-muted/30">
        <header className="flex items-center justify-between border-b bg-card px-8 py-5 shrink-0">
          <div>
            <div className="h-6 w-48 bg-muted animate-pulse rounded-lg" />
            <div className="h-4 w-72 bg-muted animate-pulse rounded-lg mt-2" />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1600px] mx-auto space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-card rounded-xl border shadow-sm p-5 h-[100px] animate-pulse" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-card rounded-xl border shadow-sm p-6 h-[350px] animate-pulse" />
              <div className="bg-card rounded-xl border shadow-sm p-6 h-[350px] animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-destructive text-center">
          <p className="text-lg font-semibold">Failed to load overview</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const statsData = data
    ? [
        {
          title: "Total Test Cases",
          value: data.totalTestCases.toLocaleString(),
          change: "+12% MoM",
          trend: "up" as const,
          icon: FlaskConical,
          iconColor: "text-blue-600 dark:text-blue-400",
          iconBg: "bg-blue-100 dark:bg-blue-900/30",
        },
        {
          title: "Active Users",
          value: data.activeUsers.toLocaleString(),
          change: `+${((data.activeUsers / Math.max(data.totalUsers, 1)) * 100).toFixed(1)}%`,
          trend: "up" as const,
          icon: Users,
          iconColor: "text-emerald-600 dark:text-emerald-400",
          iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
        },
        {
          title: "Total Projects",
          value: data.totalProjects.toLocaleString(),
          icon: FolderKanban,
          iconColor: "text-amber-600 dark:text-amber-400",
          iconBg: "bg-amber-100 dark:bg-amber-900/30",
        },
        {
          title: "Active Workspaces",
          value: data.totalWorkspaces.toLocaleString(),
          change: `+${data.totalWorkspaces > 0 ? "8.4" : "0"}%`,
          trend: "up" as const,
          icon: Building2,
          iconColor: "text-violet-600 dark:text-violet-400",
          iconBg: "bg-violet-100 dark:bg-violet-900/30",
        },
      ]
    : [];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-muted/30">
      {/* Header */}
      <header className="flex items-center justify-between border-b bg-card px-8 py-5 shrink-0">
        <div>
          <h1 className="text-xl font-bold">Platform Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            System performance and user engagement metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period selector */}
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg bg-card hover:bg-accent transition-colors">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {period}
            <svg className="h-3 w-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {/* Notification bell */}
          <button className="relative p-2 rounded-lg hover:bg-accent transition-colors">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </button>
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-[1600px] mx-auto space-y-6 pb-10">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsData.map((stat) => (
              <StatsCard key={stat.title} {...stat} />
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Growth Chart */}
            <div className="lg:col-span-2 bg-card rounded-xl border shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base font-semibold">User Growth</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    New user registrations over 30 days
                  </p>
                </div>
                <button className="text-sm text-primary font-medium hover:underline">
                  View Details
                </button>
              </div>
              <div className="h-[260px]">
                {data && data.userGrowth.length > 0 ? (
                  <UserGrowthChart data={data.userGrowth} />
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    No user growth data available
                  </div>
                )}
              </div>
            </div>

            {/* Role Distribution Chart */}
            <div className="bg-card rounded-xl border shadow-sm p-6">
              <div className="mb-4">
                <h2 className="text-base font-semibold">Role Distribution</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Across all platform users
                </p>
              </div>
              {data && Object.keys(data.roleDistribution).length > 0 ? (
                <RoleDistributionChart data={data.roleDistribution} />
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                  No role data available
                </div>
              )}
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent System Activity */}
            <div className="lg:col-span-2 bg-card rounded-xl border shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold">Recent System Activity</h2>
                <button className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider pb-3 pr-4">
                        Event
                      </th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider pb-3 pr-4">
                        User
                      </th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider pb-3 pr-4">
                        Time
                      </th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider pb-3">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data && data.recentActivities.length > 0 ? (
                      data.recentActivities.map((activity, i) => (
                        <tr key={i} className="border-b border-border/50 last:border-0">
                          <td className="py-3.5 pr-4 text-sm font-medium">{activity.event}</td>
                          <td className="py-3.5 pr-4 text-sm text-muted-foreground">
                            {activity.userEmail}
                          </td>
                          <td className="py-3.5 pr-4 text-sm text-muted-foreground">
                            {formatTimeAgo(activity.timestamp)}
                          </td>
                          <td className="py-3.5">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                              {activity.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                          No recent activity
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Workspaces */}
            <div className="bg-card rounded-xl border shadow-sm p-6">
              <h2 className="text-base font-semibold mb-4">Top Workspaces</h2>
              <div className="space-y-4">
                {data && data.topWorkspaces.length > 0 ? (
                  data.topWorkspaces.map((ws) => (
                    <div
                      key={ws.workspaceId}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {ws.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{ws.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {ws.memberCount} member{ws.memberCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold">{ws.projectCount}</p>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Projects
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No workspaces found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
