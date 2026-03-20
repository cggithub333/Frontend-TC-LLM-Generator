"use client";

/**
 * Project Detail Page — Overview Dashboard
 * Shows stats cards, charts (test execution, story status, coverage),
 * current test plan, recent stories, and team members.
 */

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UserPlus,
  Layers,
  AlertCircle,
  FileText,
  Plus,
  Folder,
  Users,
  FlaskConical,
  Bot,
  ClipboardList,
} from "lucide-react";
import { getStatusStyles } from "@/lib/status-styles";
import { useProject } from "@/hooks/use-projects";
import { useProjectOverview } from "@/hooks/use-project-overview";
import { cn } from "@/lib/utils";
import { StatsCard } from "@/components/features/admin/stats-card";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
);

// ── Color Palette ──────────────────────────────────────────────────────────────
const EXECUTION_COLORS: Record<string, string> = {
  PASSED: "#10b981",
  FAILED: "#ef4444",
  IN_PROGRESS: "#3b82f6",
  NOT_RUN: "#94a3b8",
  BLOCKED: "#f59e0b",
};

const STORY_COLORS: Record<string, string> = {
  DRAFT: "#94a3b8",
  IN_PROGRESS: "#3b82f6",
  DONE: "#10b981",
  ARCHIVED: "#6b7280",
};

// ── Chart Components ───────────────────────────────────────────────────────────
function TestExecutionChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);

  if (total === 0) return null;

  const chartData = {
    labels: entries.map(([k]) => k.replace("_", " ")),
    datasets: [
      {
        data: entries.map(([, v]) => v),
        backgroundColor: entries.map(
          ([k]) => EXECUTION_COLORS[k] || "#94a3b8",
        ),
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

  const passed = data["PASSED"] || 0;
  const pct = total > 0 ? Math.round((passed / total) * 100) : 0;

  return (
    <div className="relative">
      <div className="h-[180px] w-[180px] mx-auto">
        <Doughnut data={chartData} options={options} />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-2xl font-bold">{pct}%</p>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
              Passed
            </p>
          </div>
        </div>
      </div>
      {/* Legend */}
      <div className="mt-5 space-y-2">
        {entries.map(([name, value]) => (
          <div key={name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: EXECUTION_COLORS[name] || "#94a3b8",
                }}
              />
              <span className="text-foreground/80 text-xs">
                {name.replace("_", " ")}
              </span>
            </div>
            <span className="font-semibold text-xs">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StoryStatusChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);

  if (total === 0) return null;

  const chartData = {
    labels: entries.map(([k]) => k.replace("_", " ")),
    datasets: [
      {
        data: entries.map(([, v]) => v),
        backgroundColor: entries.map(([k]) => STORY_COLORS[k] || "#94a3b8"),
        borderWidth: 0,
        borderRadius: 6,
        barThickness: 22,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const,
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
    scales: {
      x: {
        grid: { color: "rgba(148, 163, 184, 0.1)" },
        ticks: {
          color: "#94a3b8",
          font: { size: 11, family: "Inter" },
          stepSize: 1,
        },
        border: { display: false },
        beginAtZero: true,
      },
      y: {
        grid: { display: false },
        ticks: {
          color: "#94a3b8",
          font: { size: 11, family: "Inter" },
        },
        border: { display: false },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
}

function CoverageChart({
  covered,
  uncovered,
}: {
  covered: number;
  uncovered: number;
}) {
  const total = covered + uncovered;
  if (total === 0) return null;

  const pct = Math.round((covered / total) * 100);

  const chartData = {
    labels: ["Covered", "Uncovered"],
    datasets: [
      {
        data: [covered, uncovered],
        backgroundColor: ["#10b981", "#ef4444"],
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
      <div className="h-[140px] w-[140px] mx-auto">
        <Doughnut data={chartData} options={options} />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-xl font-bold">{pct}%</p>
            <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">
              Covered
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-foreground/80">With Test Cases</span>
          </div>
          <span className="font-semibold">{covered}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-foreground/80">No Test Cases</span>
          </div>
          <span className="font-semibold">{uncovered}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const { data: project, isLoading: projectLoading, error } = useProject(projectId);
  const { data: overview, isLoading: overviewLoading } = useProjectOverview(projectId);

  const isLoading = projectLoading || overviewLoading;

  if (isLoading) {
    return (
      <div className="flex-1 p-4 sm:p-8">
        <div className="max-w-[1600px] mx-auto space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-[100px] bg-muted animate-pulse rounded-xl"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-[300px] bg-muted animate-pulse rounded-xl" />
            <div className="h-[300px] bg-muted animate-pulse rounded-xl" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-[280px] bg-muted animate-pulse rounded-xl" />
            <div className="h-[280px] bg-muted animate-pulse rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">Project Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The project you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button asChild>
          <Link href="/workspaces">Back to Workspaces</Link>
        </Button>
      </div>
    );
  }

  const statsData = overview
    ? [
        {
          title: "User Stories",
          value: overview.totalStories.toLocaleString(),
          icon: FileText,
          iconColor: "text-amber-600 dark:text-amber-400",
          iconBg: "bg-amber-100 dark:bg-amber-900/30",
        },
        {
          title: "Test Cases",
          value: overview.totalTestCases.toLocaleString(),
          icon: FlaskConical,
          iconColor: "text-blue-600 dark:text-blue-400",
          iconBg: "bg-blue-100 dark:bg-blue-900/30",
        },
        {
          title: "Test Suites",
          value: overview.totalTestSuites.toLocaleString(),
          icon: Layers,
          iconColor: "text-indigo-600 dark:text-indigo-400",
          iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
        },
        {
          title: "Team Members",
          value: overview.totalMembers.toLocaleString(),
          icon: Users,
          iconColor: "text-violet-600 dark:text-violet-400",
          iconBg: "bg-violet-100 dark:bg-violet-900/30",
        },
        {
          title: "AI Generated",
          value: overview.aiGeneratedTestCases.toLocaleString(),
          icon: Bot,
          iconColor: "text-emerald-600 dark:text-emerald-400",
          iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
        },
      ]
    : [];

  const hasExecutionData =
    overview &&
    Object.values(overview.testExecutionStatus).some((v) => v > 0);
  const hasStoryData =
    overview &&
    Object.values(overview.storyStatusDistribution).some((v) => v > 0);
  const hasCoverageData =
    overview &&
    overview.storiesWithTestCases + overview.storiesWithoutTestCases > 0;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6 pb-10">
        {/* ── Stats Cards ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {statsData.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* ── Charts Row: Story Status ────────────── */}
        <div className="gap-6">
          {/* Story Status Distribution */}
          <div className="bg-card rounded-xl border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold">Story Status</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Distribution of user stories by status
                </p>
              </div>
              <Link
                href={`/projects/${projectId}/stories`}
                className="text-sm text-primary font-medium hover:underline"
              >
                View All
              </Link>
            </div>
            {hasStoryData ? (
              <div className="h-[240px]">
                <StoryStatusChart data={overview!.storyStatusDistribution} />
              </div>
            ) : (
              <div className="h-[240px] flex flex-col items-center justify-center text-muted-foreground">
                <FileText className="h-8 w-8 mb-3 opacity-40" />
                <p className="text-sm font-medium">No stories yet</p>
                <p className="text-xs mt-1 opacity-70">
                  Create user stories to see their status
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Row 2: Current Test Plan + Coverage ─────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Test Plan */}
          <div className="lg:col-span-2 bg-card rounded-xl border border-l-4 border-l-primary shadow-sm p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">Current Test Plan</h3>
                  {overview?.currentTestPlan && (
                    <Badge
                      className={cn(
                        getStatusStyles(overview.currentTestPlan.status),
                        "text-[10px] font-semibold px-2 py-0.5",
                      )}
                    >
                      {overview.currentTestPlan.status}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {overview?.currentTestPlan?.name ?? "No test plans yet"}
                </p>
              </div>
              {overview?.currentTestPlan && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground font-medium">
                    Created{" "}
                    {new Date(
                      overview.currentTestPlan.createdAt,
                    ).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
            {overview?.currentTestPlan ? (
              <div className="space-y-4">
                {overview.currentTestPlan.description && (
                  <p className="text-sm text-muted-foreground">
                    {overview.currentTestPlan.description}
                  </p>
                )}
                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>
                      {overview.currentTestPlan.passedCount} /{" "}
                      {overview.currentTestPlan.totalItems} passed
                    </span>
                    <span>
                      {overview.currentTestPlan.totalItems > 0
                        ? Math.round(
                            (overview.currentTestPlan.passedCount /
                              overview.currentTestPlan.totalItems) *
                              100,
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{
                        width: `${
                          overview.currentTestPlan.totalItems > 0
                            ? (overview.currentTestPlan.passedCount /
                                overview.currentTestPlan.totalItems) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
                {/* Quick stats */}
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="font-semibold">{overview.currentTestPlan.passedCount}</span>
                    <span className="text-muted-foreground text-xs">Passed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="font-semibold">{overview.currentTestPlan.failedCount}</span>
                    <span className="text-muted-foreground text-xs">Failed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <span className="font-semibold">
                      {overview.currentTestPlan.totalItems -
                        overview.currentTestPlan.passedCount -
                        overview.currentTestPlan.failedCount}
                    </span>
                    <span className="text-muted-foreground text-xs">Remaining</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Create a test plan to track your sprint progress.
              </p>
            )}
          </div>

          {/* Test Coverage */}
          <div className="bg-card rounded-xl border shadow-sm p-6">
            <div className="mb-4">
              <h2 className="text-base font-semibold">Test Coverage</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Stories with test cases
              </p>
            </div>
            {hasCoverageData ? (
              <CoverageChart
                covered={overview!.storiesWithTestCases}
                uncovered={overview!.storiesWithoutTestCases}
              />
            ) : (
              <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
                <FlaskConical className="h-8 w-8 mb-3 opacity-40" />
                <p className="text-sm font-medium">No coverage data</p>
                <p className="text-xs mt-1 opacity-70">
                  Add stories and test cases
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Row 3: Recent Stories + Team ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent User Stories */}
          <div className="lg:col-span-2 bg-card rounded-xl border shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b flex justify-between items-center">
              <h3 className="font-semibold text-lg">Recent User Stories</h3>
              <Link
                href={`/projects/${projectId}/stories`}
                className="text-primary text-sm font-medium hover:underline"
              >
                View All
              </Link>
            </div>
            {overview && overview.recentStories.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/50 text-xs text-muted-foreground uppercase font-medium">
                      <th className="px-5 py-3 font-semibold">Title</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold">ACs</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y">
                    {overview.recentStories.map((story) => (
                      <tr
                        key={story.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-5 py-3 font-medium">
                          <Link
                            href={`/projects/${projectId}/stories`}
                            className="hover:text-primary"
                          >
                            {story.title}
                          </Link>
                        </td>
                        <td className="px-5 py-3">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs font-semibold",
                              getStatusStyles(story.status),
                            )}
                          >
                            {story.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {story.acceptanceCriteriaCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="p-3 rounded-full bg-amber-50 dark:bg-amber-900/20 mb-3">
                  <FileText className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  No user stories yet
                </p>
                <p className="text-xs text-muted-foreground/70 mb-3">
                  User stories define your requirements and acceptance criteria
                </p>
                <Link
                  href={`/projects/${projectId}/stories`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Write First Story
                </Link>
              </div>
            )}
          </div>

          {/* Team Members */}
          <div className="bg-card rounded-xl border shadow-sm p-5 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-lg">Project Team</h3>
              <Link
                href={`/projects/${projectId}/team`}
                className="size-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center transition-colors"
              >
                <UserPlus className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-4 flex-1">
              {overview && overview.teamMembers.length > 0 ? (
                overview.teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full flex items-center justify-center font-semibold text-sm ring-2 ring-white dark:ring-gray-800 bg-primary/10 text-primary">
                        {member.fullName?.slice(0, 2).toUpperCase() ?? "??"}
                      </div>
                      <p className="text-sm font-medium">{member.fullName}</p>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded">
                      {member.role}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="p-3 rounded-full bg-violet-50 dark:bg-violet-900/20 mb-3">
                    <UserPlus className="h-6 w-6 text-violet-500 dark:text-violet-400" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    No members yet
                  </p>
                  <p className="text-xs text-muted-foreground/70 mb-3">
                    Add team members to collaborate
                  </p>
                  <Link
                    href={`/projects/${projectId}/team`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Invite Member
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
