"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Clock,
  User,
  Calendar,
  Tag,
  FileText,
  Save,
  Share2,
  MoreVertical
} from "lucide-react";

const testCase = {
  id: "TC-1024",
  title: "Verify Google OAuth Login Flow",
  type: "Positive",
  priority: "High",
  status: "Passed",
  storyId: "ST-101",
  preconditions: [
    "User has a valid Google account",
    "Application OAuth credentials are configured",
    "User is on the login page"
  ],
  steps: [
    {
      step: 1,
      action: "Click on 'Sign in with Google' button",
      expected: "User is redirected to Google OAuth consent page"
    },
    {
      step: 2,
      action: "Select Google account and grant permissions",
      expected: "User is redirected back to application"
    },
    {
      step: 3,
      action: "Verify user session is created",
      expected: "User dashboard is displayed with user profile"
    }
  ],
  testData: {
    email: "test@example.com",
    environment: "staging"
  },
  assignedTo: "Alex Rivera",
  executedBy: "Maria Kim",
  executedAt: "Dec 1, 2024 2:30 PM"
};

export default function TestCaseDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <Badge variant="outline" className="font-mono text-xs">
              {testCase.id}
            </Badge>
            <Badge className={
              testCase.type === "Positive"
                ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-none"
                : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-none"
            }>
              {testCase.type}
            </Badge>
            <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-none">
              {testCase.priority} Priority
            </Badge>
            <Badge className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {testCase.status}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {testCase.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            Related to Story: <a href="#" className="text-primary font-semibold hover:underline">{testCase.storyId}</a>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
          <Button className="gap-2 bg-primary shadow-lg shadow-primary/20">
            <Save className="h-4 w-4" />
            Save to Suite
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Preconditions */}
        <div className="p-6 border-b border-border">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
            Preconditions
          </h2>
          <ul className="space-y-2">
            {testCase.preconditions.map((condition, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold mt-0.5 shrink-0">
                  {i + 1}
                </div>
                <span className="text-sm leading-relaxed">{condition}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Test Steps */}
        <div className="p-6 border-b border-border">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
            Test Steps
          </h2>
          <div className="space-y-6">
            {testCase.steps.map((step) => (
              <div key={step.step} className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                  {step.step}
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Action
                    </p>
                    <p className="text-sm leading-relaxed bg-muted p-3 rounded-lg">
                      {step.action}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Expected Result
                    </p>
                    <p className="text-sm leading-relaxed bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-300 p-3 rounded-lg border border-green-200 dark:border-green-900/30">
                      {step.expected}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Test Data */}
        <div className="p-6 border-b border-border">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
            Test Data
          </h2>
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 font-mono text-sm">
            <pre className="text-xs">{JSON.stringify(testCase.testData, null, 2)}</pre>
          </div>
        </div>

        {/* Execution Details */}
        <div className="p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
            Execution Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Assigned To</p>
                <p className="text-sm font-semibold">{testCase.assignedTo}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Executed By</p>
                <p className="text-sm font-semibold">{testCase.executedBy}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Executed At</p>
                <p className="text-sm font-semibold">{testCase.executedAt}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
