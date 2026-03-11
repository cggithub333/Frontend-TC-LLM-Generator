"use client";

import { LayoutDashboard } from "lucide-react";

export default function AdminOverviewPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        <LayoutDashboard className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-2xl font-bold">Admin Overview</h1>
      <p className="text-muted-foreground text-sm">
        Dashboard overview coming soon.
      </p>
    </div>
  );
}
