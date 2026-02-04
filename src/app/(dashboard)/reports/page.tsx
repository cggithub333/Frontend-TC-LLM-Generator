"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  FileText,
  CheckCircle2,
  Sparkles,
  Bug,
  Calendar,
  Download
} from "lucide-react";

// Mock data for charts
const executionTrendData = [
  { week: "Week 1", passed: 120, failed: 15 },
  { week: "Week 2", passed: 145, failed: 12 },
  { week: "Week 3", passed: 180, failed: 8 },
  { week: "Week 4", passed: 195, failed: 10 },
];

const testSuiteHealthData = [
  { name: "Authentication", health: 100 },
  { name: "Checkout Process", health: 92 },
  { name: "User Profile", health: 88 },
  { name: "Search Engine", health: 96 },
];

const aiProductivityData = [
  { type: "Manual", time: 45, color: "#94a3b8" },
  { type: "AI Assisted", time: 12, color: "#2563eb" },
];

const testStatusData = [
  { name: "Pass", value: 292, color: "#10b981" },
  { name: "Fail", value: 67, color: "#ef4444" },
  { name: "Blocked", value: 45, color: "#f59e0b" },
  { name: "Pending", value: 46, color: "#e2e8f0" },
];

const failingSuites = [
  { name: "Payment Gateway Integration", failed: 12, total: 45, rate: 26.6, lastRun: "2 mins ago", owner: "Sarah" },
  { name: "User Authentication Flow", failed: 8, total: 120, rate: 6.6, lastRun: "1 hr ago", owner: "Mike" },
  { name: "Cart Calculation Logic", failed: 5, total: 80, rate: 6.2, lastRun: "4 hrs ago", owner: "Jessica" },
  { name: "API Rate Limiting", failed: 2, total: 200, rate: 1.0, lastRun: "Yesterday", owner: "Tom" },
];

const recentActivity = [
  { type: "fail", title: "Regression Suite Failed", description: "Critical error in Checkout module.", time: "10m ago" },
  { type: "pass", title: "Smoke Test Passed", description: "v2.4.0 deployment verification successful.", time: "45m ago" },
  { type: "info", title: "New Defect Reported", description: "UI misalignment on mobile devices reported by QA.", time: "2h ago" },
  { type: "pass", title: "API Tests Completed", description: "All 240 endpoints verified.", time: "4h ago" },
];

export default function ReportsPage() {
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">Total Test Cases</p>
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-bold">1,245</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <p className="text-emerald-600 text-xs font-semibold">
              +5% <span className="text-muted-foreground font-normal">vs last month</span>
            </p>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">Pass Rate</p>
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-bold">94.2%</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <p className="text-emerald-600 text-xs font-semibold">
              +1.2% <span className="text-muted-foreground font-normal">vs last month</span>
            </p>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">AI Generated</p>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-bold">68%</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <p className="text-emerald-600 text-xs font-semibold">
              +15% <span className="text-muted-foreground font-normal">adoption rate</span>
            </p>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">Defects Found</p>
            <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-lg flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Bug className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-bold">12</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingDown className="h-4 w-4 text-rose-500" />
            <p className="text-rose-500 text-xs font-semibold">
              -3% <span className="text-muted-foreground font-normal">vs last month</span>
            </p>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart - Test Status */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold">Current Test Plan Status</h3>
              <p className="text-sm text-muted-foreground">Distribution across all active suites</p>
            </div>
            <Badge variant="outline" className="text-xs">Total: 450 Tests</Badge>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie
                  data={testStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {testStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4">
              {testStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <div>
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.value} tests</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gauge Chart - Coverage */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold">Requirement Coverage</h3>
            <p className="text-sm text-muted-foreground">Test cases vs defined requirements</p>
          </div>
          <div className="flex flex-col items-center justify-center py-8">
            <div className="relative w-48 h-24 overflow-hidden">
              <div className="w-48 h-48 rounded-full border-[20px] border-muted absolute top-0 left-0" />
              <div
                className="w-48 h-48 rounded-full border-[20px] border-primary absolute top-0 left-0"
                style={{
                  clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)",
                  transform: "rotate(153deg)",
                }}
              />
            </div>
            <div className="text-center -mt-6">
              <h2 className="text-4xl font-black">85%</h2>
              <p className="text-sm font-medium text-emerald-600 flex items-center gap-1 justify-center mt-1">
                <TrendingUp className="h-4 w-4" />
                +2.4%
              </p>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-6">
              Target: 90% by end of sprint
            </p>
          </div>
        </div>
      </div>

      {/* Line Chart - Execution Trend */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-bold">Test Execution Trend</h3>
            <p className="text-sm text-muted-foreground">Total executions over the last 30 days</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs font-medium">Passed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted" />
              <span className="text-xs font-medium">Failed</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={executionTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip />
            <Line type="monotone" dataKey="passed" stroke="#2563eb" strokeWidth={3} />
            <Line type="monotone" dataKey="failed" stroke="hsl(var(--muted))" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Suite Health */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold">Test Suite Health</h3>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-3xl font-bold">98%</span>
              <span className="text-sm font-medium text-emerald-600 mb-1.5">Healthy</span>
            </div>
          </div>
          <div className="space-y-5">
            {testSuiteHealthData.map((suite) => (
              <div key={suite.name}>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span>{suite.name}</span>
                  <span>{suite.health}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div
                    className={`h-full rounded-full ${
                      suite.health >= 95 ? "bg-primary" : "bg-orange-400"
                    }`}
                    style={{ width: `${suite.health}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Productivity */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold">AI Productivity</h3>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-3xl font-bold">3.5x</span>
                <span className="text-sm font-medium text-purple-600 mb-1.5">Faster Generation</span>
              </div>
            </div>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-300" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={aiProductivityData}>
              <XAxis dataKey="type" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Bar dataKey="time" radius={[8, 8, 0, 0]}>
                {aiProductivityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Average time per test case generation (minutes)
          </p>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Failing Suites Table */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Top Failing Test Suites</h3>
            <Button variant="link" className="text-primary font-semibold">View All</Button>
          </div>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Suite Name</th>
                  <th className="px-6 py-3 text-center font-semibold">Failed / Total</th>
                  <th className="px-6 py-3 text-left font-semibold">Error Rate</th>
                  <th className="px-6 py-3 text-left font-semibold">Last Run</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {failingSuites.map((suite, i) => (
                  <tr key={i} className="hover:bg-accent/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{suite.name}</td>
                    <td className="px-6 py-4 text-center text-muted-foreground">
                      {suite.failed} / {suite.total}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={
                          suite.rate > 20
                            ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                            : suite.rate > 5
                            ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400"
                            : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                        }
                      >
                        {suite.rate}%
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{suite.lastRun}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Recent Activity</h3>
          <div className="bg-card border border-border rounded-2xl p-5">
            <ul className="relative border-l border-border ml-3 space-y-6">
              {recentActivity.map((activity, i) => (
                <li key={i} className="ml-6">
                  <span
                    className={`absolute -left-2.5 flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-background ${
                      activity.type === "fail"
                        ? "bg-red-100 dark:bg-red-900"
                        : activity.type === "pass"
                        ? "bg-green-100 dark:bg-green-900"
                        : "bg-blue-100 dark:bg-blue-900"
                    }`}
                  >
                    {activity.type === "fail" && <span className="text-red-600 text-xs">✕</span>}
                    {activity.type === "pass" && <span className="text-green-600 text-xs">✓</span>}
                    {activity.type === "info" && <span className="text-blue-600 text-xs">!</span>}
                  </span>
                  <h4 className="flex items-center gap-2 text-sm font-semibold">
                    {activity.title}
                    <span className="text-[10px] font-normal text-muted-foreground">{activity.time}</span>
                  </h4>
                  <p className="mt-1 text-sm text-muted-foreground">{activity.description}</p>
                </li>
              ))}
            </ul>
            <Button variant="ghost" className="w-full mt-6 text-muted-foreground hover:text-primary">
              View Full History
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
