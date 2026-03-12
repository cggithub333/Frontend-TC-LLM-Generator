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
  Brain,
  Zap,
  Loader2,
  AlertCircle,
  User,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTestPlan } from "@/hooks/use-test-plans";

const tabs = [
  { id: "user-story", label: "User Story" },
  { id: "test-case", label: "Test Case" },
  { id: "test-plan", label: "Test Plan" },
];

function getStatusBadge(status: string) {
  const s = status?.toLowerCase();
  if (s === "in_progress" || s === "in-progress" || s === "active") {
    return (
      <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-0 text-[10px] font-bold uppercase tracking-wider">
        {status.toUpperCase().replace("_", " ")}
      </Badge>
    );
  }
  if (s === "draft") {
    return (
      <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-0 text-[10px] font-bold uppercase tracking-wider">
        DRAFT
      </Badge>
    );
  }
  if (s === "completed" || s === "done") {
    return (
      <Badge className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-0 text-[10px] font-bold uppercase tracking-wider">
        COMPLETED
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">
      {status?.toUpperCase() ?? "UNKNOWN"}
    </Badge>
  );
}

export default function TestPlanDetailPage() {
  const params = useParams();
  const planId = params.id as string;
  
  const [activeTab, setActiveTab] = useState("test-plan");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: plan, isLoading, error } = useTestPlan(planId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">Failed to load test plan</p>
        <Link href="/test-plans" className="mt-4 text-primary hover:underline text-sm">
          ← Back to Test Plans
        </Link>
      </div>
    );
  }

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
        {/* Back link */}
        <Link href="/test-plans" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Test Plans
        </Link>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Main Plan Card */}
          <div className="xl:col-span-2 bg-card border rounded-2xl overflow-hidden shadow-sm">
            {/* Plan Header */}
            <div className="p-6 border-b">
              <div className="flex items-start justify-between mb-4">
                <div>
                  {getStatusBadge(plan.status)}
                  <h3 className="text-xl font-bold mt-2">{plan.name}</h3>
                  <div className="flex items-center gap-4 mt-2 text-muted-foreground text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(plan.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {plan.createdByUserFullName}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Plan Body */}
            <div className="p-6">
              {/* Description */}
              {plan.description ? (
                <div className="mb-6">
                  <p className="text-sm font-bold mb-2">Description</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{plan.description}</p>
                </div>
              ) : (
                <div className="mb-6 text-sm text-muted-foreground italic">No description provided.</div>
              )}

              {/* AI Suggestion */}
              <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 rounded-xl p-4 flex gap-4">
                <div className="w-10 h-10 shrink-0 bg-purple-600 rounded-lg flex items-center justify-center text-white">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-purple-700 dark:text-purple-300 font-bold text-sm">AI Suggestion</p>
                  <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                    Generate test cases from user stories linked to this plan using AI.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Plan Info Card */}
            <div className="bg-card border p-5 rounded-2xl shadow-sm">
              <p className="text-sm font-bold mb-4">Plan Details</p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium">{plan.status?.toUpperCase().replace("_", " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">{new Date(plan.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created by</span>
                  <span className="font-medium">{plan.createdByUserFullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Project</span>
                  <Link href={`/projects/${plan.projectId}`} className="font-medium text-primary hover:underline">
                    View Project
                  </Link>
                </div>
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
