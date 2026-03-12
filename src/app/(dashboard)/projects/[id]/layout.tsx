"use client";

import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useProject } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";
import { AlertCircle, Layers, Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const statusColors: Record<string, string> = {
  Active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "AI Processing": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Review: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Done: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const projectId = params.id as string;

  const { data: project, isLoading, error } = useProject(projectId);

  const navItems = [
    { name: "Overview", href: `/projects/${projectId}` },
    { name: "Stories / Requirements", href: `/projects/${projectId}/stories` },
    { name: "Test Plans", href: `/projects/${projectId}/test-plans` },
    { name: "Team Management", href: `/projects/${projectId}/team` },
  ];

  if (isLoading) {
    return (
      <div className="flex-1 p-8">
        <div className="h-24 bg-muted animate-pulse rounded-xl mb-6" />
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">Project Not Found</h2>
        <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist.</p>
        <Button asChild>
          <Link href="/workspaces">Back to Workspaces</Link>
        </Button>
      </div>
    );
  }

  // Hide the global project header in Team management because it has its own, or merge later.
  // Actually, we provide a unified Project Header here.
  const isTeamPage = pathname.endsWith("/team");

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-muted/30">
      {/* Project Global Header */}
      {!isTeamPage && (
        <div className="border-b bg-card shrink-0">
          <header className="flex items-center justify-between px-8 py-5">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-1.5 rounded-md">
                  <Layers className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold">{project.name}</h2>
                <Badge className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ml-2", statusColors[project.status] || statusColors["Active"])}>
                  {project.status || "Active"}
                </Badge>
                {project.projectKey && (
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded ml-1">
                    {project.projectKey}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground text-xs font-medium pl-10">{project.description || "Project Dashboard"}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="gap-2">
                <Calendar className="h-4 w-4" />
                <span>Sync Jira</span>
              </Button>
              <Button size="sm" className="gap-2 shadow-md shadow-primary/30">
                <Plus className="h-4 w-4" />
                <span>New Item</span>
              </Button>
            </div>
          </header>

          {/* Navigation Tabs */}
          <div className="px-8 mt-2">
            <nav className="flex items-center gap-6 overflow-x-auto no-scrollbar">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.name !== "Overview" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "pb-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
                      isActive
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
