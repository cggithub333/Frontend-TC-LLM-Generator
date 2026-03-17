"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Folder,
  Settings,
  ChevronDown,
  Plus,
  Check,
  ArrowLeft,
  Users,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
  Home,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import { useSidebar } from "@/components/layout/sidebar-context";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useProject } from "@/hooks/use-projects";
import { useMyProjectRole } from "@/hooks/use-my-project-role";

const workspaceNavGroups = [
  {
    label: "WORKSPACE",
    items: [
      { name: "Home", href: "/workspaces", icon: Home, exactMatch: true },
    ],
  },
];

const getWorkspaceContextNavGroups = (workspaceId: string) => [
  {
    label: "WORKSPACE",
    items: [
      { name: "Projects", href: `/workspaces/${workspaceId}`, icon: Layers, exactMatch: true },
      { name: "Members", href: `/workspaces/${workspaceId}/members`, icon: Users },
    ],
  },
];

const workspaceAdminNav = [
  { name: "Settings", href: "/settings", icon: Settings },
];

// ──────── Project-level nav (when inside /projects/:id) ────────
const getProjectNavGroups = (projectId: string, canManageTeam: boolean) => [
  {
    label: "PROJECT NAVIGATION",
    items: [
      { name: "Overview", href: `/projects/${projectId}`, icon: Layers },
      { name: "Stories", href: `/projects/${projectId}/stories`, icon: FileText },
      { name: "Test Plans", href: `/projects/${projectId}/test-plans`, icon: ClipboardList },
      { name: "Test Suites", href: `/projects/${projectId}/suites`, icon: Folder },
      ...(canManageTeam
        ? [{ name: "Team Management", href: `/projects/${projectId}/team`, icon: Users }]
        : []),
    ],
  },
];

const getProjectAdminNav = (projectId: string) => [
  { name: "Project Settings", href: `/projects/${projectId}/settings`, icon: Settings },
];

// ──────── Workspace Switcher ────────
function WorkspaceSwitcher({ isCollapsed }: { isCollapsed: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  const { data: workspacesResult } = useWorkspaces();
  const workspaces = workspacesResult?.items ?? [];

  // Extract current workspace ID from URL
  const currentWorkspaceId = pathname.match(/\/workspaces\/([^/]+)/)?.[1];
  const isOnWorkspacesPage = pathname === "/workspaces";

  // Also try to get workspace from project context
  const projectId = pathname.match(/\/projects\/([^/]+)/)?.[1];
  const { data: project } = useProject(projectId ?? "");

  const currentWorkspace = workspaces.find(
    (ws) => ws.workspaceId === currentWorkspaceId || ws.workspaceId === project?.workspaceId
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isCollapsed) {
    return (
      <div className="px-3 mt-2">
        <Link
          href="/workspaces"
          className="flex items-center justify-center p-2 rounded-lg hover:bg-accent transition-colors"
          title="Workspaces"
        >
          <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
        </Link>
      </div>
    );
  }

  return (
    <div className="px-3 mt-2" ref={switcherRef}>
      <button
        onClick={() => {
          if (isOnWorkspacesPage) return;
          setOpen(!open);
        }}
        className={cn(
          "flex items-center justify-between w-full p-2.5 rounded-lg border border-border bg-background transition-colors text-left",
          isOnWorkspacesPage
            ? "cursor-default opacity-70"
            : "hover:bg-accent/50 cursor-pointer"
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-6 rounded bg-primary/10 flex items-center justify-center shrink-0">
            <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-sm font-medium truncate">
            {isOnWorkspacesPage
              ? "All Workspaces"
              : currentWorkspace?.name || project?.workspaceName || "Select Workspace"}
          </span>
        </div>
        {!isOnWorkspacesPage && (
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform shrink-0",
              open && "rotate-180"
            )}
          />
        )}
      </button>

      {/* Dropdown */}
      {open && !isOnWorkspacesPage && (
        <div className="absolute left-3 right-3 mt-1 z-[60] rounded-lg border border-border bg-popover shadow-lg shadow-black/10 dark:shadow-black/30 max-h-64 overflow-auto">
          {workspaces.map((ws) => (
            <button
              key={ws.workspaceId}
              onClick={() => {
                router.push(`/workspaces/${ws.workspaceId}`);
                setOpen(false);
              }}
              className={cn(
                "flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-accent transition-colors text-left",
                (ws.workspaceId === currentWorkspaceId || ws.workspaceId === project?.workspaceId) && "bg-primary/5 text-primary"
              )}
            >
              <span className="truncate">{ws.name}</span>
              {(ws.workspaceId === currentWorkspaceId || ws.workspaceId === project?.workspaceId) && (
                <Check className="h-4 w-4 text-primary shrink-0" />
              )}
            </button>
          ))}
          <div className="border-t border-border">
            <Link
              href="/workspaces"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Plus className="h-4 w-4" />
              Manage Workspaces
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ──────── Back to Projects Button ────────
function BackToProjectsButton({ isCollapsed, workspaceId }: { isCollapsed: boolean; workspaceId?: string }) {
  const href = workspaceId ? `/workspaces/${workspaceId}` : "/workspaces";

  if (isCollapsed) {
    return (
      <div className="px-3 mt-3">
        <Link
          href={href}
          className="flex items-center justify-center p-2.5 rounded-xl text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
          title="Back to Projects"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="px-3 mt-3">
      <Link
        href={href}
        className="flex items-center gap-3 p-2.5 rounded-xl text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        <span className="text-sm font-medium">Back to Projects</span>
      </Link>
    </div>
  );
}

// ──────── Project Name Header in Sidebar ────────
function ProjectNameHeader({ isCollapsed, projectName }: { isCollapsed: boolean; projectName: string }) {
  if (isCollapsed) return null;

  return (
    <div className="px-5 mt-4 mb-1">
      <p className="text-sm font-bold text-foreground truncate">
        {projectName}
      </p>
    </div>
  );
}

// ──────── Main Sidebar ────────
export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();

  // ── Context Detection ──
  const projectId = pathname.match(/\/projects\/([^/]+)/)?.[1] ?? null;
  const workspaceId = pathname.match(/\/workspaces\/([^/]+)/)?.[1] ?? null;
  const isProjectContext = !!projectId;
  const { data: project } = useProject(projectId ?? "");
  const { data: myRole } = useMyProjectRole(projectId ?? "");
  const canManageTeam = myRole?.canManageTeam ?? false;

  // ── Determine which nav items to render ──
  const navGroups = isProjectContext
    ? getProjectNavGroups(projectId!, canManageTeam)
    : workspaceId
      ? getWorkspaceContextNavGroups(workspaceId)
      : workspaceNavGroups;

  const adminItems = isProjectContext
    ? getProjectAdminNav(projectId!)
    : workspaceAdminNav;

  return (
    <aside
      className={cn(
        "border-r border-border bg-card flex flex-col fixed inset-y-0 z-50 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-4 top-6 z-50 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card shadow-md hover:bg-accent transition-colors"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <PanelLeftOpen className="h-3.5 w-3.5" />
        ) : (
          <PanelLeftClose className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Logo — compact, no heavy shadow */}
      <div className="px-4 py-3 flex items-center gap-2.5">
        <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shrink-0">
          <span className="font-bold text-xs">QA</span>
        </div>
        <span
          className={cn(
            "font-semibold text-sm tracking-tight transition-all duration-300 whitespace-nowrap overflow-hidden",
            isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          )}
        >
          QuraEx
        </span>
      </div>

      {/* Workspace Switcher */}
      <WorkspaceSwitcher isCollapsed={isCollapsed} />

      {/* Back to Workspaces (when inside a specific workspace, not a project) */}
      {workspaceId && !isProjectContext && (
        <div className="px-3 mt-3">
          <Link
            href="/workspaces"
            className="flex items-center gap-3 p-2.5 rounded-xl text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all group"
          >
            <ArrowLeft className={cn("h-4 w-4 transition-transform group-hover:-translate-x-0.5", isCollapsed && "mx-auto")} />
            <span
              className={cn(
                "text-sm font-medium transition-all duration-300 whitespace-nowrap overflow-hidden",
                isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
              )}
            >
              All Workspaces
            </span>
          </Link>
        </div>
      )}

      {/* Back to Projects (only in project context) */}
      {isProjectContext && (
        <>
          <BackToProjectsButton
            isCollapsed={isCollapsed}
            workspaceId={project?.workspaceId}
          />
          {/* Divider */}
          <div className="mx-3 my-2 h-px bg-border" />
          {/* Project Name */}
          <ProjectNameHeader
            isCollapsed={isCollapsed}
            projectName={project?.name || "Loading..."}
          />
        </>
      )}

      {/* Navigation — Grouped */}
      <nav className="flex-1 mt-1 px-3 space-y-0.5">
        {navGroups.map((group) => (
          <div key={group.label}>
            {/* Section header — lighter weight */}
            <div className="pt-3 pb-1.5 px-3">
              <p
                className={cn(
                  "text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium transition-all duration-300 whitespace-nowrap overflow-hidden",
                  isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                )}
              >
                {group.label}
              </p>
            </div>
            {group.items.map((item) => {
              // Determine active state
              let isActive = false;
              const itemAny = item as any;
              if (itemAny.exactMatch) {
                // "Home" — only active on exact /workspaces
                isActive = pathname === item.href;
              } else if (itemAny.matchWorkspaceChild) {
                // "Projects" — active when inside a specific workspace (/workspaces/:id)
                isActive = /\/workspaces\/[^/]+/.test(pathname);
              } else if (item.name === "Overview") {
                isActive = pathname === item.href;
              } else {
                isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              }
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm transition-all",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span
                    className={cn(
                      "transition-all duration-300 whitespace-nowrap overflow-hidden",
                      isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                    )}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        ))}

        {/* Admin Section — lighter label */}
        <div className="pt-3 pb-1.5 px-3">
          <p
            className={cn(
              "text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium transition-all duration-300 whitespace-nowrap overflow-hidden",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}
          >
            {isProjectContext ? "Project Admin" : "Administration"}
          </p>
        </div>
        {adminItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm transition-all",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span
                className={cn(
                  "transition-all duration-300 whitespace-nowrap overflow-hidden",
                  isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer — Runpod-style: Feedback + Help only */}
      <div className="px-3 pb-3 mt-auto space-y-0.5">
        <a
          href="#"
          className={cn(
            "flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm text-primary hover:bg-accent transition-colors",
          )}
        >
          <MessageSquare className="h-4 w-4 shrink-0" />
          <span
            className={cn(
              "transition-all duration-300 whitespace-nowrap overflow-hidden",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}
          >
            Feedback
          </span>
        </a>
        <a
          href="#"
          className={cn(
            "flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
          )}
        >
          <HelpCircle className="h-4 w-4 shrink-0" />
          <span
            className={cn(
              "transition-all duration-300 whitespace-nowrap overflow-hidden",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}
          >
            Help & resources
          </span>
        </a>
      </div>
    </aside>
  );
}
