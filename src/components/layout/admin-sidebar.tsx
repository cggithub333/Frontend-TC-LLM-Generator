"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  SlidersHorizontal,
  LogOut,
  Loader2,
  Shield,
} from "lucide-react";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { useSidebar } from "@/components/layout/sidebar-context";
import { useLogout, useCurrentUser } from "@/hooks/use-auth";
import { broadcastLogout, onLogoutBroadcast } from "@/lib/auth-broadcast";

const navigation = [
  { name: "Overview", href: "/admin/overview", icon: LayoutDashboard },
  { name: "Platform Users", href: "/admin/users", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const logout = useLogout();
  const { data: user } = useCurrentUser();

  const displayName = user?.name || "Admin";
  const displayEmail = user?.email || "";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const openProfileMenu = () => {
    if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
    setProfileOpen(true);
  };

  const closeProfileMenu = () => {
    profileTimeoutRef.current = setTimeout(() => setProfileOpen(false), 150);
  };

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        broadcastLogout();
        router.push("/login");
      },
    });
  };

  useEffect(() => {
    const unsubscribe = onLogoutBroadcast(() => {
      router.push("/login");
    });
    return () => {
      unsubscribe();
      if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
    };
  }, [router]);

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
        className="absolute -right-3 top-7 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card shadow-md hover:bg-accent transition-colors"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* Logo / Brand */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-500/20 shrink-0">
          <Shield className="h-5 w-5" />
        </div>
        <div
          className={cn(
            "transition-all duration-300 whitespace-nowrap overflow-hidden",
            isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          )}
        >
          <span className="font-bold text-lg tracking-tight block leading-tight">
            QA Artifacts
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Super Admin Panel
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-2 px-3 space-y-1">
        <div className="pb-2 px-3">
          <p
            className={cn(
              "text-[10px] uppercase tracking-wider text-muted-foreground font-bold transition-all duration-300 whitespace-nowrap overflow-hidden",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}
          >
            Management
          </p>
        </div>
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
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
                  isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
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
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}
          >
            Theme Mode
          </span>
        </div>
      </div>

      {/* User Profile */}
      <div
        className="relative p-4 border-t border-border"
        onMouseEnter={openProfileMenu}
        onMouseLeave={closeProfileMenu}
      >
        {/* Popover menu */}
        <div
          className={cn(
            "absolute bottom-full left-2 right-2 mb-2 rounded-xl border border-border bg-popover p-1.5 shadow-lg shadow-black/10 dark:shadow-black/30 transition-all duration-200 origin-bottom",
            profileOpen
              ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
              : "opacity-0 scale-95 translate-y-1 pointer-events-none"
          )}
          onMouseEnter={openProfileMenu}
          onMouseLeave={closeProfileMenu}
        >
          <div className="px-3 py-2 mb-1">
            <p className="text-sm font-semibold truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">
              {displayEmail}
            </p>
          </div>
          <div className="h-px bg-border mx-1.5 mb-1" />
          <Link
            href="/admin/settings"
            className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-foreground hover:bg-accent transition-colors"
          >
            <User className="h-4 w-4 text-muted-foreground" />
            View Profile
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-foreground hover:bg-accent transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            Preferences
          </Link>
          <div className="h-px bg-border mx-1.5 my-1" />
          <Link
            href="/workspaces"
            className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-foreground hover:bg-accent transition-colors"
          >
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
            Back to Dashboard
          </Link>
          <div className="h-px bg-border mx-1.5 my-1" />
          <button
            onClick={handleLogout}
            disabled={logout.isPending}
            className="flex w-full items-center gap-3 px-3 py-2 text-sm rounded-lg text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
          >
            {logout.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            {logout.isPending ? "Logging out..." : "Log out"}
          </button>
        </div>

        {/* Profile trigger */}
        <div className="flex items-center gap-3 rounded-xl p-1 cursor-pointer hover:bg-accent/50 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-400 shrink-0 flex items-center justify-center text-[10px] font-bold text-white">
            {initials}
          </div>
          <div
            className={cn(
              "transition-all duration-300 overflow-hidden",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}
          >
            <p className="text-xs font-bold whitespace-nowrap">{displayName}</p>
            <p className="text-[10px] text-muted-foreground whitespace-nowrap">
              {displayEmail}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
