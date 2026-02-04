"use client";

import Link from "next/link";
import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  return (
    <header className="h-20 border-b border-border bg-card px-8 flex items-center justify-between sticky top-0 z-40">
      <h1 className="text-2xl font-bold">Workspaces</h1>
      
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive border-2 border-background rounded-full" />
        </Button>

        {/* User Menu */}
        <div className="flex items-center gap-3 pl-6 border-l border-border">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold">Alex Rivers</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
          <Avatar>
            <AvatarFallback className="bg-orange-200">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
