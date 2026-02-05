"use client";

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
} from "lucide-react";

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
