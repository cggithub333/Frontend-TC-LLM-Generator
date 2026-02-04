"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Trash2,
  Copy,
  MoveRight,
  CheckCircle2,
  XCircle,
  Clock,
  Play
} from "lucide-react";
import { cn } from "@/lib/utils";

const testCases = [
  {
    id: "TC-1024",
    title: "Verify Google OAuth Login Flow",
    type: "Positive",
    priority: "High",
    status: "Passed",
    assignedTo: "AR"
  },
  {
    id: "TC-1025",
    title: "Verify OAuth Error Handling - Invalid Credentials",
    type: "Negative",
    priority: "Medium",
    status: "Failed",
    assignedTo: "JV"
  },
  {
    id: "TC-1026",
    title: "Verify Session Persistence After Login",
    type: "Positive",
    priority: "High",
    status: "Passed",
    assignedTo: "MK"
  },
  {
    id: "TC-1027",
    title: "Verify Logout Functionality",
    type: "Positive",
    priority: "Medium",
    status: "Pending",
    assignedTo: "AR"
  }
];

export default function SuiteDetailPage({ params }: { params: { id: string } }) {
  const [selectedTests, setSelectedTests] = useState<string[]>([]);

  const toggleTest = (id: string) => {
    setSelectedTests(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedTests.length === testCases.length) {
      setSelectedTests([]);
    } else {
      setSelectedTests(testCases.map(tc => tc.id));
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline" className="font-mono text-xs">
              TS-AUTH-001
            </Badge>
            <Badge className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900">
              Active
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Authentication Module</h1>
          <p className="text-muted-foreground mt-1">
            All test cases related to user authentication flows
          </p>
        </div>
        <Button className="gap-2 bg-primary shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" />
          Add Test Case
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Cases", value: testCases.length, icon: CheckCircle2, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Passed", value: 2, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Failed", value: 1, icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
          { label: "Pending", value: 1, icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" }
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border p-6 rounded-2xl flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black">{stat.value}</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bulk Actions */}
      {selectedTests.length > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
          <span className="text-sm font-bold text-primary">
            {selectedTests.length} test case{selectedTests.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <MoveRight className="h-4 w-4" />
              Move
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Copy className="h-4 w-4" />
              Duplicate
            </Button>
            <Button variant="destructive" size="sm" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Test Cases Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedTests.length === testCases.length}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead className="font-bold">ID</TableHead>
              <TableHead className="font-bold">Title</TableHead>
              <TableHead className="font-bold">Type</TableHead>
              <TableHead className="font-bold">Priority</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold">Assigned</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testCases.map((testCase) => (
              <TableRow
                key={testCase.id}
                className={cn(
                  "cursor-pointer hover:bg-accent/50",
                  selectedTests.includes(testCase.id) && "bg-primary/5"
                )}
                onClick={() => toggleTest(testCase.id)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedTests.includes(testCase.id)}
                    onCheckedChange={() => toggleTest(testCase.id)}
                  />
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {testCase.id}
                </TableCell>
                <TableCell className="font-medium max-w-md">
                  {testCase.title}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      testCase.type === "Positive"
                        ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900"
                        : "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900"
                    }
                  >
                    {testCase.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      testCase.priority === "High"
                        ? "bg-destructive/10 text-destructive border-destructive/20"
                        : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900"
                    }
                  >
                    {testCase.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "gap-1",
                      testCase.status === "Passed" && "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900",
                      testCase.status === "Failed" && "bg-destructive/10 text-destructive border-destructive/20",
                      testCase.status === "Pending" && "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900"
                    )}
                  >
                    {testCase.status === "Passed" && <CheckCircle2 className="h-3 w-3" />}
                    {testCase.status === "Failed" && <XCircle className="h-3 w-3" />}
                    {testCase.status === "Pending" && <Clock className="h-3 w-3" />}
                    {testCase.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">
                    {testCase.assignedTo}
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Play className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
