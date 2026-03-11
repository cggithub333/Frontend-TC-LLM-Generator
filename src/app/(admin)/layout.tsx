"use client";

import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { SidebarProvider, useSidebar } from "@/components/layout/sidebar-context";
import { cn } from "@/lib/utils";

function AdminContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <main
      className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300",
        isCollapsed ? "ml-20" : "ml-64"
      )}
    >
      {children}
    </main>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex">
        <AdminSidebar />
        <AdminContent>{children}</AdminContent>
      </div>
    </SidebarProvider>
  );
}
