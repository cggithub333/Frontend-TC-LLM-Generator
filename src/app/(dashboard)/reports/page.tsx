"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  CheckCircle2,
  Sparkles,
  Layers,
  Download,
  Loader2,
} from "lucide-react";
import { useTestCases } from "@/hooks/use-test-cases";
import { useTestPlans } from "@/hooks/use-test-plans";
import { useStories } from "@/hooks/use-stories";
import { useTestSuites } from "@/hooks/use-test-suites";
import { useReports } from "@/hooks/use-reports";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "#94A3B8",
  IN_PROGRESS: "#F59E0B",
  DONE: "#22C55E",
  ARCHIVED: "#71717A",
  UNKNOWN: "#D1D5DB",
  "AI Generated": "#A78BFA",
  Manual: "#3B82F6",
};

function BarItem({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percent = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{value} ({Math.round(percent)}%)</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percent}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function DonutChart({ data, colors }: { data: Record<string, number>; colors?: Record<string, string> }) {
  const colorMap = colors || STATUS_COLORS;
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  if (total === 0) return <p className="text-sm text-muted-foreground text-center py-8">No data available</p>;

  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  let cumulativePercent = 0;
  const segments = entries.map(([key, value]) => {
    const percent = (value / total) * 100;
    const segment = { key, value, percent, offset: cumulativePercent, color: colorMap[key] || "#D1D5DB" };
    cumulativePercent += percent;
    return segment;
  });

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 36 36" className="w-32 h-32 shrink-0">
        {segments.map((seg) => (
          <circle
            key={seg.key}
            cx="18" cy="18" r="15.91549430918954"
            fill="transparent"
            stroke={seg.color}
            strokeWidth="3"
            strokeDasharray={`${seg.percent} ${100 - seg.percent}`}
            strokeDashoffset={`${-(seg.offset)}`}
            className="transition-all duration-500"
          />
        ))}
        <text x="18" y="18" textAnchor="middle" dominantBaseline="central"
          className="fill-foreground text-[6px] font-bold">{total}</text>
        <text x="18" y="22" textAnchor="middle" dominantBaseline="central"
          className="fill-muted-foreground text-[3px]">total</text>
      </svg>
      <div className="space-y-1.5 flex-1">
        {segments.map((seg) => (
          <div key={seg.key} className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="flex-1 truncate">{seg.key}</span>
            <span className="font-medium tabular-nums">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CoverageGauge({ covered, total, percent }: { covered: number; total: number; percent: number }) {
  const angle = (percent / 100) * 180;
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 120 70" className="w-48 h-28">
        <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
        <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="url(#coverageGrad)" strokeWidth="8"
          strokeDasharray={`${(angle / 180) * 157} 157`}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
        <defs>
          <linearGradient id="coverageGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        <text x="60" y="50" textAnchor="middle" className="fill-foreground text-xl font-bold">{percent}%</text>
        <text x="60" y="64" textAnchor="middle" className="fill-muted-foreground text-xs">coverage</text>
      </svg>
      <div className="flex gap-6 text-sm mt-2">
        <span className="text-emerald-500 font-medium">{covered} covered</span>
        <span className="text-muted-foreground">{total - covered} uncovered</span>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { data: testCasesData, isLoading: loadingCases } = useTestCases({ size: 1 });
  const { data: testPlansData, isLoading: loadingPlans } = useTestPlans({ size: 1 });
  const { data: storiesData, isLoading: loadingStories } = useStories({ size: 1 });
  const { data: testSuitesData, isLoading: loadingSuites } = useTestSuites({ size: 1 });
  const { data: report, isLoading: loadingReport } = useReports();

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Quality Analytics</h1>
          <p className="text-muted-foreground mt-1">Overview of QA performance metrics and test execution status</p>
        </div>
        <Button className="gap-2 bg-primary shadow-lg shadow-primary/20">
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">Total Test Cases</p>
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          {loadingCases ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <p className="text-3xl font-bold">{(testCasesData?.page?.totalElements ?? 0).toLocaleString()}</p>
          )}
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">Total Test Plans</p>
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          {loadingPlans ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <p className="text-3xl font-bold">{(testPlansData?.page?.totalElements ?? 0).toLocaleString()}</p>
          )}
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">User Stories</p>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          {loadingStories ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <p className="text-3xl font-bold">{(storiesData?.page?.totalElements ?? 0).toLocaleString()}</p>
          )}
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">Test Suites</p>
            <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-lg flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          {loadingSuites ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <p className="text-3xl font-bold">{(testSuitesData?.page?.totalElements ?? 0).toLocaleString()}</p>
          )}
        </div>
      </div>

      {/* Charts */}
      {loadingReport ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : report ? (
        <>
          {/* Row 1: AI vs Manual + Coverage */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-1">AI vs Manual Test Generation</h3>
              <p className="text-sm text-muted-foreground mb-5">Breakdown of how test cases were created</p>
              <DonutChart data={report.aiVsManualDistribution} />
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-1">Requirement Coverage</h3>
              <p className="text-sm text-muted-foreground mb-5">Stories with linked test cases</p>
              <CoverageGauge
                covered={report.requirementCoverage.coveredStories}
                total={report.requirementCoverage.totalStories}
                percent={report.requirementCoverage.coveragePercent}
              />
            </div>
          </div>

          {/* Row 2: Story Status + Test Case Types */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-1">Story Status Breakdown</h3>
              <p className="text-sm text-muted-foreground mb-5">Status of all user stories</p>
              <div className="space-y-3">
                {Object.entries(report.storyStatusDistribution).map(([status, count]) => (
                  <BarItem
                    key={status}
                    label={status}
                    value={count}
                    total={Object.values(report.storyStatusDistribution).reduce((a, b) => a + b, 0)}
                    color={STATUS_COLORS[status] || "#D1D5DB"}
                  />
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-1">Test Case Types</h3>
              <p className="text-sm text-muted-foreground mb-5">Distribution by test case type</p>
              <DonutChart data={report.testCaseTypeDistribution} />
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>Unable to load report data</p>
        </div>
      )}
    </div>
  );
}
