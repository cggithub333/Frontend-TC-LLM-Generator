"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ClipboardList, 
  Plus, 
  Search, 
  MoreHorizontal, 
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

const testPlans = [
  {
    id: "TP-742",
    name: "Q4 Core App Regression",
    stories: 14,
    testCases: 124,
    progress: 85,
    status: "Active",
    priority: "Critical",
    dueDate: "Dec 20, 2024",
    owner: "Alex Rivera",
    ownerInitials: "AR"
  },
  {
    id: "TP-740",
    name: "Legacy Migration API",
    stories: 6,
    testCases: 42,
    progress: 100,
    status: "Completed",
    priority: "High",
    dueDate: "Nov 28, 2024",
    owner: "Sarah Chen",
    ownerInitials: "SC"
  },
  {
    id: "TP-738",
    name: "Payment Gateway Stress Test",
    stories: 2,
    testCases: 18,
    progress: 45,
    status: "In Progress",
    priority: "Medium",
    dueDate: "Jan 15, 2025",
    owner: "John Doe",
    ownerInitials: "JD"
  }
];

export default function TestPlansPage() {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Test Plans</h1>
          <p className="text-muted-foreground mt-1">
            Overview of all quality assurance strategies and their execution progress.
          </p>
        </div>
        <Button className="gap-2 bg-primary shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" />
          Create Test Plan
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Active Plans", value: "12", icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Total Test Cases", value: "842", icon: ClipboardList, color: "text-primary", bg: "bg-primary/10" },
          { label: "Completion Rate", value: "94%", icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" }
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border p-6 rounded-2xl flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search test plans..." 
            className="w-full h-12 pl-12 pr-4 rounded-xl border border-border bg-card focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
        <Button variant="outline" className="h-12 px-6 rounded-xl">Filters</Button>
      </div>

      {/* Test Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {testPlans.map((plan) => (
          <div 
            key={plan.id}
            className="group bg-card border border-border rounded-2xl p-6 hover:shadow-xl hover:border-primary/40 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold font-mono text-muted-foreground opacity-60">
                    {plan.id}
                  </span>
                  {plan.status === "Completed" ? (
                    <Badge className="bg-green-500/10 text-green-500 border-none flex gap-1 items-center">
                      <CheckCircle2 className="h-3 w-3" />
                      Completed
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-primary/20 text-primary">
                      {plan.status}
                    </Badge>
                  )}
                </div>
                <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                  {plan.name}
                </h3>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Metrics</p>
                <div className="flex gap-4">
                  <div>
                    <p className="text-lg font-bold">{plan.stories}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Stories</p>
                  </div>
                  <div className="border-l border-border pl-4">
                    <p className="text-lg font-bold">{plan.testCases}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Tests</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Due Date</p>
                <p className="text-sm font-bold">{plan.dueDate}</p>
                <p className="text-[10px] text-destructive font-bold uppercase tracking-tighter">
                  {plan.priority}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-muted-foreground">Execution Progress</span>
                <span className="font-black text-primary">{plan.progress}%</span>
              </div>
              <Progress value={plan.progress} className="h-2" />
            </div>

            <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold border-2 border-background">
                  {plan.ownerInitials}
                </div>
                <span className="text-xs font-semibold text-muted-foreground">{plan.owner}</span>
              </div>
              <Button size="sm" variant="secondary" className="gap-1 rounded-lg font-bold">
                Details
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
