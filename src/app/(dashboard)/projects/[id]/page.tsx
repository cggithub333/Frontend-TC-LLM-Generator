"use client";

/**
 * Project Detail Page
 * Dashboard view matching 6.project-detail-page.html template
 */

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Plus,
  Smartphone,
  LogIn,
  ShoppingCart,
  User,
  UserPlus,
  Filter,
  Gavel,
  CreditCard,
  Shield,
  Layers,
  LayoutDashboard,
  AlertCircle,
} from "lucide-react";
import { useProject } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";
import type { ProjectIconType } from "@/types/workspace.types";

// Icon mapping for projects
const projectIcons: Record<ProjectIconType, React.ElementType> = {
  smartphone: Smartphone,
  "credit-card": CreditCard,
  shield: Shield,
  "shopping-cart": ShoppingCart,
  layers: Layers,
  "dashboard-customize": LayoutDashboard,
  api: Layers,
  "integration-instructions": Layers,
};

// Status colors
const statusColors: Record<string, string> = {
  "Active": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "AI Processing": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "Review": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "Done": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

// Mock data for test suites
const testSuites = [
  { id: 1, name: "Auth Flow", icon: LogIn, cases: 24, updated: "2h ago", color: "bg-indigo-50 text-indigo-600" },
  { id: 2, name: "Checkout", icon: ShoppingCart, cases: 42, updated: "5h ago", color: "bg-teal-50 text-teal-600" },
  { id: 3, name: "Profile Mgmt", icon: User, cases: 18, updated: "1d ago", color: "bg-rose-50 text-rose-600" },
];

// Mock data for sprint plan
const sprintPlan = {
  name: "Sprint 42 Regression Cycle",
  completion: 78,
  total: 124,
  passed: 92,
  failed: 8,
  pending: 24,
};

// Mock data for user stories
const userStories = [
  { id: "US-1024", name: "Implement OAuth 2.0 flow", priority: "High", status: "In Progress", assignee: "JD", assigneeColor: "bg-purple-200 text-purple-700" },
  { id: "US-1025", name: "Shopping cart persistence", priority: "Medium", status: "Done", assignee: "AS", assigneeColor: "bg-blue-200 text-blue-700" },
  { id: "US-1028", name: "Update payment API version", priority: "High", status: "To Do", assignee: "MK", assigneeColor: "bg-green-200 text-green-700" },
];

// Mock data for team members
const teamMembers = [
  { id: 1, name: "Alex Rivera", role: "Owner", permission: "Admin", avatar: null, avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB7iB75KPom355AUA--4fEHZ-BLtC3Z1ubsmhayaX7SPvCPLNAhTP6Ea8nWJ_TIrWAWtYHSnrOTX_Ay4BWM9VacT2dgKTt2IlQPRN50E7f28F852nvJJj_-8IBTN3ElQNQ9OJ0Q1DUPUmaSs4ZJrkS4uGPk0QLnQ8DfcEcRwgFXE1hnCPsr005LjAXjCdLeIHecwqZgWS_JKGoTdmG0SaJZ0B9fbmbNIzna9k18yGSOy7IpCxFQZarJtxugZ6xQ_3ImELwNQXbbujrB" },
  { id: 2, name: "Sarah Jenkins", role: "QA Lead", permission: "Editor", avatar: "SJ", avatarColor: "bg-purple-100 text-purple-600" },
  { id: 3, name: "Mike Ross", role: "Developer", permission: "Viewer", avatar: "MR", avatarColor: "bg-blue-100 text-blue-600" },
];

// Mock data for business rules
const businessRules = [
  { id: 1, title: "Free shipping logic", description: "Orders over $50 must trigger free standard shipping automatically." },
  { id: 2, title: "Age verification", description: "Users must be 18+ to access the 'Restricted' category items." },
  { id: 3, title: "Coupon Stacking", description: "Only one promotional code can be applied per checkout session." },
];

// Mock data for recent activity
const recentActivity = [
  { id: 1, title: "Test Suite 'Auth Flow' Executed", description: "Triggered by Jenkins CI/CD Pipeline", time: "10:42 AM", isActive: true },
  { id: 2, title: "Sarah updated 'Checkout' Test Plan", description: "Modified 3 test cases for edge scenarios", time: "Yesterday", isActive: false },
  { id: 3, title: "New User Story added: US-1030", description: "Created by Alex Rivera", time: "2 days ago", isActive: false },
  { id: 4, title: "Project settings updated", description: "Changed default environment to 'Staging'", time: "Oct 20", isActive: false },
];

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  // Fetch project data
  const { data: project, isLoading, error } = useProject(Number(projectId));

  if (isLoading) {
    return (
      <div className="flex-1 p-8">
        <div className="h-16 bg-muted animate-pulse rounded-xl mb-6" />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={cn("h-64 bg-muted animate-pulse rounded-xl", i % 3 === 0 ? "xl:col-span-2" : "")} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">Project Not Found</h2>
        <p className="text-muted-foreground mb-4">The project you&apos;re looking for doesn&apos;t exist.</p>
        <Button asChild>
          <Link href="/workspaces">Back to Workspaces</Link>
        </Button>
      </div>
    );
  }

  const ProjectIcon = projectIcons[project.icon] || Layers;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-muted/30">
      {/* Header */}
      <header className="flex items-center justify-between border-b bg-card px-8 py-5 shrink-0">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-1.5 rounded-md">
              <ProjectIcon className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold">{project.name}</h2>
            <Badge className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ml-2", statusColors[project.status] || statusColors["Active"])}>
              {project.status}
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs font-medium pl-10">Project Dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span>Oct 24 - Nov 24</span>
          </Button>
          <Button size="sm" className="gap-2 shadow-md shadow-primary/30">
            <Plus className="h-4 w-4" />
            <span>New Item</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-3 gap-6 pb-10">

          {/* Test Suites Card */}
          <div className="xl:col-span-1 bg-card rounded-xl border shadow-sm p-5 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Test Suites</h3>
              <button className="text-primary text-sm font-bold hover:underline">View All</button>
            </div>
            <div className="space-y-3 flex-1">
              {testSuites.map((suite) => (
                <div
                  key={suite.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg group-hover:bg-white transition-colors", suite.color)}>
                      <suite.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{suite.name}</p>
                      <p className="text-xs text-muted-foreground">Updated {suite.updated}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold">{suite.cases}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">Cases</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Sprint Plan Card */}
          <div className="xl:col-span-2 bg-card rounded-xl border shadow-sm p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg">Current Sprint Plan</h3>
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-bold px-2 py-0.5">
                    IN PROGRESS
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{sprintPlan.name}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{sprintPlan.completion}%</p>
                <p className="text-xs text-muted-foreground font-medium">Completion</p>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-3 mb-6 overflow-hidden">
              <div className="bg-primary h-3 rounded-full transition-all" style={{ width: `${sprintPlan.completion}%` }} />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-muted/50 p-3 rounded-lg text-center border">
                <p className="text-2xl font-bold mb-1">{sprintPlan.total}</p>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">Total</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center border border-green-100 dark:border-green-800">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">{sprintPlan.passed}</p>
                <p className="text-[10px] uppercase font-bold text-green-700 dark:text-green-500 tracking-wide">Passed</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center border border-red-100 dark:border-red-800">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">{sprintPlan.failed}</p>
                <p className="text-[10px] uppercase font-bold text-red-700 dark:text-red-500 tracking-wide">Failed</p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-center border border-yellow-100 dark:border-yellow-800">
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">{sprintPlan.pending}</p>
                <p className="text-[10px] uppercase font-bold text-yellow-700 dark:text-yellow-500 tracking-wide">Pending</p>
              </div>
            </div>
          </div>

          {/* Recent User Stories Card */}
          <div className="xl:col-span-2 bg-card rounded-xl border shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">Recent User Stories</h3>
              <div className="flex gap-2">
                <button className="text-muted-foreground hover:text-primary">
                  <Filter className="h-5 w-5" />
                </button>
                <button className="text-primary text-sm font-bold hover:underline">View All</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 text-xs text-muted-foreground uppercase font-medium">
                    <th className="px-5 py-3 font-semibold">ID</th>
                    <th className="px-5 py-3 font-semibold">Story Name</th>
                    <th className="px-5 py-3 font-semibold">Priority</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Assignee</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y">
                  {userStories.map((story) => (
                    <tr key={story.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3 text-muted-foreground">{story.id}</td>
                      <td className="px-5 py-3 font-medium">{story.name}</td>
                      <td className="px-5 py-3">
                        <span className={cn(
                          "font-bold text-xs px-2 py-1 rounded",
                          story.priority === "High" ? "text-red-600 bg-red-50 dark:bg-red-900/20" : "text-orange-600 bg-orange-50 dark:bg-orange-900/20"
                        )}>
                          {story.priority}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1.5">
                          <span className={cn(
                            "size-2 rounded-full",
                            story.status === "Done" ? "bg-green-400" : story.status === "In Progress" ? "bg-yellow-400" : "bg-gray-300"
                          )} />
                          {story.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className={cn("size-6 rounded-full flex items-center justify-center text-[10px] font-bold", story.assigneeColor)}>
                          {story.assignee}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Project Team Card */}
          <div className="xl:col-span-1 bg-card rounded-xl border shadow-sm p-5 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Project Team</h3>
              <button className="size-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center transition-colors">
                <UserPlus className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 flex-1">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {member.avatarUrl ? (
                      <div
                        className="size-10 rounded-full bg-cover bg-center ring-2 ring-white dark:ring-gray-800"
                        style={{ backgroundImage: `url("${member.avatarUrl}")` }}
                      />
                    ) : (
                      <div className={cn("size-10 rounded-full flex items-center justify-center font-bold text-sm ring-2 ring-white dark:ring-gray-800", member.avatarColor)}>
                        {member.avatar}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded">
                    {member.permission}
                  </span>
                </div>
              ))}
              <div className="flex -space-x-2 pt-2">
                <div className="size-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs ring-2 ring-white font-bold">AL</div>
                <div className="size-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-xs ring-2 ring-white font-bold">KT</div>
                <div className="size-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs ring-2 ring-white hover:bg-muted/80 cursor-pointer">+4</div>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-6 border-primary text-primary hover:bg-primary/5">
              Manage Access
            </Button>
          </div>

          {/* Business Rules Card */}
          <div className="xl:col-span-1 bg-card rounded-xl border shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Business Rules</h3>
              <button className="text-muted-foreground hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>
            <ul className="space-y-3">
              {businessRules.map((rule) => (
                <li key={rule.id} className="flex gap-3 items-start p-3 bg-muted/50 rounded-lg">
                  <Gavel className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">{rule.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">{rule.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Recent Activity Card */}
          <div className="xl:col-span-2 bg-card rounded-xl border shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Recent Activity</h3>
              <button className="text-primary text-sm font-bold hover:underline">Full Log</button>
            </div>
            <div className="relative pl-4 border-l border-border space-y-6 py-2">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="relative">
                  <div className="absolute -left-[21px] bg-card p-1">
                    <div className={cn("size-2.5 rounded-full", activity.isActive ? "bg-primary" : "bg-muted-foreground/30")} />
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold">{activity.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
