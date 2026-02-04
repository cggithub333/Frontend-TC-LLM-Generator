"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  FileText,
  Sparkles,
  MoreVertical,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react";

export default function TestPlanDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-2">
            Sprint Plan
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">Sprint 24 - Checkout Flow</h1>
          <div className="flex items-center gap-4 mt-2 text-muted-foreground text-sm">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Oct 12 - Oct 26
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              48 Test Cases
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <MoreVertical className="h-4 w-4" />
          </Button>
          <Button className="gap-2 bg-primary shadow-lg shadow-primary/20">
            <Sparkles className="h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="bg-muted p-1 rounded-xl">
          <TabsTrigger value="active" className="rounded-lg">Active</TabsTrigger>
          <TabsTrigger value="completed" className="rounded-lg">Completed</TabsTrigger>
          <TabsTrigger value="draft" className="rounded-lg">Draft</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6 space-y-6">
          {/* Filter Chips */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <Badge className="px-5 py-2 bg-primary text-primary-foreground rounded-full">
              ALL TYPES
            </Badge>
            <Badge variant="outline" className="px-5 py-2 rounded-full">
              SPRINT
            </Badge>
            <Badge variant="outline" className="px-5 py-2 rounded-full">
              RELEASE
            </Badge>
            <Badge variant="outline" className="px-5 py-2 rounded-full">
              REGRESSION
            </Badge>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left: Test Plan Details */}
            <div className="xl:col-span-2 bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-border">
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold">Execution Progress</span>
                    <span className="text-sm font-bold text-primary">65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
              </div>

              <div className="p-6">
                {/* AI Suggestion Banner */}
                <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 rounded-xl p-4 mb-6 flex gap-4">
                  <div className="w-10 h-10 shrink-0 bg-purple-600 rounded-lg flex items-center justify-center text-white">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-purple-700 dark:text-purple-300 font-bold text-sm">
                      AI Suggestion
                    </p>
                    <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                      Found 3 missing edge cases for User Story #102: "Guest Checkout".{" "}
                      <a className="underline font-semibold" href="#">
                        Click to generate.
                      </a>
                    </p>
                  </div>
                </div>

                {/* Story Distribution */}
                <div className="space-y-6">
                  <p className="text-sm font-bold">Story Distribution</p>
                  <div className="space-y-4">
                    {[
                      { id: "#102", name: "Guest Checkout", cases: 12, progress: 100, color: "bg-blue-400" },
                      { id: "#105", name: "PayPal Integration", cases: 24, progress: 50, color: "bg-indigo-500" },
                      { id: "#108", name: "Coupon Validation", cases: 12, progress: 40, color: "bg-cyan-400" }
                    ].map((story) => (
                      <div key={story.id}>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span>{story.id} {story.name}</span>
                          <span>{story.cases} cases</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full">
                          <div className={`h-full ${story.color} rounded-full`} style={{ width: `${story.progress}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <a
                className="block p-4 text-center text-primary text-sm font-bold border-t border-border hover:bg-accent transition-colors"
                href="#"
              >
                View All Stories
              </a>
            </div>

            {/* Right: Team & Stats */}
            <div className="space-y-6">
              {/* Assigned Teams */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-sm font-bold mb-4">Assigned Teams</h3>
                <div className="space-y-3">
                  {["QA Team", "Dev Team", "Product"].map((team) => (
                    <div key={team} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        {team[0]}
                      </div>
                      <span className="text-sm font-medium">{team}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Test Execution Stats */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-sm font-bold mb-4">Execution Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Passed</span>
                    </div>
                    <span className="text-sm font-bold">31</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm">Failed</span>
                    </div>
                    <span className="text-sm font-bold">5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">Pending</span>
                    </div>
                    <span className="text-sm font-bold">12</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
