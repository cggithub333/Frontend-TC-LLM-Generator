"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
  ChevronRight,
  Sparkles,
  FileText,
  Loader2,
  Pencil,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useStory, useDeleteStory } from "@/hooks/use-stories";
import { LoadingSkeleton } from "@/components/features/workspaces/loading-skeleton";

const tabs = [
  { id: "story", label: "Story" },
  { id: "test-case", label: "Test Case" },
  { id: "test-plan", label: "Test Plan" },
];

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.id as string;

  const { data: story, isLoading } = useStory(storyId);
  const deleteStory = useDeleteStory();

  const [activeTab, setActiveTab] = useState("story");
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const toggleCriteria = (id: string) => {
    setSelectedCriteria((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handleDelete = async () => {
    try {
      await deleteStory.mutateAsync(storyId);
      toast.success("Story deleted successfully");
      router.push("/stories");
    } catch {
      toast.error("Failed to delete story");
    }
  };

  if (isLoading || !story) {
    return <LoadingSkeleton />;
  }

  const acs = story.acceptanceCriteria || [];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-card border-b px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm font-medium text-muted-foreground">
            <Link
              href="/stories"
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Stories
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-foreground font-semibold truncate max-w-[300px]">
              {story.title}
            </span>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Pencil className="h-4 w-4" />
              Edit Story
            </Button>
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full py-10 px-6">
        {/* Header Section with Title and Tabs */}
        <div className="bg-card border rounded-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Badge className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-0 text-[10px] font-bold uppercase tracking-widest">
                  Project: {story.projectName}
                </Badge>
                {story.status && (
                  <Badge variant="outline" className="text-[10px] font-bold">
                    {story.status}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  Created {story.createdAt}
                </span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight">
                {story.title}
              </h1>
            </div>

            {/* Tabs */}
            <div className="flex p-1.5 bg-muted rounded-xl">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-8 py-2 rounded-lg text-sm font-semibold transition-all",
                    activeTab === tab.id
                      ? "bg-card shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* Hero Image Card */}
            <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
              {/* Hero Image */}
              <div className="h-72 overflow-hidden relative">
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-800" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                  <Badge className="bg-primary text-white border-0 shadow-xl">
                    <span className="h-2 w-2 bg-white rounded-full mr-2.5 animate-pulse" />
                    {story.status}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-white/10 backdrop-blur-md text-white border-white/20"
                  >
                    # {story.jiraIssueKey || `US-${storyId.slice(0, 6).toUpperCase()}`}
                  </Badge>
                </div>
              </div>

              {/* Title & Description */}
              <div className="p-8">
                <h2 className="text-3xl font-extrabold mb-4">{story.title}</h2>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
                  {story.description}
                </p>
              </div>
            </div>

            {/* User Story Requirements */}
            <div className="bg-card border rounded-xl p-8 shadow-sm">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-8 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                User Story Requirements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-muted/30 rounded-2xl p-8 border">
                <div className="md:col-span-3">
                  <span className="text-xs font-black text-primary uppercase tracking-tighter">
                    As a
                  </span>
                  <div className="text-xl font-bold mt-1">{story.asA}</div>
                </div>
                <div className="md:col-span-4">
                  <span className="text-xs font-black text-primary uppercase tracking-tighter">
                    I want to
                  </span>
                  <div className="text-xl font-bold mt-1">{story.iWantTo}</div>
                </div>
                <div className="md:col-span-5">
                  <span className="text-xs font-black text-primary uppercase tracking-tighter">
                    So that
                  </span>
                  <div className="text-xl font-bold mt-1">{story.soThat}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Acceptance Criteria */}
            <div className="bg-card border rounded-xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold">Acceptance Criteria</h3>
                <Badge
                  variant="secondary"
                  className="bg-muted text-muted-foreground text-xs font-bold"
                >
                  {acs.length} Items
                </Badge>
              </div>

              <div className="space-y-3 mb-8">
                {acs.map((ac) => (
                  <label
                    key={ac.acceptanceCriteriaId}
                    className="flex items-start p-4 bg-muted/30 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors border border-transparent hover:border-border"
                  >
                    <Checkbox
                      checked={selectedCriteria.includes(
                        ac.acceptanceCriteriaId,
                      )}
                      onCheckedChange={() =>
                        toggleCriteria(ac.acceptanceCriteriaId)
                      }
                      className="mt-0.5"
                    />
                    <span className="ml-4 text-sm font-medium leading-relaxed">
                      {ac.content}
                    </span>
                  </label>
                ))}
              </div>

              <div className="pt-6 border-t">
                <Button
                  className="w-full gap-2 shadow-lg shadow-primary/20 py-6"
                  size="lg"
                >
                  <Sparkles className="h-5 w-5" />
                  Generate AI Test Cases
                </Button>
                <p className="text-center text-[9px] text-muted-foreground mt-4 uppercase tracking-[0.2em] font-bold">
                  Quality Engine Powered
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User Story</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              &quot;{story.title}&quot;
            </span>
            ? This action cannot be undone and will also remove all associated
            acceptance criteria and test cases.
          </p>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
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
    </div>
  );
}
