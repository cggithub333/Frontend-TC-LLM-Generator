"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Folder,
  FileText,
  Clock,
  MoreVertical,
  ChevronRight
} from "lucide-react";

const suites = [
  {
    id: "TS-AUTH-001",
    name: "Authentication Module",
    description: "All test cases related to user authentication flows",
    testCases: 24,
    lastUpdated: "2h ago",
    status: "Active"
  },
  {
    id: "TS-PAYMENT-001",
    name: "Payment Processing",
    description: "Test cases for payment gateway integration",
    testCases: 18,
    lastUpdated: "1d ago",
    status: "Active"
  },
  {
    id: "TS-CHECKOUT-001",
    name: "Checkout Flow",
    description: "End-to-end checkout process validation",
    testCases: 32,
    lastUpdated: "3h ago",
    status: "Active"
  },
  {
    id: "TS-ADMIN-001",
    name: "Admin Dashboard",
    description: "Admin panel functionality tests",
    testCases: 15,
    lastUpdated: "5d ago",
    status: "Archived"
  }
];

export default function TestSuitesPage() {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Test Suites</h1>
          <p className="text-muted-foreground mt-1">
            Organize and manage your test cases into logical groups
          </p>
        </div>
        <Button className="gap-2 bg-primary shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" />
          New Suite
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search suites by name or ID..."
          className="pl-12 h-12"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Suites", value: "12", icon: Folder },
          { label: "Total Test Cases", value: "248", icon: FileText },
          { label: "Active Suites", value: "9", icon: Clock },
          { label: "Coverage", value: "94%", icon: FileText }
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-black">{stat.value}</p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Suites Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {suites.map((suite) => (
          <div
            key={suite.id}
            className="group bg-card border border-border rounded-2xl p-6 hover:shadow-xl hover:border-primary/40 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Folder className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-muted-foreground opacity-60">
                      {suite.id}
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        suite.status === "Active"
                          ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900"
                          : "bg-slate-50 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400"
                      }
                    >
                      {suite.status}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                    {suite.name}
                  </h3>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
              {suite.description}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-bold">{suite.testCases}</span>
                  <span className="text-muted-foreground">cases</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{suite.lastUpdated}</span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>

      {/* Empty State for New Suite */}
      <div className="border-2 border-dashed border-border rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
          <Plus className="h-8 w-8" />
        </div>
        <div>
          <h4 className="font-bold text-lg">Create a new Test Suite</h4>
          <p className="text-muted-foreground max-w-xs mx-auto">
            Group related test cases together for better organization and execution
          </p>
        </div>
        <Button variant="link" className="text-primary font-bold">
          Get Started
        </Button>
      </div>
    </div>
  );
}
