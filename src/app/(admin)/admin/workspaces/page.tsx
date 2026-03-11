"use client";

import { Building2 } from "lucide-react";

export default function AdminWorkspacesPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        <Building2 className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-2xl font-bold">Workspaces Management</h1>
      <p className="text-muted-foreground text-sm">
        Admin workspace management coming soon.
      </p>
    </div>
  );
}
