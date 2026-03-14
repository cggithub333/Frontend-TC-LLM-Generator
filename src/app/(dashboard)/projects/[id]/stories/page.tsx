"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  useStoriesByProject,
  useCreateStory,
  useUpdateStory,
  useDeleteStory,
  useUpdateStoryStatus,
  ALLOWED_STORY_TRANSITIONS,
} from "@/hooks/use-stories";
import { useUpdateAcceptanceCriteria } from "@/hooks/use-acceptance-criteria";
import { CreateStoryModal } from "@/components/features/stories/create-story-modal";
import type { StoryFormData } from "@/components/features/stories/create-story-modal";
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
  ClipboardList,
  Plus,
  ListChecks,
  Pencil,
  Trash2,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { LoadingSkeleton } from "@/components/features/workspaces/loading-skeleton";
import { CreateManualTestCaseDialog } from "@/components/features/test-cases/create-manual-test-case-dialog";

import { useWebSocket } from "@/hooks/use-websocket";
import { useQueryClient } from "@tanstack/react-query";
import type { UserStory, AcceptanceCriteria } from "@/types/story.types";
import type { TestCase } from "@/types/test-case.types";
import { useTestCasesByAcceptanceCriteria, useDeleteTestCase } from "@/hooks/use-test-cases";

function AcItemWithTestCases({
  criteria,
  story,
  toggleACCompletion,
  onAddTestCase,
  onEditTestCase,
  onDeleteTestCase,
}: {
  criteria: AcceptanceCriteria;
  story: UserStory;
  toggleACCompletion: (ac: AcceptanceCriteria) => void;
  onAddTestCase: (story: UserStory, acId: string) => void;
  onEditTestCase: (tc: TestCase, story: UserStory) => void;
  onDeleteTestCase: (tc: TestCase) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: testCasesData } = useTestCasesByAcceptanceCriteria(
    criteria.acceptanceCriteriaId,
  );
  const testCasesCount = testCasesData?.items?.length || 0;

  return (
    <div className="w-full flex flex-col gap-1">
      <div className="flex items-start gap-3 w-full group hover:bg-muted/30 p-2 -m-2 rounded-lg transition-colors">
        <button
          onClick={() => toggleACCompletion(criteria)}
          className="flex items-start gap-3 flex-1 text-sm text-left"
        >
          <div
            className={`mt-0.5 w-5 h-5 flex items-center justify-center rounded shrink-0 transition-all ${
              criteria.completed
                ? "bg-primary text-white"
                : "border-2 border-muted-foreground/30 group-hover:border-primary/50"
            }`}
          >
            {criteria.completed && <Check className="h-3 w-3" />}
          </div>
          <div>
            <p
              className={
                criteria.completed
                  ? "text-foreground line-through opacity-70"
                  : "text-muted-foreground group-hover:text-foreground transition-colors"
              }
            >
              {criteria.content}
            </p>
            {testCasesCount > 0 ? (
              <Badge
                variant="secondary"
                className="mt-1 text-[10px] py-0 cursor-pointer hover:bg-secondary/80"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
              >
                {testCasesCount} Tests{" "}
                {isExpanded ? (
                  <ChevronUp className="inline w-3 h-3 ml-1" />
                ) : (
                  <ChevronDown className="inline w-3 h-3 ml-1" />
                )}
              </Badge>
            ) : (
              <span className="mt-1 text-[10px] text-muted-foreground/60 italic">
                No tests yet
              </span>
            )}
          </div>
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-40 group-hover:opacity-100 transition-opacity"
          title="Add Test Case for this AC"
          onClick={(e) => {
            e.stopPropagation();
            onAddTestCase(story, criteria.acceptanceCriteriaId);
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {isExpanded && testCasesCount > 0 && (
        <div className="pl-10 pr-2 pb-2 space-y-2 relative before:absolute before:left-[19px] before:top-0 before:bottom-4 before:w-px before:bg-border">
          {testCasesData?.items.map((tc) => (
            <div
              key={tc.testCaseId}
              className="bg-card border border-border rounded-md p-3 text-sm shadow-sm relative before:absolute before:left-[-21px] before:top-1/2 before:w-5 before:h-px before:bg-border group/tc"
            >
              <div className="font-semibold flex items-center gap-2 mb-1.5">
                <ClipboardList className="w-3.5 h-3.5 text-muted-foreground" />
                {tc.title}
                {tc.generatedByAi && (
                  <Badge
                    variant="outline"
                    className="text-[9px] h-4 px-1 py-0 bg-purple-50 text-purple-600 border-purple-200"
                  >
                    AI Generated
                  </Badge>
                )}
                <div className="ml-auto flex items-center gap-1 opacity-0 group-hover/tc:opacity-100 transition-opacity">
                  <button
                    className="p-1 rounded hover:bg-muted transition-colors"
                    title="Edit Test Case"
                    onClick={(e) => { e.stopPropagation(); onEditTestCase(tc, story); }}
                  >
                    <Pencil className="w-3 h-3 text-muted-foreground" />
                  </button>
                  <button
                    className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                    title="Delete Test Case"
                    onClick={(e) => { e.stopPropagation(); onDeleteTestCase(tc); }}
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {tc.steps && (
                  <div>
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                      Steps:
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {tc.steps}
                    </p>
                  </div>
                )}
                {tc.expectedResult && (
                  <div>
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                      Expected:
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {tc.expectedResult}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProjectStoriesPage() {
  const params = useParams();
  const projectId = params.id as string;
  const queryClient = useQueryClient();

  // Listen to realtime story events
  useWebSocket({
    topic: `/topic/projects/${projectId}/stories`,
    onMessage: (message: unknown) => {
      console.log("Realtime story update:", message);
      queryClient.invalidateQueries({
        queryKey: ["stories", "project", projectId],
      });
    },
  });

  const { data: storiesData, isLoading } = useStoriesByProject(projectId);

  const createStory = useCreateStory();
  const updateStory = useUpdateStory();
  const deleteStory = useDeleteStory();
  const updateStoryStatus = useUpdateStoryStatus();

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedStories, setExpandedStories] = useState<string[]>([]);
  const [selectedStories, setSelectedStories] = useState<string[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<UserStory | null>(null);
  const [deleteConfirmStory, setDeleteConfirmStory] = useState<UserStory | null>(null);

  // Manual Test Case Dialog State
  const [isTestCaseDialogOpen, setIsTestCaseDialogOpen] = useState(false);
  const [testCaseDialogStory, setTestCaseDialogStory] =
    useState<UserStory | null>(null);
  const [testCaseDialogAcId, setTestCaseDialogAcId] = useState<string | null>(
    null,
  );
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
  const [deleteConfirmTestCase, setDeleteConfirmTestCase] = useState<TestCase | null>(null);
  const deleteTestCase = useDeleteTestCase();

  // Soft Retention: flash animation state
  const [flashStoryId, setFlashStoryId] = useState<string | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stories = storiesData?.items || [];

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

  const handleCreateStory = async (formData: StoryFormData) => {
    try {
      await createStory.mutateAsync({
        projectId: formData.projectId || projectId,
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
          })),
      });
      setCreateModalOpen(false);
      setSearchQuery("");
      toast.success("Story created successfully");
    } catch (err) {
      toast.error("Failed to create story");
    }
  };

  const updateAcceptanceCriteria = useUpdateAcceptanceCriteria();

  const toggleACCompletion = (ac: AcceptanceCriteria) => {
    updateAcceptanceCriteria.mutate({
      id: ac.acceptanceCriteriaId,
      completed: !ac.completed,
    });
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

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
    } catch (err) {
      toast.error("Failed to update story");
    }
  };

  const filteredStories = stories.filter(
    (story) =>
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  /**
   * Optimistic UI handler — called after TC is created successfully.
   * Updates the local cache so the story stays visible with its new status.
   */
  const handleTestCaseCreated = (storyId: string | undefined) => {
    if (!storyId) return;

    // 1. Optimistic cache update — patch the story status in local list
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryClient.setQueriesData<any>(
      { queryKey: ["stories", "project", projectId] },
      (oldData: any) => {
        if (!oldData?.items) return oldData;
        return {
          ...oldData,
          items: oldData.items.map((story: UserStory) => {
            if (story.userStoryId !== storyId) return story;
            // Auto-transition DRAFT → READY
            if (
              story.status === "DRAFT" &&
              story.acceptanceCriteria &&
              story.acceptanceCriteria.length > 0
            ) {
              return { ...story, status: "READY" as const };
            }
            return story;
          }),
        };
      },
    );

    // Also invalidate the per-AC test cases queries so expanded lists update
    queryClient.invalidateQueries({ queryKey: ["testCases"] });

    // 2. Keep the story expanded
    setExpandedStories((prev) =>
      prev.includes(storyId) ? prev : [...prev, storyId],
    );

    // 3. Flash animation
    setFlashStoryId(storyId);
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => setFlashStoryId(null), 2200);

    // 4. Toast
    toast.success("Test case created successfully", {
      description: "Story status auto-updated to READY.",
      duration: 5000,
    });
  };

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto w-full">

      {/* Page Title + Search + New Story */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold shrink-0">Stories</h1>
        <div className="flex items-center gap-3 flex-1 justify-end">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search user stories..."
              className="pl-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="gap-2 shrink-0"
          >
            <Plus className="h-4 w-4" />
            New Story
          </Button>
        </div>
      </div>

      {/* Stories List */}
      <div className="space-y-4">
        {filteredStories.map((story) => {
          const isExpanded = expandedStories.includes(story.userStoryId);
          const isSelected = selectedStories.includes(story.userStoryId);

          const acs = story.acceptanceCriteria || [];
          const stats = {
            completed: acs.filter((ac) => ac.completed).length,
            total: acs.length,
          };

          return (
            <div
              key={story.userStoryId}
              className={`bg-card border border-border rounded-xl overflow-hidden transition-all ${
                flashStoryId === story.userStoryId ? "animate-flash-success" : ""
              }`}
            >
              {/* Story Header */}
              <div className="p-4 flex items-start gap-3">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleSelect(story.userStoryId)}
                  className="mt-1"
                />
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => toggleExpand(story.userStoryId)}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <Badge
                      variant="outline"
                      className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 font-semibold"
                    >
                      {story.jiraIssueKey ?? `US-${story.userStoryId.slice(0, 6).toUpperCase()}`}
                    </Badge>
                    <Link
                      href={`/stories/${story.userStoryId}`}
                      className="font-bold text-lg hover:text-primary transition-colors hover:underline underline-offset-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {story.title}
                    </Link>
                    {story.status && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <button
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer transition-colors hover:opacity-80 ${
                              story.status === "DRAFT"
                                ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600"
                                : story.status === "READY"
                                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                                  : story.status === "IN_PROGRESS"
                                    ? "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                                    : story.status === "DONE"
                                      ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                                      : "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
                            }`}
                          >
                            {story.status.replace("_", " ")}
                            <ChevronDown className="h-3 w-3" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
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
                  </div>
                  {!isExpanded && (
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-sm text-muted-foreground line-clamp-1 flex-1">
                        As a {story.asA}, I want to {story.iWantTo} so that{" "}
                        {story.soThat}...
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
                        <span className="text-muted-foreground">I WANT TO</span>{" "}
                        <span className="font-medium">{story.iWantTo}</span>,
                      </p>
                      <p>
                        <span className="text-muted-foreground">SO THAT</span>{" "}
                        <span className="font-medium">{story.soThat}</span>.
                      </p>
                    </div>
                  </div>

                  {/* Acceptance Criteria - Interactive */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Acceptance Criteria
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out"
                            style={{ width: stats.total > 0 ? `${(stats.completed / stats.total) * 100}%` : '0%' }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          {stats.completed}/{stats.total} DONE
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {acs.map((criteria) => (
                        <AcItemWithTestCases
                          key={criteria.acceptanceCriteriaId}
                          criteria={criteria}
                          story={story}
                          toggleACCompletion={toggleACCompletion}
                          onAddTestCase={(story, acId) => {
                            setTestCaseDialogStory(story);
                            setTestCaseDialogAcId(acId);
                            setEditingTestCase(null);
                            setIsTestCaseDialogOpen(true);
                          }}
                          onEditTestCase={(tc, story) => {
                            setEditingTestCase(tc);
                            setTestCaseDialogStory(story);
                            setTestCaseDialogAcId(tc.acceptanceCriteriaId || null);
                            setIsTestCaseDialogOpen(true);
                          }}
                          onDeleteTestCase={(tc) => setDeleteConfirmTestCase(tc)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Generate Button - Disabled until AI is integrated */}
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
        {filteredStories.length === 0 && stories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 rounded-full bg-muted/50 mb-6">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <h2 className="text-xl font-bold mb-2">No user stories yet</h2>
            <p className="text-muted-foreground max-w-md mb-8">
              User stories help define what your users need. Create your first
              one to start building acceptance criteria and generating test cases.
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
        )}
        {filteredStories.length === 0 && stories.length > 0 && (
          <div className="text-center py-12 text-muted-foreground border rounded-xl border-dashed">
            No stories matching &quot;{searchQuery}&quot;
          </div>
        )}
      </div>

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



      {/* Create Story Modal */}
      <CreateStoryModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreateStory={handleCreateStory}
        defaultProjectId={projectId}
      />

      {/* Edit Story Modal */}
      <CreateStoryModal
        open={!!editingStory}
        onOpenChange={(open) => { if (!open) setEditingStory(null); }}
        onCreateStory={handleEditStory}
        defaultProjectId={projectId}
        editStory={editingStory ?? undefined}
      />

      {/* Manual Test Case Creation/Edit Dialog */}
      <CreateManualTestCaseDialog
        open={isTestCaseDialogOpen}
        onOpenChange={(open) => {
          setIsTestCaseDialogOpen(open);
          if (!open) setEditingTestCase(null);
        }}
        userStory={testCaseDialogStory}
        defaultAcId={testCaseDialogAcId}
        editTestCase={editingTestCase}
        onSuccess={() => {
          handleTestCaseCreated(testCaseDialogStory?.userStoryId);
        }}
      />

      {/* Delete Test Case Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirmTestCase}
        onOpenChange={(open) => { if (!open) setDeleteConfirmTestCase(null); }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Test Case</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              &quot;{deleteConfirmTestCase?.title}&quot;
            </span>
            ? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeleteConfirmTestCase(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (deleteConfirmTestCase) {
                  await deleteTestCase.mutateAsync(deleteConfirmTestCase.testCaseId);
                  setDeleteConfirmTestCase(null);
                  toast.success("Test case deleted");
                }
              }}
            >
              Delete Test Case
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Story Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirmStory}
        onOpenChange={(open) => { if (!open) setDeleteConfirmStory(null); }}
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
            acceptance criteria and test case links.
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
              onClick={async () => {
                if (deleteConfirmStory) {
                  await deleteStory.mutateAsync(deleteConfirmStory.userStoryId);
                  setDeleteConfirmStory(null);
                  toast.success("Story deleted");
                }
              }}
            >
              Delete Story
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
