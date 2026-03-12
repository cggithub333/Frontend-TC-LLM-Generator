"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  FileText,
  CheckCircle2,
  Sparkles,
  Layers,
  Download,
  Loader2,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  LineChart as LineChartIcon,
} from "lucide-react";
import { useTestCases } from "@/hooks/use-test-cases";
import { useTestPlans } from "@/hooks/use-test-plans";
import { useStories } from "@/hooks/use-stories";
import { useTestSuites } from "@/hooks/use-test-suites";

export default function ReportsPage() {
  const { data: testCasesData, isLoading: loadingCases } = useTestCases({ size: 1 });
  const { data: testPlansData, isLoading: loadingPlans } = useTestPlans({ size: 1 });
  const { data: storiesData, isLoading: loadingStories } = useStories({ size: 1 });
  const { data: testSuitesData, isLoading: loadingSuites } = useTestSuites({ size: 1 });

  const isLoading = loadingCases || loadingPlans || loadingStories || loadingSuites;

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Quality Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Overview of QA performance metrics and test execution status
          </p>
        </div>
        <Button className="gap-2 bg-primary shadow-lg shadow-primary/20">
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      {/* Stats Cards — real counts from API */}
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
            <p className="text-3xl font-bold">{testCasesData?.page?.totalElements?.toLocaleString() ?? 0}</p>
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
            <p className="text-3xl font-bold">{testPlansData?.page?.totalElements?.toLocaleString() ?? 0}</p>
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
            <p className="text-3xl font-bold">{storiesData?.page?.totalElements?.toLocaleString() ?? 0}</p>
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
            <p className="text-3xl font-bold">{testSuitesData?.page?.totalElements?.toLocaleString() ?? 0}</p>
          )}
        </div>
      </div>

      {/* Charts Placeholder — analytics endpoints coming soon */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold">Test Status Distribution</h3>
              <p className="text-sm text-muted-foreground">Distribution across all active suites</p>
            </div>
            <Badge variant="outline" className="text-xs">Coming Soon</Badge>
          </div>
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <PieChartIcon className="h-16 w-16 mb-4 opacity-30" />
            <p className="text-sm font-medium">Analytics data will be available once the reporting API is ready.</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold">Requirement Coverage</h3>
            <p className="text-sm text-muted-foreground">Test cases vs defined requirements</p>
          </div>
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <BarChart3 className="h-16 w-16 mb-4 opacity-30" />
            <Badge variant="outline" className="text-xs">Coming Soon</Badge>
          </div>
        </div>
      </div>

      {/* Execution Trend Placeholder */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-bold">Test Execution Trend</h3>
            <p className="text-sm text-muted-foreground">Total executions over the last 30 days</p>
          </div>
          <Badge variant="outline" className="text-xs">Coming Soon</Badge>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <LineChartIcon className="h-16 w-16 mb-4 opacity-30" />
          <p className="text-sm font-medium">Execution trend data requires the analytics API.</p>
        </div>
      </div>

      {/* Suite Health & AI Productivity Placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold">Test Suite Health</h3>
            <p className="text-sm text-muted-foreground">Health metrics per suite</p>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Activity className="h-12 w-12 mb-4 opacity-30" />
            <Badge variant="outline" className="text-xs">Coming Soon</Badge>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold">AI Productivity</h3>
            <p className="text-sm text-muted-foreground">Manual vs AI-assisted generation comparison</p>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Sparkles className="h-12 w-12 mb-4 opacity-30" />
            <Badge variant="outline" className="text-xs">Coming Soon</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
