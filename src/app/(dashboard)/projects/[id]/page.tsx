"use client";

/**
 * Project Detail Page
 * Dashboard view for a single project
 */

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Layers, AlertCircle, FileText, Plus, Folder } from "lucide-react";
import { useProject } from "@/hooks/use-projects";
import { useStoriesByProject } from "@/hooks/use-stories";
import { useTestSuitesByProject } from "@/hooks/use-test-suites";
import { useProjectMembers } from "@/hooks/use-project-members";
import { useTestPlansByProject } from "@/hooks/use-test-plans";
import { extractPage } from "@/types/pagination.types";
import { cn } from "@/lib/utils";
import type { UserStory } from "@/types/story.types";
import type { TestSuite } from "@/types/test-suite.types";
import type { ProjectMember } from "@/types/team.types";
import type { TestPlan } from "@/types/test-plan.types";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const { data: project, isLoading, error } = useProject(projectId);
  const { data: storiesData } = useStoriesByProject(projectId, { size: 5 });
  const { data: suitesData } = useTestSuitesByProject(projectId, { size: 5 });
  const { data: membersData } = useProjectMembers(projectId, { size: 10 });
  const { data: plansData } = useTestPlansByProject(projectId, { size: 1 });

  const userStories = storiesData
    ? extractPage<UserStory>(storiesData).items
    : [];
  const testSuites = suitesData ? extractPage<TestSuite>(suitesData).items : [];
  const teamMembers = membersData
    ? extractPage<ProjectMember>(membersData).items
    : [];
  const testPlans = plansData ? extractPage<TestPlan>(plansData).items : [];
  const currentPlan = testPlans[0];

  if (isLoading) {
    return (
      <div className="flex-1 p-8">
        <div className="h-16 bg-muted animate-pulse rounded-xl mb-6" />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={cn(
                "h-64 bg-muted animate-pulse rounded-xl",
                i % 3 === 0 ? "xl:col-span-2" : "",
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">Project Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The project you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button asChild>
          <Link href="/workspaces">Back to Workspaces</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-3 gap-6 pb-10">
          {/* Test Suites Card */}
          <div className="xl:col-span-1 bg-card rounded-xl border shadow-sm p-5 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Test Suites</h3>
              <Link
                href="/suites"
                className="text-primary text-sm font-bold hover:underline"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3 flex-1">
              {testSuites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="p-3 rounded-full bg-indigo-50 dark:bg-indigo-900/20 mb-3">
                    <Folder className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    No test suites yet
                  </p>
                  <p className="text-xs text-muted-foreground/70 mb-3">
                    Organize related test cases into suites
                  </p>
                  <Link
                    href="/suites"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create Test Suite
                  </Link>
                </div>
              ) : (
                testSuites.map((suite) => (
                  <div
                    key={suite.testSuiteId}
                    className="flex items-center justify-between p-3 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 group-hover:bg-white transition-colors">
                        <Layers className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{suite.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {suite.description || "No description"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Current Test Plan Card */}
          <div className="xl:col-span-2 bg-card rounded-xl border shadow-sm p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg">Current Test Plan</h3>
                  {currentPlan && (
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-bold px-2 py-0.5">
                      {currentPlan.status?.toUpperCase() ?? "ACTIVE"}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentPlan?.name ?? "No test plans yet"}
                </p>
              </div>
              {currentPlan && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground font-medium">
                    Created{" "}
                    {new Date(currentPlan.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
            {currentPlan ? (
              <p className="text-sm text-muted-foreground">
                {currentPlan.description || "No description provided."}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Create a test plan to track your sprint progress.
              </p>
            )}
          </div>

          {/* Recent User Stories Card */}
          <div className="xl:col-span-2 bg-card rounded-xl border shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">Recent User Stories</h3>
              <div className="flex gap-2">
                <Link
                  href={`/projects/${projectId}/stories`}
                  className="text-primary text-sm font-bold hover:underline"
                >
                  View All
                </Link>
              </div>
            </div>
            {userStories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="p-3 rounded-full bg-amber-50 dark:bg-amber-900/20 mb-3">
                  <FileText className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  No user stories yet
                </p>
                <p className="text-xs text-muted-foreground/70 mb-3">
                  User stories define your requirements and acceptance criteria
                </p>
                <Link
                  href={`/projects/${projectId}/stories`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Write First Story
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/50 text-xs text-muted-foreground uppercase font-medium">
                      <th className="px-5 py-3 font-semibold">Title</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold">ACs</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y">
                    {userStories.map((story) => (
                      <tr
                        key={story.userStoryId}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-5 py-3 font-medium">
                          <Link
                            href={`/stories/${story.userStoryId}`}
                            className="hover:text-primary"
                          >
                            {story.title}
                          </Link>
                        </td>
                        <td className="px-5 py-3">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs font-bold",
                              story.status === "DONE" &&
                                "bg-green-50 text-green-700 dark:bg-green-900/20",
                              story.status === "IN_PROGRESS" &&
                                "bg-blue-50 text-blue-700 dark:bg-blue-900/20",
                              story.status === "DRAFT" &&
                                "bg-slate-50 text-slate-600 dark:bg-slate-800",
                            )}
                          >
                            {story.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {(story.acceptanceCriteria ?? []).length}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Project Team Card */}
          <div className="xl:col-span-1 bg-card rounded-xl border shadow-sm p-5 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Project Team</h3>
              <button className="size-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center transition-colors">
                <UserPlus className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 flex-1">
              {teamMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="p-3 rounded-full bg-violet-50 dark:bg-violet-900/20 mb-3">
                    <UserPlus className="h-6 w-6 text-violet-500 dark:text-violet-400" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    No members yet
                  </p>
                  <p className="text-xs text-muted-foreground/70 mb-3">
                    Add team members to collaborate
                  </p>
                  <Link
                    href={`/projects/${projectId}/team`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Invite Member
                  </Link>
                </div>
              ) : (
                teamMembers.map((member) => (
                  <div
                    key={member.projectMemberId}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full flex items-center justify-center font-bold text-sm ring-2 ring-white dark:ring-gray-800 bg-primary/10 text-primary">
                        {member.userFullName?.slice(0, 2).toUpperCase() ?? "??"}
                      </div>
                      <div>
                        <p className="text-sm font-bold">
                          {member.userFullName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {member.role}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded">
                      {member.role}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
