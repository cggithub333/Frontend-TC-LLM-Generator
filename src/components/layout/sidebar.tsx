"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useProjects } from "@/hooks/use-projects";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Folder,
  BarChart3,
  Settings,
  ChevronDown,
  Smartphone,
  CreditCard,
  Shield,
  ShoppingCart,
  Layers,
} from "lucide-react";
import type { ProjectIconType } from "@/types/workspace.types";

// Icon mapping for projects
const projectIcons: Record<ProjectIconType, React.ElementType> = {
  smartphone: Smartphone,
  "credit-card": CreditCard,
  shield: Shield,
  "shopping-cart": ShoppingCart,
  layers: Layers,
  "dashboard-customize": LayoutDashboard,
  api: Layers,
  "integration-instructions": Layers,
};

const navigation = [
  { name: "Stories", href: "/stories", icon: FileText },
  { name: "Test Plans", href: "/test-plans", icon: ClipboardList },
  { name: "Test Suites", href: "/suites", icon: Folder },
  { name: "Reports", href: "/reports", icon: BarChart3 },
];

const adminNav = [
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isWorkspaceExpanded, setIsWorkspaceExpanded] = useState(true);

  // Fetch projects for the dropdown
  const { data: projects, isLoading } = useProjects();

  const isWorkspaceActive = pathname === "/workspaces" || pathname.startsWith("/workspaces/") || pathname.startsWith("/projects/");

  return (
    <aside className="w-20 lg:w-64 border-r border-border bg-card flex flex-col fixed inset-y-0 z-50">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
          <span className="font-bold text-lg">QA</span>
        </div>
        <span className="font-bold text-xl hidden lg:block tracking-tight">
          QA Artifacts
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6 px-3 space-y-1">
        {/* Workspace Dropdown */}
        <div>
          <button
            onClick={() => setIsWorkspaceExpanded(!isWorkspaceExpanded)}
            className={cn(
              "w-full flex items-center justify-between p-3 rounded-xl transition-all",
              isWorkspaceActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <div className="flex items-center gap-4">
              <LayoutDashboard className="h-5 w-5 shrink-0" />
              <span className="font-medium hidden lg:block">Workspace</span>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 transition-transform duration-200 hidden lg:block",
                isWorkspaceExpanded && "rotate-180"
              )}
            />
          </button>

          {/* Projects List */}
          <div
            className={cn(
              "overflow-hidden transition-all duration-200 ease-in-out",
              isWorkspaceExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            )}
          >
            <div className="ml-4 mt-1 space-y-1 hidden lg:block">
              {isLoading ? (
                // Loading skeleton
                <div className="space-y-2 py-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-8 bg-muted/50 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                projects?.map((project) => {
                  const ProjectIcon = projectIcons[project.icon] || Layers;
                  const isProjectActive = pathname === `/projects/${project.id}`;

                  return (
                    <Link
                      key={project.id}
                      href={`/workspaces`} // TODO: Change to /projects/${project.id} when route exists
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                        isProjectActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                      )}
                    >
                      <ProjectIcon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{project.name}</span>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Other Navigation Items */}
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 p-3 rounded-xl transition-all",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="font-medium hidden lg:block">{item.name}</span>
            </Link>
          );
        })}

        {/* Admin Section */}
        <div className="pt-4 pb-2 px-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold hidden lg:block">
            Administration
          </p>
        </div>
        {adminNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 p-3 rounded-xl transition-all",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="font-medium hidden lg:block">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-400 shrink-0" />
          <div className="hidden lg:block">
            <p className="text-xs font-bold">Alex Rivera</p>
            <p className="text-[10px] text-muted-foreground">QA Lead</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

