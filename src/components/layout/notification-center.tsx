"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, Check, CheckCheck, FileText, Users, ClipboardList, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useNotificationWebSocket,
  type AppNotification,
} from "@/hooks/use-notifications";
import { useRouter } from "next/navigation";

function getTimeAgo(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "STORY_CREATED":
    case "STORY_UPDATED":
    case "STORY_DELETED":
      return <FileText className="h-4 w-4" />;
    case "TEST_PLAN_CREATED":
    case "TEST_PLAN_STATUS_CHANGED":
      return <ClipboardList className="h-4 w-4" />;
    case "MEMBER_ADDED":
    case "PROJECT_MEMBER_ADDED":
    case "INVITATION_RECEIVED":
      return <Users className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
}

function getIconColor(type: string) {
  switch (type) {
    case "STORY_CREATED":
      return "text-emerald-500 bg-emerald-500/10";
    case "STORY_UPDATED":
      return "text-blue-500 bg-blue-500/10";
    case "STORY_DELETED":
      return "text-red-500 bg-red-500/10";
    case "TEST_PLAN_CREATED":
      return "text-violet-500 bg-violet-500/10";
    case "MEMBER_ADDED":
    case "PROJECT_MEMBER_ADDED":
      return "text-amber-500 bg-amber-500/10";
    default:
      return "text-muted-foreground bg-muted";
  }
}

function NotificationItem({
  notification,
  onRead,
  onNavigate,
}: {
  notification: AppNotification;
  onRead: (id: string) => void;
  onNavigate: (n: AppNotification) => void;
}) {
  return (
    <button
      onClick={() => {
        if (!notification.isRead) onRead(notification.notificationId);
        onNavigate(notification);
      }}
      className={cn(
        "w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
        "hover:bg-accent/60",
        !notification.isRead && "bg-primary/[0.03]"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5",
          getIconColor(notification.type)
        )}
      >
        {getNotificationIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm leading-tight",
            !notification.isRead ? "font-semibold" : "text-muted-foreground"
          )}
        >
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">
          {getTimeAgo(notification.createdAt)}
        </p>
      </div>

      {/* Unread dot */}
      {!notification.isRead && (
        <div className="shrink-0 mt-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
        </div>
      )}
    </button>
  );
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data: notifications = [] } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  // Subscribe to real-time notifications
  useNotificationWebSocket();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigate = (n: AppNotification) => {
    if (n.projectId && n.resourceType) {
      const resourcePath = n.resourceType === "TEST_PLAN" ? "test-plans" : "stories";
      router.push(`/projects/${n.projectId}/${resourcePath}`);
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative inline-flex items-center justify-center h-9 w-9 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1 ring-2 ring-card">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <div
        className={cn(
          "absolute right-0 top-full mt-2 w-[380px] rounded-xl border border-border bg-popover shadow-lg shadow-black/10 dark:shadow-black/30 transition-all duration-200 origin-top-right z-50",
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
              className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="max-h-[400px] overflow-y-auto p-1.5">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Inbox className="h-10 w-10 mb-2 opacity-40" />
              <p className="text-sm font-medium">No notifications yet</p>
              <p className="text-xs mt-0.5">
                We&apos;ll notify you when something happens
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <NotificationItem
                key={n.notificationId}
                notification={n}
                onRead={(id) => markAsRead.mutate(id)}
                onNavigate={handleNavigate}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
