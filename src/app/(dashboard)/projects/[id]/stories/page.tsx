"use client";

import { useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { useStoriesByProject, useCreateStory, useUpdateStory, useDeleteStory } from "@/hooks/use-stories";
import { useProject } from "@/hooks/use-projects";
import { CreateStoryModal } from "@/components/features/stories/create-story-modal";
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
  FolderOpen,
  ClipboardList,
  Plus,
  ListChecks,
  FileCheck,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LoadingSkeleton } from "@/components/features/workspaces/loading-skeleton";

import { useWebSocket } from "@/hooks/use-websocket";
import { useQueryClient } from "@tanstack/react-query";

export default function ProjectStoriesPage() {
  const params = useParams();
  const projectId = params.id as string;
  const queryClient = useQueryClient();

  // Listen to realtime story events
  useWebSocket({
    topic: `/topic/projects/${projectId}/stories`,
    onMessage: (message: any) => {
      console.log("Realtime story update:", message);
      queryClient.invalidateQueries({ queryKey: ["stories", "project", projectId] });
    },
  });

  const { data: project } = useProject(projectId);
  const { data: storiesData, isLoading, refetch } = useStoriesByProject(projectId);
  
  const createStory = useCreateStory();
  const updateStory = useUpdateStory();
  const deleteStory = useDeleteStory();

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedStories, setExpandedStories] = useState<string[]>([]);
  const [selectedStories, setSelectedStories] = useState<string[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const stories = storiesData?.items || [];

  const toggleExpand = (id: string) => {
    setExpandedStories((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleSelect = (id: string) => {
    setSelectedStories((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleCreateStory = async (formData: any) => {
    try {
      // Map form data to our API structure
      // Format the description as Markdown text
      const description = `**AS A** ${formData.asA}\n**I WANT TO** ${formData.iWantTo}\n**SO THAT** ${formData.soThat}\n\n**Acceptance Criteria:**\n${formData.acceptanceCriteria.map((ac: any) => `- [ ] ${ac.description}`).join('\n')}`;
      
      const titleStr = formData.iWantTo.slice(0, 50) + (formData.iWantTo.length > 50 ? "..." : "");

      await createStory.mutateAsync({
        projectId,
        title: titleStr,
        description: description,
        status: "To Do"
      });
      refetch();
    } catch (err) {
      console.error("Failed to create user story", err);
    }
  };

  // Basic parser for description
  const parseDescription = (desc?: string) => {
    if (!desc) return { asA: "", iWantTo: "", soThat: "", acs: [] as {desc: string, completed: boolean}[] };
    
    let asA = "";
    let iWantTo = "";
    let soThat = "";
    const acs: {desc: string, completed: boolean}[] = [];

    const lines = desc.split("\n");
    let parsingAc = false;

    lines.forEach(line => {
      if (line.startsWith("**AS A** ")) asA = line.replace("**AS A** ", "");
      else if (line.startsWith("**I WANT TO** ")) iWantTo = line.replace("**I WANT TO** ", "");
      else if (line.startsWith("**SO THAT** ")) soThat = line.replace("**SO THAT** ", "");
      else if (line.startsWith("**Acceptance Criteria:**")) parsingAc = true;
      else if (parsingAc && line.startsWith("- [")) {
        const completed = line.startsWith("- [x]") || line.startsWith("- [X]");
        const content = line.replace(/^- \[(x|X| )\] /, "");
        acs.push({ desc: content, completed });
      }
    });

    return { asA, iWantTo, soThat, acs };
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const filteredStories = stories.filter(
    (story) => 
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.jiraIssueKey?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto w-full">
      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <FolderOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Repository</h3>
              <p className="text-sm text-muted-foreground">View and manage test assets</p>
            </div>
          </div>
        </div>
        <Link href={`/projects/${projectId}/test-plans`} className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Test Plans</h3>
              <p className="text-sm text-muted-foreground">Structure your testing strategy</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search user stories..."
          className="pl-12"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Stories List */}
      <div className="space-y-4">
        {filteredStories.map((story) => {
          const isExpanded = expandedStories.includes(story.userStoryId);
          const isSelected = selectedStories.includes(story.userStoryId);
          
          const parsedDesc = parseDescription(story.description);
          const stats = { completed: parsedDesc.acs.filter(ac => ac.completed).length, total: parsedDesc.acs.length };

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
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleExpand(story.userStoryId)}>
                  <div className="flex items-center gap-3 mb-1">
                    <Badge
                      variant="outline"
                      className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 font-semibold"
                    >
                      {story.jiraIssueKey || 'US'}
                    </Badge>
                    <h3 className="font-bold text-lg hover:text-primary transition-colors">{story.title}</h3>
                  </div>
                  {!isExpanded && (
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-sm text-muted-foreground line-clamp-1 flex-1">
                        As a {parsedDesc.asA}, I want to {parsedDesc.iWantTo} so that {parsedDesc.soThat}...
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                        <div className="flex items-center gap-1">
                          <ListChecks className="h-4 w-4" />
                          <span>{parsedDesc.acs.length} ACs</span>
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
                        <span className="font-medium">{parsedDesc.asA}</span>,
                      </p>
                      <p>
                        <span className="text-muted-foreground">I WANT TO</span>{" "}
                        <span className="font-medium">{parsedDesc.iWantTo}</span>,
                      </p>
                      <p>
                        <span className="text-muted-foreground">SO THAT</span>{" "}
                        <span className="font-medium">{parsedDesc.soThat}</span>.
                      </p>
                    </div>
                  </div>

                  {/* Acceptance Criteria - Interactive */}
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
                      {parsedDesc.acs.map((criteria, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 w-full text-left group hover:bg-muted/30 p-2 -m-2 rounded-lg transition-colors"
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
                          <p
                            className={
                              criteria.completed
                                ? "text-foreground line-through opacity-70"
                                : "text-muted-foreground group-hover:text-foreground transition-colors"
                            }
                          >
                            {criteria.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <Button className="w-full gap-2 bg-primary shadow-lg shadow-primary/20">
                    <Sparkles className="h-4 w-4" />
                    Generate Tests
                  </Button>
                  
                  {/* Delete Button */}
                  <Button 
                    variant="ghost" 
                    className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete this story?')) {
                        await deleteStory.mutateAsync(story.userStoryId);
                      }
                    }}
                  >
                    Delete Story
                  </Button>
                </div>
              )}
            </div>
          );
        })}
        {filteredStories.length === 0 && (
          <div className="text-center py-12 text-muted-foreground border rounded-xl border-dashed">
            No stories found. Create one.
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
