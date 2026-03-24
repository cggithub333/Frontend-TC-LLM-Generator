"use client";

import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useProject } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";
import { AlertCircle, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const statusColors: Record<string, string> = {
  Active:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "AI Processing":
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Review:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
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

  if (isLoading) {
    return (
      <div className="flex-1 p-8">
        <div className="h-16 bg-muted animate-pulse rounded-xl mb-6" />
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
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

  // Check if on overview page (exact match to /projects/:id)
  const isOverview = pathname === `/projects/${projectId}`;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-muted/30">
      {/* Simplified Project Header — no horizontal tabs */}
      {isOverview && (
        <div className="border-b bg-card shrink-0">
          <header className="flex items-center justify-between px-8 py-5">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-1.5 rounded-md">
                  <Layers className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold">{project.name}</h2>
                <Badge
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ml-2",
                    statusColors[project.status] || statusColors["Active"],
                  )}
                >
                  {project.status || "Active"}
                </Badge>
                {project.projectKey && (
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded ml-1">
                    {project.projectKey}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground text-xs font-medium pl-10">
                {project.description || "Project Dashboard"}
              </p>
            </div>
          </header>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
