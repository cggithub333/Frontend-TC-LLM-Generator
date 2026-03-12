"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check,
  ChevronRight,
  FolderOpen,
  ClipboardList,
  Plus,
  ListChecks,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { CreateStoryModal } from "@/components/features/stories/create-story-modal";
import type { StoryFormData } from "@/components/features/stories/create-story-modal";
import { useStories, useCreateStory } from "@/hooks/use-stories";
import { useUpdateAcceptanceCriteria } from "@/hooks/use-acceptance-criteria";
import { extractPage } from "@/types/pagination.types";
import type { UserStory, AcceptanceCriteria } from "@/types/story.types";

export default function StoriesPage() {
  const [expandedStories, setExpandedStories] = useState<string[]>([]);
  const [selectedStories, setSelectedStories] = useState<string[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { data: storiesData, isLoading, error } = useStories();
  const createStory = useCreateStory();
  const updateAC = useUpdateAcceptanceCriteria();

  const stories = storiesData ? extractPage<UserStory>(storiesData).items : [];

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

  const handleCreateStory = (formData: StoryFormData) => {
    createStory.mutate({
      projectId: formData.projectId,
      title: formData.iWantTo.slice(0, 50) || "Untitled Story",
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
    setCreateModalOpen(false);
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
    <div className="p-8 space-y-6 max-w-5xl mx-auto w-full">
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

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <FolderOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Repository</h3>
              <p className="text-sm text-muted-foreground">
                View and manage test assets
              </p>
            </div>
          </div>
        </div>
        <Link
          href="/test-plans"
          className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors cursor-pointer"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Test Plans</h3>
              <p className="text-sm text-muted-foreground">
                Structure your testing strategy
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search user stories..." className="pl-12" />
      </div>

      {/* Stories List */}
      {stories.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ListChecks className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No user stories yet</p>
          <p className="text-sm mt-1">
            Create your first user story to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {stories.map((story) => {
            const isExpanded = expandedStories.includes(story.userStoryId);
            const isSelected = selectedStories.includes(story.userStoryId);
            const stats = getCompletionStats(story.acceptanceCriteria ?? []);

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
                  <Link
                    href={`/stories/${story.userStoryId}`}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <Badge
                        variant="outline"
                        className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 font-semibold"
                      >
                        {story.jiraIssueKey ??
                          story.userStoryId.slice(0, 8).toUpperCase()}
                      </Badge>
                      <h3 className="font-bold text-lg hover:text-primary transition-colors">
                        {story.title}
                      </h3>
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
                            <span>
                              {(story.acceptanceCriteria ?? []).length} ACs
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </Link>
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

                    {/* Acceptance Criteria - Interactive */}
                    {(story.acceptanceCriteria ?? []).length > 0 && (
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
                          {(story.acceptanceCriteria ?? []).map((criteria) => (
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
                                    ? "text-foreground"
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
                    <Button className="w-full gap-2 bg-primary shadow-lg shadow-primary/20">
                      <Sparkles className="h-4 w-4" />
                      Generate Tests
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
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
      <Button
        size="icon"
        onClick={() => setCreateModalOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full shadow-lg shadow-primary/30 hover:scale-110 active:scale-95 transition-all z-50"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Create Story Modal */}
      <CreateStoryModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreateStory={handleCreateStory}
      />
    </div>
  );
}
