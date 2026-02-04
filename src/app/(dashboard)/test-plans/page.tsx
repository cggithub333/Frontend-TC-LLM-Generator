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
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "test-plans", label: "Test Plans" },
  { id: "user-stories", label: "User Stories" },
  { id: "test-cases", label: "Test Cases" },
];

const testPlans = [
  {
    id: "1",
    name: "Sprint 24 - Biometric Auth",
    status: "in-progress",
    progress: 65,
    testCount: 24,
    date: "Oct 24",
    avatars: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD1PY9j0MLiP8sMZLGcbX1ScHZUJu7zcR9tf4DuRb9VVgWVH_ea-0H5RZBhjNDi4KXd3cdrxIce4pphOSEQ5IAl-6z9fBNNr2xud2MqPzvsjMgHWr6i1DVixFgTTRYEqIH8xj0fOuC5aIhngtDVelp-YU_qpV6okGXUpE5IHkZfdyj4nkEx4WA61OwirDfNqNAWRUGNIc8b5pbKz2oEdR7g487DG7IsuyZhbWWPLyfD1CC7LubTUxXzSpk5Kq1ozWsplmUIj6-zOmIo",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCSUMSTKYmh8tu4tYnrcXMMkOYnUSMk0c0SIj7BjJF9YatXYekBvK3IPNdPipisRh6gSDErO2L7jLjm1Mf9ZY7ZhwNz0ghHvRV5Y4kMEvuaKmOSLnLJtx_MX_35gbcQrg00H9dYU53xRmfG0jXjjqc1NhDl7CIPQhLvTBLoIlTpaz1W2mWjZY76r8D_0K6h_v4ODS7FkUlfIYB8syYxdlttL5fOmrKOzpIphzmIIXsRB1Aflqj1VQ8tNu3LsoHGT3TJ6dU6J3AKMD-W",
    ],
    action: "run",
  },
  {
    id: "2",
    name: "Regression Pack v2.1",
    status: "draft",
    progress: 0,
    testCount: 156,
    date: "Nov 01",
    avatars: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuArBuQTeuNSAp-C8cBwhm8LXL78qgcFpTXsP0DxrXKnQozwkZYR6TLDVYl2YglCf6glPOhYbdh47TbHvJCzV0ypsua8ybp4PeKfuauIz6yFFmC4rOUYM3KY3LIYrkdRhh9OPHPF8toeSr4_v_QwYcpM_APDoeZ93cIT20VZUrtIZIz6NzTZ0H-6T8SRNPqcqWye908zBIhMZ1-ZBGswZkL42SUbP44SQwBiDh702DZGwHz_SsQb0_Tj7vxPYXwihkrQREIyEZEbgYY9",
    ],
    action: "edit",
  },
  {
    id: "3",
    name: "Payment Gateway Integration",
    status: "completed",
    progress: 100,
    testCount: 32,
    passed: true,
    avatars: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBxTj7z4QPeQFmtGJKy6iQEQTNIdj8aLB-gAybEU113DYHKz98yuCzKluEE5F0OzimzFcZih4EmJBlC77WgmhrFGNy3vRinuWzbqF2ClEkIroV4twZpcuy3FIGx74reSZJLB3XYlRGz3BI4eoQygQf6KZSja8-NBLZXHM6NB4QMn5-4vySZugB8RdSD2i4e63MSsvHYaXJVrxoT3XxH6WgP0WS3QP3zRq7mLIyXkf5pFvSfRbeHPkPbSO7i4UsX1FYdX4PNfXVTdZir",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDWlFSmtSca_h5SeW58hFllnLAN8R3yaeQVlJHABNuzcQGY4W-6pT9EfgzThzv1fqPRpSqLckPrsMznvi_pxNnYWWlsmxBYuDRqI5bpPLfwAufxtsuhhi7JoLduVder6_4v3XrZufLXopc1YoI4kiDD-UnvDTTOaAZhSkPOVR19Nvo0gijhF_GadK-w5H92gtUxyWElmJX-6dIKh4nbS_rmkBHsxHYkSeKkHBAB7IqZdf1qnf14mwoF2Pb0wgx8To3GCFuz1L5-1oqq",
    ],
    extraCount: 1,
    action: "report",
  },
  {
    id: "4",
    name: "Mobile V2 - Smoke Test",
    status: "in-progress",
    progress: 32,
    testCount: 8,
    date: "Today",
    avatars: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCxqNoOo0Q2_9OFDgXz6Vri_QqVc3mvu1hE5AHpliFY-4DgpTy_7a5GKujZED3BTMXRGgQI8Yn2Y8rZ8_Me-u9lKCMXnkP11PyJMoKZbTs-Pmu0bFGUvz7hybwIAKo8jN1m7B2I4xeJkHVwBRgxabH3sd9tlSJ2hMtGVwQYPai8WgLYeOtuxkZLeW8mDflA1Hv6Mu9N2Qb7FoRtiUw2tyrbWzuXkVsQCnz_t7gvmO3OvA6qRoa8psZ_ZlO2DO3WVbHL_jfic0hiH79U",
    ],
    action: "run",
  },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "in-progress":
      return (
        <Badge className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800 font-bold text-xs">
          IN PROGRESS
        </Badge>
      );
    case "draft":
      return (
        <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold text-xs">
          DRAFT
        </Badge>
      );
    case "completed":
      return (
        <Badge className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-100 dark:border-green-800 font-bold text-xs">
          COMPLETED
        </Badge>
      );
    default:
      return null;
  }
}

function getProgressBarColor(status: string) {
  switch (status) {
    case "in-progress":
      return "bg-primary";
    case "draft":
      return "bg-slate-300 dark:bg-slate-700";
    case "completed":
      return "bg-green-500";
    default:
      return "bg-primary";
  }
}

export default function TestPlansPage() {
  const [activeTab, setActiveTab] = useState("test-plans");
  const [searchQuery, setSearchQuery] = useState("");

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
                <Link href="/workspaces" className="hover:text-primary transition-colors">Workspaces</Link>
                <ChevronRight className="h-4 w-4 mx-1" />
                <span>Mobile Redesign V2</span>
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
                    : "border-transparent text-muted-foreground hover:text-foreground"
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

        {/* Test Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testPlans.map((plan) => (
            <Link
              key={plan.id}
              href={`/test-plans/${plan.id}`}
              className={cn(
                "bg-card border rounded-2xl p-5 hover:shadow-lg transition-all group cursor-pointer",
                plan.status === "in-progress" && "hover:border-blue-200 dark:hover:border-blue-900/50",
                plan.status === "completed" && "hover:border-green-200 dark:hover:border-green-900/50",
                plan.status === "draft" && "hover:border-slate-300 dark:hover:border-slate-700"
              )}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  {getStatusBadge(plan.status)}
                  <h3 className="font-bold text-lg leading-tight mt-2">{plan.name}</h3>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>

              {/* Progress Section */}
              <div className="mb-6 space-y-3">
                <div className="flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <span>Progress</span>
                  <span className={cn(
                    plan.status === "completed" ? "text-green-600 dark:text-green-400 font-bold" : "text-foreground"
                  )}>
                    {plan.progress}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className={cn("h-2 rounded-full", getProgressBarColor(plan.status))}
                    style={{ width: `${plan.progress}%` }}
                  />
                </div>
                <div className="flex gap-4 pt-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <FlaskConical className="h-4 w-4" />
                    <span>{plan.testCount} Tests</span>
                  </div>
                  {plan.passed ? (
                    <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-medium">
                      <CheckCircle className="h-4 w-4" />
                      <span>Passed</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      <span>{plan.date}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t pt-4 mt-auto">
                {/* Avatars */}
                <div className="flex -space-x-2">
                  {plan.avatars.map((avatar, idx) => (
                    <img
                      key={idx}
                      src={avatar}
                      alt="Team member"
                      className="w-8 h-8 rounded-full border-2 border-card bg-muted object-cover"
                    />
                  ))}
                  {plan.extraCount && (
                    <div className="w-8 h-8 rounded-full border-2 border-card bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                      +{plan.extraCount}
                    </div>
                  )}
                </div>

                {/* Action */}
                {plan.action === "run" && (
                  <button className="text-primary font-semibold text-sm hover:text-blue-700 dark:hover:text-blue-400 flex items-center gap-1 transition-colors">
                    Run
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
                {plan.action === "edit" && (
                  <button className="text-muted-foreground font-semibold text-sm hover:text-foreground flex items-center gap-1 transition-colors">
                    Edit Details
                  </button>
                )}
                {plan.action === "report" && (
                  <button className="text-primary font-semibold text-sm hover:text-blue-700 dark:hover:text-blue-400 flex items-center gap-1 transition-colors">
                    View Report
                  </button>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
