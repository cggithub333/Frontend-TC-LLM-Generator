"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/use-websocket";
import { useTestPlansByProject } from "@/hooks/use-test-plans";
import { CreateTestPlanDialog } from "@/components/features/test-plans/create-test-plan-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  FlaskConical,
  Calendar,
  Loader2,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { TestPlanStatus } from "@/types/test-plan.types";

function StatusBadge({ status }: { status: string }) {
  if (status === "IN_PROGRESS") {
    return (
      <Badge className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800 font-bold text-xs">
        IN PROGRESS
      </Badge>
    );
  }
  if (status === "COMPLETED") {
    return (
      <Badge className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-100 dark:border-green-800 font-bold text-xs">
        COMPLETED
      </Badge>
    );
  }
  return (
    <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold text-xs">
      DRAFT
    </Badge>
  );
}

const STATUS_FILTERS: { label: string; value: TestPlanStatus | "" }[] = [
  { label: "All", value: "" },
  { label: "Draft", value: "DRAFT" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
];

export default function ProjectTestPlansPage() {
  const params = useParams();
  const projectId = params.id as string;
  const queryClient = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TestPlanStatus | "">("");

  // Real-time updates via WebSocket
  useWebSocket({
    topic: `/topic/projects/${projectId}/test-plans`,
    onMessage: () => {
      queryClient.invalidateQueries({
        queryKey: ["testPlans", "project", projectId],
      });
    },
  });

  const { data, isLoading, error } = useTestPlansByProject(projectId, {
    status: statusFilter || undefined,
    size: 50,
  });

  const allPlans = data?.items ?? [];
  const plans = searchQuery
    ? allPlans.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allPlans;

  return (
    <div className="p-8 space-y-6">
      {/* Page Title + Toolbar */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold shrink-0">Test Plans</h1>
        <div className="flex items-center gap-3 flex-1 justify-end">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search test plans..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status filter pills */}
          <div className="flex items-center gap-1.5">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value as TestPlanStatus | "")}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border",
                  statusFilter === f.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary/50"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <Button
            className="gap-2 shadow-md shadow-primary/20 shrink-0"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Create Plan
          </Button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <AlertCircle className="h-10 w-10 mb-3" />
          <p className="font-medium">Failed to load test plans</p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && plans.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <FlaskConical className="h-12 w-12 mb-4 opacity-40" />
          <p className="text-lg font-semibold">
            {statusFilter ? "No test plans with this status" : "No test plans yet"}
          </p>
          <p className="text-sm mt-1">
            {statusFilter
              ? "Try a different filter."
              : "Create your first test plan to get started."}
          </p>
          {!statusFilter && (
            <Button
              className="mt-4 gap-2"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Create Test Plan
            </Button>
          )}
        </div>
      )}

      {/* Grid */}
      {!isLoading && !error && plans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <Link
              key={plan.testPlanId}
              href={`/test-plans/${plan.testPlanId}`}
              className={cn(
                "bg-card border rounded-2xl p-5 hover:shadow-lg transition-all cursor-pointer",
                "hover:border-primary/30 flex flex-col gap-3"
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <StatusBadge status={plan.status} />
                  <h3 className="font-bold text-base leading-tight line-clamp-2 mt-1">
                    {plan.name}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                {plan.description || "No description"}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between border-t pt-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date(plan.createdAt).toLocaleDateString()}</span>
                </div>
                {(plan.storyIds?.length ?? 0) > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>{plan.storyIds!.length} stories</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <CreateTestPlanDialog
        projectId={projectId}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  );
}
