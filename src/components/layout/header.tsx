"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  User,
  SlidersHorizontal,
  LogOut,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { useLogout, useCurrentUser } from "@/hooks/use-auth";
import { broadcastLogout } from "@/lib/auth-broadcast";

export function GlobalHeader() {
  const router = useRouter();
  const logout = useLogout();
  const { data: user } = useCurrentUser();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName = user?.name || "User";
  const displayEmail = user?.email || "";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        broadcastLogout();
        router.push("/login");
      },
    });
  };

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm px-6 flex items-center justify-end sticky top-0 z-40">
      <div className="flex items-center gap-1">
        {/* Theme Toggle */}
        <ModeToggle />

        {/* Notifications */}
        <button
          className="relative inline-flex items-center justify-center h-9 w-9 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full ring-2 ring-card" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-border mx-2" />

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors",
              "hover:bg-accent/60",
              profileOpen && "bg-accent/60"
            )}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-400 shrink-0 flex items-center justify-center text-[11px] font-bold text-primary-foreground">
              {initials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium leading-tight">{displayName}</p>
            </div>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground transition-transform hidden sm:block",
                profileOpen && "rotate-180"
              )}
            />
          </button>

          {/* Dropdown Menu */}
          <div
            className={cn(
              "absolute right-0 top-full mt-2 w-60 rounded-xl border border-border bg-popover p-1.5 shadow-lg shadow-black/10 dark:shadow-black/30 transition-all duration-200 origin-top-right",
              profileOpen
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 pointer-events-none"
            )}
          >
            {/* User Info */}
            <div className="px-3 py-2.5 mb-1">
              <p className="text-sm font-semibold truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">
                {displayEmail}
              </p>
            </div>
            <div className="h-px bg-border mx-1.5 mb-1" />

            <Link
              href="/settings"
              onClick={() => setProfileOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-foreground hover:bg-accent transition-colors"
            >
              <User className="h-4 w-4 text-muted-foreground" />
              View Profile
            </Link>
            <Link
              href="/settings"
              onClick={() => setProfileOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-foreground hover:bg-accent transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              Preferences
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
        </div>
      </div>
    </header>
  );
}
