"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ChevronRight,
  Plus,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  MoreHorizontal,
  ArrowRight,
  FlaskConical,
  Calendar,
  CheckCircle,
  Bell,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTestPlans } from "@/hooks/use-test-plans";
import { extractPage } from "@/types/pagination.types";
import type { TestPlan } from "@/types/test-plan.types";

const tabs = [
  { id: "test-plans", label: "Test Plans" },
  { id: "user-stories", label: "User Stories" },
  { id: "test-cases", label: "Test Cases" },
];

function getStatusBadge(status: string) {
  const s = status?.toLowerCase();
  if (s === "in_progress" || s === "in-progress" || s === "active") {
    return (
      <Badge className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800 font-bold text-xs">
        {status.toUpperCase().replace("_", " ")}
      </Badge>
    );
  }
  if (s === "draft") {
    return (
      <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold text-xs">
        DRAFT
      </Badge>
    );
  }
  if (s === "completed" || s === "done") {
    return (
      <Badge className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-100 dark:border-green-800 font-bold text-xs">
        COMPLETED
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="font-bold text-xs">
      {status?.toUpperCase() ?? "UNKNOWN"}
    </Badge>
  );
}

export default function TestPlansPage() {
  const [activeTab, setActiveTab] = useState("test-plans");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: plansData, isLoading, error } = useTestPlans();
  const testPlans = plansData ? extractPage<TestPlan>(plansData).items : [];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-card border-b px-6 pt-6 pb-0">
        <div className="flex flex-col gap-6">
          {/* Top Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              {/* Breadcrumb */}
              <nav className="flex items-center text-sm text-muted-foreground mb-1">
                <Link
                  href="/workspaces"
                  className="hover:text-primary transition-colors"
                >
                  Workspaces
                </Link>
                <ChevronRight className="h-4 w-4 mx-1" />
                <span>Test Plans</span>
              </nav>
              <h1 className="text-2xl font-bold">Test Plans</h1>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon">
                <Bell className="h-5 w-5 text-muted-foreground" />
              </Button>
              <Button className="gap-2 shadow-md shadow-primary/20">
                <Plus className="h-4 w-4" />
                Create Plan
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-8 border-b -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "pb-3 border-b-2 font-semibold px-1 transition-colors",
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-6 max-w-7xl mx-auto">
        {/* Search and Filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search test plans..."
              className="pl-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" className="gap-2">
            <ArrowUpDown className="h-4 w-4" />
            Sort
          </Button>
        </div>

        {/* Loading / Error / Empty */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Failed to load test plans</p>
          </div>
        )}

        {!isLoading && !error && testPlans.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <FlaskConical className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No test plans yet</p>
            <p className="text-sm mt-1">
              Create your first test plan to get started.
            </p>
          </div>
        )}

        {/* Test Plan Cards Grid */}
        {!isLoading && !error && testPlans.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testPlans.map((plan) => (
              <Link
                key={plan.testPlanId}
                href={`/test-plans/${plan.testPlanId}`}
                className={cn(
                  "bg-card border rounded-2xl p-5 hover:shadow-lg transition-all group cursor-pointer",
                  "hover:border-primary/30",
                )}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    {getStatusBadge(plan.status)}
                    <h3 className="font-bold text-lg leading-tight mt-2">
                      {plan.name}
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {plan.description || "No description"}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between border-t pt-4 mt-auto">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(plan.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    by {plan.createdByUserFullName}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
