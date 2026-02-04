"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/layout/mode-toggle";
import {
  Bell,
  Search,
  Plus,
  Smartphone,
  CreditCard,
  Shield,
  Sparkles,
  User,
} from "lucide-react";

const projects = [
  {
    id: 1,
    name: "Mobile Redesign V2",
    icon: Smartphone,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    stories: 12,
    tests: 88,
    status: "AI Processing",
    statusColor: "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
    updated: "2h ago",
    members: 6,
  },
  {
    id: 2,
    name: "Payment Gateway",
    icon: CreditCard,
    iconColor: "text-orange-600",
    iconBg: "bg-orange-100 dark:bg-orange-900/30",
    stories: 24,
    tests: 142,
    defects: 8,
    status: "Review",
    statusColor: "bg-orange-50 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400",
    updated: "Yesterday",
    members: 2,
  },
  {
    id: 3,
    name: "Security Audit Q3",
    icon: Shield,
    iconColor: "text-green-600",
    iconBg: "bg-green-100 dark:bg-green-900/30",
    stories: 5,
    tests: 34,
    defects: 0,
    status: "Done",
    statusColor: "bg-green-50 dark:bg-green-900/40 text-green-600 dark:text-green-400",
    updated: "4 days ago",
    members: 1,
  },
];

export default function WorkspacesPage() {
  return (
    <>
      {/* Header */}
      <header className="h-20 border-b border-border bg-card px-8 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-2xl font-bold">Workspaces</h1>
        <div className="flex items-center gap-3">
          <ModeToggle />
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive border-2 border-background rounded-full" />
          </Button>
          <div className="flex items-center gap-3 pl-6 border-l border-border">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold">Alex Rivera</p>
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

      {/* Main Content */}
      <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-4 space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Active Workspace
            </label>
            <div className="relative">
              <Select defaultValue="fintech">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fintech">FinTech Core Team</SelectItem>
                  <SelectItem value="marketing">Product Marketing</SelectItem>
                  <SelectItem value="devops">DevOps Infrastructure</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="md:col-span-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-12"
              />
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <Badge className="px-5 py-2 bg-primary text-primary-foreground rounded-full">
              All
            </Badge>
            <Badge
              variant="outline"
              className="px-5 py-2 rounded-full gap-2 hover:border-primary transition-all"
            >
              <Sparkles className="h-3 w-3 text-blue-500" />
              AI Active
            </Badge>
            <Badge
              variant="outline"
              className="px-5 py-2 rounded-full hover:border-primary transition-all"
            >
              Completed
            </Badge>
            <Badge
              variant="outline"
              className="px-5 py-2 rounded-full hover:border-primary transition-all"
            >
              Testing
            </Badge>
          </div>
          <Button variant="link" className="text-primary font-semibold text-sm">
            View All
          </Button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => {
            const Icon = project.icon;
            return (
              <div
                key={project.id}
                className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 ${project.iconBg} rounded-xl flex items-center justify-center ${project.iconColor}`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg leading-none mb-1">
                          {project.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Updated {project.updated}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={`${project.statusColor} text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md gap-1`}
                    >
                      {project.status === "AI Processing" && (
                        <Sparkles className="h-3 w-3" />
                      )}
                      {project.status}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{project.stories}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Stories
                      </p>
                    </div>
                    <div className="text-center border-x border-border">
                      <p className="text-2xl font-bold">{project.tests}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Tests
                      </p>
                    </div>
                    <div className="text-center">
                      {project.status === "AI Processing" ? (
                        <>
                          <p className="text-xl font-bold text-primary italic">AI</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-tight">
                            Generating
                          </p>
                        </>
                      ) : (
                        <>
                          <p className={`text-2xl font-bold ${project.defects && project.defects > 0 ? 'text-destructive' : ''}`}>
                            {project.defects ?? '00'}
                          </p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Defects
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-3">
                    {[...Array(Math.min(project.members, 3))].map((_, i) => (
                      <Avatar key={i} className="w-8 h-8 border-2 border-background">
                        <AvatarFallback className="bg-slate-200">
                          <User className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {project.members > 3 && (
                      <div className="w-8 h-8 rounded-full border-2 border-background bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                        +{project.members - 3}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className={project.status === "Done" ? "text-muted-foreground" : "text-primary"}
                  >
                    {project.status === "Done" ? "Archive" : "View Details"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Create New Project Card */}
        <div className="border-2 border-dashed border-border rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
            <Plus className="h-8 w-8" />
          </div>
          <div>
            <h4 className="font-bold text-lg">Create a new Project</h4>
            <p className="text-muted-foreground max-w-xs mx-auto">
              Start organizing your QA tests and stories by creating a new project container.
            </p>
          </div>
          <Button variant="link" className="text-primary font-bold">
            Get Started
          </Button>
        </div>
      </div>

      {/* Floating Action Button */}
      <Button
        size="icon"
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full shadow-lg shadow-primary/30 hover:scale-110 active:scale-95 transition-all"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </>
  );
}
