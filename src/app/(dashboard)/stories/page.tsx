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
  FileCheck,
} from "lucide-react";
import Link from "next/link";
import { CreateStoryModal } from "@/components/features/stories/create-story-modal";

interface AcceptanceCriterion {
  id: string;
  description: string;
  completed: boolean;
}

interface Story {
  id: string;
  code: string;
  title: string;
  asA: string;
  iWantTo: string;
  soThat: string;
  acceptanceCriteria: AcceptanceCriterion[];
  testCases: number;
}

// Initial mock data
const initialStories: Story[] = [
  {
    id: "US-204",
    code: "US-204",
    title: "Biometric Authentication",
    asA: "returning user",
    iWantTo: "log in with biometric authentication",
    soThat: "I can access my account faster",
    acceptanceCriteria: [
      {
        id: "AC-1",
        description: "Show biometric prompt on app launch if enabled in settings.",
        completed: true,
      },
      {
        id: "AC-2",
        description: "Fallback to PIN entry if biometric fails after 3 attempts.",
        completed: true,
      },
      {
        id: "AC-3",
        description: "Provide toggle in Profile settings to enable/disable feature.",
        completed: false,
      },
    ],
    testCases: 8,
  },
  {
    id: "US-205",
    code: "US-205",
    title: "App Feature Walkthrough",
    asA: "new user",
    iWantTo: "see a walkthrough of the app features",
    soThat: "I understand how to use the application effectively",
    acceptanceCriteria: [
      {
        id: "AC-1",
        description: "Display interactive tutorial on first app launch.",
        completed: false,
      },
      {
        id: "AC-2",
        description: "Allow users to skip the walkthrough.",
        completed: false,
      },
      {
        id: "AC-3",
        description: "Provide option to replay walkthrough from settings.",
        completed: false,
      },
      {
        id: "AC-4",
        description: "Track completion status in user profile.",
        completed: false,
      },
      {
        id: "AC-5",
        description: "Include tooltips for key features.",
        completed: false,
      },
    ],
    testCases: 12,
  },
  {
    id: "US-208",
    code: "US-208",
    title: "Dark Mode Support",
    asA: "mobile user",
    iWantTo: "switch between light and dark themes",
    soThat: "I can use the app comfortably in different lighting conditions",
    acceptanceCriteria: [
      {
        id: "AC-1",
        description: "Implement theme toggle in settings.",
        completed: true,
      },
      {
        id: "AC-2",
        description: "Persist theme preference across sessions.",
        completed: true,
      },
      {
        id: "AC-3",
        description: "Support system theme detection.",
        completed: true,
      },
    ],
    testCases: 6,
  },
];

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [expandedStories, setExpandedStories] = useState<string[]>(["US-204"]);
  const [selectedStories, setSelectedStories] = useState<string[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);

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

  const toggleACCompletion = (storyId: string, acId: string) => {
    setStories((prevStories) =>
      prevStories.map((story) =>
        story.id === storyId
          ? {
              ...story,
              acceptanceCriteria: story.acceptanceCriteria.map((ac) =>
                ac.id === acId ? { ...ac, completed: !ac.completed } : ac
              ),
            }
          : story
      )
    );
  };

  const getCompletionStats = (criteria: AcceptanceCriterion[]) => {
    const completed = criteria.filter((c) => c.completed).length;
    return { completed, total: criteria.length };
  };

  const handleCreateStory = (formData: {
    asA: string;
    iWantTo: string;
    soThat: string;
    acceptanceCriteria: { id: string; description: string }[];
  }) => {
    const newId = `US-${210 + stories.length}`;
    const newStory: Story = {
      id: newId,
      code: newId,
      title: formData.iWantTo.slice(0, 30) + (formData.iWantTo.length > 30 ? "..." : ""),
      asA: formData.asA,
      iWantTo: formData.iWantTo,
      soThat: formData.soThat,
      acceptanceCriteria: formData.acceptanceCriteria
        .filter((ac) => ac.description.trim())
        .map((ac, index) => ({
          id: `AC-${index + 1}`,
          description: ac.description,
          completed: false,
        })),
      testCases: 0,
    };
    setStories([...stories, newStory]);
    setExpandedStories([...expandedStories, newId]);
  };

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto w-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="hover:text-foreground cursor-pointer">Workspaces</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-semibold">Mobile Redesign V2</span>
        <Badge className="ml-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30">
          ACTIVE SPRINT
        </Badge>
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
              <p className="text-sm text-muted-foreground">View and manage test assets</p>
            </div>
          </div>
        </div>
        <Link href="/test-plans" className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors cursor-pointer">
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
        />
      </div>

      {/* Stories List */}
      <div className="space-y-4">
        {stories.map((story) => {
          const isExpanded = expandedStories.includes(story.id);
          const isSelected = selectedStories.includes(story.id);
          const stats = getCompletionStats(story.acceptanceCriteria);

          return (
            <div
              key={story.id}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              {/* Story Header */}
              <div className="p-4 flex items-start gap-3">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleSelect(story.id)}
                  className="mt-1"
                />
                <Link href={`/stories/${story.id}`} className="flex-1 min-w-0 cursor-pointer">
                  <div className="flex items-center gap-3 mb-1">
                    <Badge
                      variant="outline"
                      className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 font-semibold"
                    >
                      {story.code}
                    </Badge>
                    <h3 className="font-bold text-lg hover:text-primary transition-colors">{story.title}</h3>
                  </div>
                  {!isExpanded && (
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-sm text-muted-foreground line-clamp-1 flex-1">
                        As a {story.asA}, I want to {story.iWantTo} so that {story.soThat}...
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                        <div className="flex items-center gap-1">
                          <ListChecks className="h-4 w-4" />
                          <span>{story.acceptanceCriteria.length} ACs</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileCheck className="h-4 w-4" />
                          <span>{story.testCases} Tests</span>
                        </div>
                      </div>
                    </div>
                  )}
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleExpand(story.id)}
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
                      <Badge
                        variant="outline"
                        className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 font-semibold"
                      >
                        {stats.completed}/{stats.total} DONE
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {story.acceptanceCriteria.map((criteria) => (
                        <button
                          key={criteria.id}
                          onClick={() => toggleACCompletion(story.id, criteria.id)}
                          className="flex items-start gap-3 text-sm w-full text-left group hover:bg-muted/30 p-2 -m-2 rounded-lg transition-colors"
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
                                ? "text-foreground"
                                : "text-muted-foreground group-hover:text-foreground transition-colors"
                            }
                          >
                            {criteria.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

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
