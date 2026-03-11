"use client";

import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        <Settings className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-2xl font-bold">Admin Settings</h1>
      <p className="text-muted-foreground text-sm">
        Admin settings page coming soon.
      </p>
    </div>
  );
}
