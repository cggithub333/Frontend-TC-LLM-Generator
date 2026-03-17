"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check,
  ChevronRight,
  Plus,
  ListChecks,
  Loader2,
  AlertCircle,
  Pencil,
  Trash2,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { CreateStoryModal } from "@/components/features/stories/create-story-modal";
import type { StoryFormData } from "@/components/features/stories/create-story-modal";
import { StoryDetailPanel } from "@/components/features/stories/story-detail-panel";
import {
  useStories,
  useCreateStory,
  useUpdateStory,
  useDeleteStory,
  useUpdateStoryStatus,
  ALLOWED_STORY_TRANSITIONS,
} from "@/hooks/use-stories";
import { useUpdateAcceptanceCriteria } from "@/hooks/use-acceptance-criteria";
import type { UserStory, AcceptanceCriteria } from "@/types/story.types";

/** Map story status to badge colors */
const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700",
  READY: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  IN_PROGRESS: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  DONE: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  ARCHIVED: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700",
};

/** Format a date as relative time (simple) */
function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function StoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [expandedStories, setExpandedStories] = useState<string[]>([]);
  const [selectedStories, setSelectedStories] = useState<string[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<UserStory | null>(null);
  const [deleteConfirmStory, setDeleteConfirmStory] = useState<UserStory | null>(null);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);

  const { data: storiesData, isLoading, error } = useStories();
  const createStory = useCreateStory();
  const updateStory = useUpdateStory();
  const deleteStory = useDeleteStory();
  const updateStoryStatus = useUpdateStoryStatus();
  const updateAC = useUpdateAcceptanceCriteria();

  const stories = storiesData?.items ?? [];

  const filteredStories = stories.filter(
    (story) => {
      const matchesSearch =
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || story.status === statusFilter;
      return matchesSearch && matchesStatus;
    }
  );

  const toggleExpand = (id: string) => {
    setExpandedStories((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const toggleSelect = (id: string) => {
    setSelectedStories((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const toggleACCompletion = (ac: AcceptanceCriteria) => {
    updateAC.mutate({
      id: ac.acceptanceCriteriaId,
      completed: !ac.completed,
    });
  };

  const getCompletionStats = (criteria: AcceptanceCriteria[]) => {
    const completed = criteria.filter((c) => c.completed).length;
    return { completed, total: criteria.length };
  };

  const handleCreateStory = async (formData: StoryFormData) => {
    try {
      await createStory.mutateAsync({
        projectId: formData.projectId,
        title: formData.title,
        asA: formData.asA,
        iWantTo: formData.iWantTo,
        soThat: formData.soThat,
        status: "DRAFT",
        acceptanceCriteria: formData.acceptanceCriteria
          .filter((ac) => ac.description.trim())
          .map((ac, index) => ({
            content: ac.description,
            orderNo: index + 1,
            completed: false,
          })),
      });
      toast.success("Story created successfully");
      setCreateModalOpen(false);
    } catch (error) {
      const msg = error instanceof Error
        ? error.message
        : "Failed to create story. Please try again.";
      toast.error(msg);
    }
  };

  const handleEditStory = async (formData: StoryFormData) => {
    if (!editingStory) return;
    try {
      await updateStory.mutateAsync({
        id: editingStory.userStoryId,
        title: formData.title,
        asA: formData.asA,
        iWantTo: formData.iWantTo,
        soThat: formData.soThat,
        acceptanceCriteria: formData.acceptanceCriteria
          .filter((ac) => ac.description.trim())
          .map((ac, index) => ({
            content: ac.description,
            orderNo: index + 1,
          })),
      });
      setEditingStory(null);
      toast.success("Story updated successfully");
    } catch (error) {
      const msg = error instanceof Error
        ? error.message
        : "Failed to update story. Please try again.";
      toast.error(msg);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmStory) return;
    try {
      await deleteStory.mutateAsync(deleteConfirmStory.userStoryId);
      setDeleteConfirmStory(null);
      toast.success("Story deleted successfully");
    } catch (error) {
      const msg = error instanceof Error
        ? error.message
        : "Failed to delete story. Please try again.";
      toast.error(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">Failed to load stories</h2>
        <p className="text-muted-foreground">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:px-8 space-y-6 w-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/workspaces"
          className="hover:text-foreground cursor-pointer"
        >
          Workspaces
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-semibold">All User Stories</span>
      </div>

      {/* Status Filter Tabs — only show when there are stories */}
      {stories.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {[
            { value: "ALL", label: "All", count: stories.length },
            { value: "DRAFT", label: "Draft", count: stories.filter(s => s.status === "DRAFT").length },
            { value: "READY", label: "Ready", count: stories.filter(s => s.status === "READY").length },
            { value: "IN_PROGRESS", label: "In Progress", count: stories.filter(s => s.status === "IN_PROGRESS").length },
            { value: "DONE", label: "Done", count: stories.filter(s => s.status === "DONE").length },
            { value: "ARCHIVED", label: "Archived", count: stories.filter(s => s.status === "ARCHIVED").length },
          ].filter(tab => tab.value === "ALL" || tab.count > 0).map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                statusFilter === tab.value
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0 rounded-full ${
                statusFilter === tab.value
                  ? "bg-primary-foreground/20"
                  : "bg-muted-foreground/10"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Search — only show when there are stories */}
      {stories.length > 0 && (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search user stories..."
            className="pl-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* Stories List */}
      {stories.length === 0 ? (
        /* ────── Rich Empty State ────── */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="p-4 rounded-full bg-muted/50 mb-6">
            <FileText className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <h2 className="text-xl font-bold mb-2">No user stories yet</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            User stories help define what your users need. Create your first one
            to start building acceptance criteria and generating test cases.
          </p>
          <Button
            size="lg"
            onClick={() => setCreateModalOpen(true)}
            className="gap-2 shadow-lg shadow-primary/20"
          >
            <Plus className="h-5 w-5" />
            Create Your First Story
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredStories.map((story) => {
            const isExpanded = expandedStories.includes(story.userStoryId);
            const isSelected = selectedStories.includes(story.userStoryId);
            const acs = story.acceptanceCriteria ?? [];
            const stats = getCompletionStats(acs);

            return (
              <div
                key={story.userStoryId}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                {/* Story Header */}
                <div className="p-4 flex items-start gap-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSelect(story.userStoryId)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge
                        variant="outline"
                        className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 font-semibold"
                      >
                        {story.jiraIssueKey ?? `US-${story.userStoryId.slice(0, 6).toUpperCase()}`}
                      </Badge>
                      <button
                        className="font-bold text-lg text-left hover:text-primary transition-colors hover:underline underline-offset-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStoryId(story.userStoryId);
                        }}
                      >
                        {story.title}
                      </button>
                      {story.status && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer transition-colors hover:opacity-80 ${statusColors[story.status] ?? statusColors.DRAFT}`}
                            >
                              {story.status.replace("_", " ")}
                              <ChevronDown className="h-3 w-3" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            {(ALLOWED_STORY_TRANSITIONS[story.status] || []).map((nextStatus) => (
                              <DropdownMenuItem
                                key={nextStatus}
                                onClick={() => {
                                  updateStoryStatus.mutate(
                                    { id: story.userStoryId, status: nextStatus },
                                    {
                                      onSuccess: () => toast.success(`Status changed to ${nextStatus.replace("_", " ")}`),
                                      onError: (err: any) => {
                                        const msg = err?.response?.data?.message || err?.message || "Failed to update status";
                                        toast.error(msg);
                                      },
                                    }
                                  );
                                }}
                                className="text-xs font-medium"
                              >
                                → {nextStatus.replace("_", " ")}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto shrink-0">
                        {story.createdAt && formatRelativeTime(story.createdAt)}
                      </span>
                    </div>
                    {!isExpanded && (
                      <div className="flex items-center gap-4 mt-2">
                        <p className="text-sm text-muted-foreground line-clamp-1 flex-1">
                          {story.asA && story.iWantTo
                            ? `As a ${story.asA}, I want to ${story.iWantTo}${story.soThat ? ` so that ${story.soThat}` : ""}...`
                            : story.description || "No description"}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                          <div className="flex items-center gap-1">
                            <ListChecks className="h-4 w-4" />
                            <span>{acs.length} ACs</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleExpand(story.userStoryId)}
                    className="shrink-0"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </Button>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-6">
                    {/* User Story */}
                    {story.asA && story.iWantTo && (
                      <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          User Story
                        </p>
                        <div className="text-sm space-y-1">
                          <p>
                            <span className="text-muted-foreground">AS A</span>{" "}
                            <span className="font-medium">{story.asA}</span>,
                          </p>
                          <p>
                            <span className="text-muted-foreground">
                              I WANT TO
                            </span>{" "}
                            <span className="font-medium">{story.iWantTo}</span>
                            ,
                          </p>
                          {story.soThat && (
                            <p>
                              <span className="text-muted-foreground">
                                SO THAT
                              </span>{" "}
                              <span className="font-medium">
                                {story.soThat}
                              </span>
                              .
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Acceptance Criteria */}
                    {acs.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Acceptance Criteria
                          </p>
                          <Badge
                            variant="outline"
                            className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 font-semibold"
                          >
                            {stats.completed}/{stats.total} DONE
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {acs.map((criteria) => (
                            <button
                              key={criteria.acceptanceCriteriaId}
                              onClick={() => toggleACCompletion(criteria)}
                              className="flex items-start gap-3 text-sm w-full text-left group hover:bg-muted/30 p-2 -m-2 rounded-lg transition-colors"
                            >
                              <div
                                className={`mt-0.5 w-5 h-5 flex items-center justify-center rounded shrink-0 transition-all ${
                                  criteria.completed
                                    ? "bg-primary text-white"
                                    : "border-2 border-muted-foreground/30 group-hover:border-primary/50"
                                }`}
                              >
                                {criteria.completed && (
                                  <Check className="h-3 w-3" />
                                )}
                              </div>
                              <p
                                className={
                                  criteria.completed
                                    ? "text-foreground line-through opacity-70"
                                    : "text-muted-foreground group-hover:text-foreground transition-colors"
                                }
                              >
                                {criteria.content}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Generate Button */}
                    <Button
                      className="w-full gap-2 bg-primary/50 cursor-not-allowed"
                      title="AI Generation is coming soon"
                    >
                      <Sparkles className="h-4 w-4" />
                      Generate Tests (Coming soon)
                    </Button>

                    {/* Story Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => setEditingStory(story)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit Story
                      </Button>
                      <button
                        className="text-xs text-red-400 hover:text-red-600 dark:hover:text-red-400 transition-colors underline underline-offset-2"
                        onClick={() => setDeleteConfirmStory(story)}
                      >
                        Delete Story
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredStories.length === 0 && stories.length > 0 && (
            <div className="text-center py-12 text-muted-foreground border rounded-xl border-dashed">
              No stories matching &quot;{searchQuery}&quot;
            </div>
          )}
        </div>
      )}

      {/* Floating Action Bar */}
      {selectedStories.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg shadow-primary/30 flex items-center gap-4 z-40">
          <span className="font-semibold">
            {selectedStories.length} Stories Selected
          </span>
          <Button
            size="sm"
            variant="secondary"
            className="gap-2 bg-white/20 hover:bg-white/30 text-white border-0"
          >
            <Sparkles className="h-4 w-4" />
            Create New Test Plan
          </Button>
        </div>
      )}

      {/* Floating + Button */}
      {stories.length > 0 && (
        <Button
          size="icon"
          onClick={() => setCreateModalOpen(true)}
          className="fixed bottom-8 right-8 w-14 h-14 rounded-full shadow-lg shadow-primary/30 hover:scale-110 active:scale-95 transition-all z-50"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      {/* Create Story Modal */}
      <CreateStoryModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreateStory={handleCreateStory}
        isPending={createStory.isPending}
      />

      {/* Edit Story Modal */}
      <CreateStoryModal
        open={!!editingStory}
        onOpenChange={(open) => {
          if (!open) setEditingStory(null);
        }}
        onCreateStory={handleEditStory}
        editStory={editingStory ?? undefined}
        isPending={updateStory.isPending}
      />

      {/* Delete Story Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirmStory}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmStory(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User Story</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              &quot;{deleteConfirmStory?.title}&quot;
            </span>
            ? This action cannot be undone and will also remove all associated
            acceptance criteria and test cases.
          </p>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeleteConfirmStory(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteStory.isPending}
            >
              {deleteStory.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Delete Story
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Story Detail Side Panel */}
      <StoryDetailPanel
        storyId={selectedStoryId}
        onClose={() => setSelectedStoryId(null)}
        onEdit={(story) => {
          setSelectedStoryId(null);
          setEditingStory(story);
        }}
        onDelete={(story) => {
          setSelectedStoryId(null);
          setDeleteConfirmStory(story);
        }}
      />
    </div>
  );
}
