"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/use-websocket";
import {
  useTestPlan,
  useTestPlanStories,
  useUpdateTestPlanStatus,
  useUpdateTestPlan,
  useDeleteTestPlan,
} from "@/hooks/use-test-plans";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Brain,
  Zap,
  Loader2,
  AlertCircle,
  User,
  ArrowLeft,
  Pencil,
  Trash2,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { TestPlanStatus } from "@/types/test-plan.types";
import { CreateTestPlanDialog } from "@/components/features/test-plans/create-test-plan-dialog";
import { toast } from "sonner";

const STATUS_OPTIONS: { value: TestPlanStatus; label: string; icon: React.ReactNode }[] = [
  { value: "DRAFT", label: "Draft", icon: <FileText className="h-3.5 w-3.5" /> },
  { value: "IN_PROGRESS", label: "In Progress", icon: <Clock className="h-3.5 w-3.5" /> },
  { value: "COMPLETED", label: "Completed", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
];

function StatusBadge({ status }: { status: string }) {
  if (status === "IN_PROGRESS") {
    return (
      <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-0 text-[10px] font-bold uppercase tracking-wider">
        IN PROGRESS
      </Badge>
    );
  }
  if (status === "COMPLETED") {
    return (
      <Badge className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-0 text-[10px] font-bold uppercase tracking-wider">
        COMPLETED
      </Badge>
    );
  }
  return (
    <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-0 text-[10px] font-bold uppercase tracking-wider">
      DRAFT
    </Badge>
  );
}

export default function TestPlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.id as string;
  const queryClient = useQueryClient();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const { data: plan, isLoading, error } = useTestPlan(planId);
  const { data: storiesData } = useTestPlanStories(planId);
  const stories = storiesData?.items ?? [];

  const updateStatus = useUpdateTestPlanStatus();
  const deleteTestPlan = useDeleteTestPlan();

  // Real-time updates for this test plan
  useWebSocket({
    topic: plan ? `/topic/projects/${plan.projectId}/test-plans` : "",
    enabled: !!plan,
    onMessage: (event: { entityId?: string }) => {
      if (event?.entityId === planId) {
        queryClient.invalidateQueries({ queryKey: ["testPlans", planId] });
      }
    },
  });

  const handleStatusChange = async (status: string) => {
    try {
      await updateStatus.mutateAsync({ id: planId, status: status as TestPlanStatus });
      toast.success("Plan status updated");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTestPlan.mutateAsync(planId);
      toast.success("Test plan deleted");
      router.back();
    } catch (err) {
      toast.error("Failed to delete test plan");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-medium">Failed to load test plan</p>
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Back + actions */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-destructive hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Main Plan Card */}
          <div className="xl:col-span-2 bg-card border rounded-2xl overflow-hidden shadow-sm">
            {/* Plan Header */}
            <div className="p-6 border-b">
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-1">
                  <StatusBadge status={plan.status} />
                  <h3 className="text-xl font-bold mt-2">{plan.name}</h3>
                  <div className="flex items-center gap-4 text-muted-foreground text-sm">
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
              </div>
            </div>

            {/* Plan Body */}
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <p className="text-sm font-bold mb-2">Description</p>
                {plan.description ? (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {plan.description}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No description provided.
                  </p>
                )}
              </div>

              {/* Linked Stories */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-bold">
                    Linked Stories ({stories.length})
                  </p>
                </div>
                {stories.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    No stories linked to this test plan.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {stories.map((story) => (
                      <Link
                        key={story.userStoryId}
                        href={`/stories/${story.userStoryId}`}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                      >
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                            {story.title}
                          </p>
                          {story.jiraIssueKey && (
                            <p className="text-xs text-muted-foreground">
                              {story.jiraIssueKey}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {story.status}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Suggestion */}
              <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 rounded-xl p-4 flex gap-4">
                <div className="w-10 h-10 shrink-0 bg-purple-600 rounded-lg flex items-center justify-center text-white">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-purple-700 dark:text-purple-300 font-bold text-sm">
                    AI Suggestion
                  </p>
                  <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                    Generate test cases from user stories linked to this plan
                    using AI.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Status Update */}
            <div className="bg-card border p-5 rounded-2xl shadow-sm">
              <p className="text-sm font-bold mb-4">Plan Details</p>
              <div className="space-y-4 text-sm">
                {/* Status selector */}
                <div className="space-y-1.5">
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                    Status
                  </span>
                  <Select
                    value={plan.status}
                    onValueChange={handleStatusChange}
                    disabled={updateStatus.isPending}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">
                          <span className="flex items-center gap-2">
                            {opt.icon}
                            {opt.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {updateStatus.isPending && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Updating...
                    </p>
                  )}
                </div>

                <div className="flex justify-between pt-1">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">
                    {new Date(plan.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {plan.updatedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Updated</span>
                    <span className="font-medium">
                      {new Date(plan.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created by</span>
                  <span className="font-medium">{plan.createdByUserFullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stories</span>
                  <span className="font-medium">{stories.length}</span>
                </div>
                <div className="pt-1 border-t">
                  <Link
                    href={`/projects/${plan.projectId}/test-plans`}
                    className="text-primary hover:underline text-xs font-medium"
                  >
                    View all plans in project →
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

      {/* Delete confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Test Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{plan.name}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleteTestPlan.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteTestPlan.isPending}
            >
              {deleteTestPlan.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog — reuse create dialog not applicable since we need edit mode.
          For now, opens create dialog with plan's project so user can create a new version.
          TODO: implement proper edit flow in a future iteration. */}
      {editOpen && (
        <CreateTestPlanDialog
          projectId={plan.projectId}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}
    </div>
  );
}
