"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Folder,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ModeToggle } from "@/components/layout/mode-toggle";

const navigation = [
  { name: "Workspace", href: "/workspaces", icon: LayoutDashboard },
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "border-r border-border bg-card flex flex-col fixed inset-y-0 z-50 transition-all duration-300",
        isCollapsed ? "w-20" : "w-20 lg:w-64"
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-7 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card shadow-md hover:bg-accent transition-colors"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 shrink-0">
          <span className="font-bold text-lg">QA</span>
        </div>
        <span
          className={cn(
            "font-bold text-xl tracking-tight transition-all duration-300 whitespace-nowrap overflow-hidden",
            isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100 hidden lg:block"
          )}
        >
          QA Artifacts
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6 px-3 space-y-2">
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
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span
                className={cn(
                  "font-medium transition-all duration-300 whitespace-nowrap overflow-hidden",
                  isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100 hidden lg:block"
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}

        {/* Admin Section */}
        <div className="pt-4 pb-2 px-3">
          <p
            className={cn(
              "text-[10px] uppercase tracking-wider text-muted-foreground font-bold transition-all duration-300 whitespace-nowrap overflow-hidden",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100 hidden lg:block"
            )}
          >
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
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span
                className={cn(
                  "font-medium transition-all duration-300 whitespace-nowrap overflow-hidden",
                  isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100 hidden lg:block"
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="px-3 pb-2">
        <div
          className="flex items-center gap-4 p-3 rounded-xl text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
          title={isCollapsed ? "Theme Mode" : undefined}
        >
          <ModeToggle />
          <span
            className={cn(
              "font-medium transition-all duration-300 whitespace-nowrap overflow-hidden",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100 hidden lg:block"
            )}
          >
            Theme Mode
          </span>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-400 shrink-0" />
          <div
            className={cn(
              "transition-all duration-300 overflow-hidden",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100 hidden lg:block"
            )}
          >
            <p className="text-xs font-bold whitespace-nowrap">Alex Rivera</p>
            <p className="text-[10px] text-muted-foreground whitespace-nowrap">QA Lead</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
