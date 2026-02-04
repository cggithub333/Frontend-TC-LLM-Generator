"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  MoreVertical,
  Calendar,
  FileText,
  Brain,
  History,
  Rocket,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "user-story", label: "User Story" },
  { id: "test-case", label: "Test Case" },
  { id: "test-plan", label: "Test Plan" },
];

const statusFilters = [
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
  { id: "draft", label: "Draft" },
];

const typeFilters = [
  { id: "all", label: "ALL TYPES", active: true },
  { id: "sprint", label: "SPRINT" },
  { id: "release", label: "RELEASE" },
  { id: "regression", label: "REGRESSION" },
];

const storyDistribution = [
  { id: "#102", name: "Guest Checkout", cases: 12, progress: 100, color: "bg-blue-400" },
  { id: "#105", name: "PayPal Integration", cases: 24, progress: 50, color: "bg-indigo-500" },
  { id: "#108", name: "Coupon Validation", cases: 12, progress: 40, color: "bg-cyan-400" },
];

const relatedPlans = [
  {
    id: "regression",
    name: "Regression - Core API",
    status: "ongoing",
    statusColor: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
    description: "Progress: 12/110 passed",
    icon: History,
    iconBg: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-orange-600",
  },
  {
    id: "release",
    name: "v2.4 Release Candidate",
    status: "pending",
    statusColor: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
    description: "Starts in 2 days",
    icon: Rocket,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600",
  },
];

export default function TestPlanDetailPage() {
  const params = useParams();
  const planId = params.id as string;
  
  const [activeTab, setActiveTab] = useState("test-plan");
  const [activeStatus, setActiveStatus] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-card border-b shrink-0">
        <header className="h-20 flex items-center justify-between px-8">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <h1 className="text-2xl font-bold">Test Planning</h1>
            <div className="relative flex-1 ml-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search plans by name or type..."
                className="pl-10 bg-muted border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Plan
          </Button>
        </header>

        {/* Navigation Tabs */}
        <nav className="px-8 flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "pb-4 text-sm font-semibold transition-colors relative",
                activeTab === tab.id
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Filters Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          {/* Status Tabs */}
          <div className="flex p-1.5 bg-muted rounded-xl w-fit">
            {statusFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveStatus(filter.id)}
                className={cn(
                  "px-6 py-2 rounded-lg text-sm font-semibold transition-all",
                  activeStatus === filter.id
                    ? "bg-card shadow-sm"
                    : "text-muted-foreground"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Type Filters */}
          <div className="flex gap-2 overflow-x-auto">
            {typeFilters.map((filter) => (
              <button
                key={filter.id}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors",
                  filter.active
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-card border text-muted-foreground hover:text-foreground"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Active Plans</h2>
          <span className="text-xs font-bold text-muted-foreground tracking-widest uppercase">
            3 Total
          </span>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Main Plan Card */}
          <div className="xl:col-span-2 bg-card border rounded-2xl overflow-hidden shadow-sm">
            {/* Plan Header */}
            <div className="p-6 border-b">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-0 text-[10px] font-bold uppercase tracking-wider">
                    Sprint Plan
                  </Badge>
                  <h3 className="text-xl font-bold mt-2">Sprint 24 - Checkout Flow</h3>
                  <div className="flex items-center gap-4 mt-2 text-muted-foreground text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Oct 12 - Oct 26
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      48 Test Cases
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>

              {/* Progress */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold">Execution Progress</span>
                  <span className="text-sm font-bold text-primary">65%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "65%" }} />
                </div>
              </div>
            </div>

            {/* Plan Body */}
            <div className="p-6">
              {/* AI Suggestion */}
              <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 rounded-xl p-4 mb-6 flex gap-4">
                <div className="w-10 h-10 shrink-0 bg-purple-600 rounded-lg flex items-center justify-center text-white">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-purple-700 dark:text-purple-300 font-bold text-sm">AI Suggestion</p>
                  <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                    Found 3 missing edge cases for User Story #102: "Guest Checkout".{" "}
                    <Link href="#" className="underline font-semibold">Click to generate.</Link>
                  </p>
                </div>
              </div>

              {/* Story Distribution */}
              <div className="space-y-6">
                <p className="text-sm font-bold">Story Distribution</p>
                <div className="space-y-4">
                  {storyDistribution.map((story) => (
                    <div key={story.id}>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>{story.id} {story.name}</span>
                        <span>{story.cases} cases</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full">
                        <div
                          className={cn("h-full rounded-full", story.color)}
                          style={{ width: `${story.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* View Report Link */}
            <Link
              href="#"
              className="block p-4 text-center text-primary text-sm font-bold border-t hover:bg-muted/50 transition-colors"
            >
              View Full Report →
            </Link>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Related Plans */}
            {relatedPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-card border p-5 rounded-2xl shadow-sm hover:border-primary/30 transition-all cursor-pointer group"
              >
                <div className="flex gap-4 items-start">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", plan.iconBg)}>
                    <plan.icon className={cn("h-5 w-5", plan.iconColor)} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold">{plan.name}</h4>
                      <Badge className={cn("text-[10px] font-bold uppercase tracking-wider border-0", plan.statusColor)}>
                        {plan.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Quick Stats Card */}
            <div className="bg-primary p-6 rounded-2xl text-white shadow-lg shadow-primary/20">
              <p className="text-primary-foreground/80 text-xs font-bold uppercase tracking-widest mb-4">
                Quick Stats
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold">142</p>
                  <p className="text-[10px] opacity-70">Total Runs</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">98.2%</p>
                  <p className="text-[10px] opacity-70">Pass Rate</p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-medium">Team Efficiency</span>
                <span className="text-xs font-bold px-2 py-1 bg-white/20 rounded-full">+12%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating AI Button */}
      <Button
        className="fixed bottom-8 right-8 pl-5 pr-7 py-6 rounded-full shadow-2xl shadow-primary/40 gap-3 hover:scale-105 active:scale-95 transition-all z-50"
        size="lg"
      >
        <Zap className="h-5 w-5 animate-pulse" />
        <span className="font-bold tracking-tight">Generate with AI</span>
      </Button>
    </div>
  );
}
