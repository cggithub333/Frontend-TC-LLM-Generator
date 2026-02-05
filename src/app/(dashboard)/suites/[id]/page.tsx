"use client";

import { useState, useMemo, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Edit,
  Play,
  Trash2,
  Copy,
  FolderInput,
  ChevronRight,
  ChevronLeft,
  ListChecks,
  Target,
  Clock,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useTestSuite } from "@/hooks/use-test-suites";
import { useTestCases } from "@/hooks/use-test-cases";
import { cn } from "@/lib/utils";

interface TestCaseWithSuite {
  id: string;
  storyId: string;
  testPlanId: string;
  title: string;
  type: string;
  priority: string;
  status: string;
  preconditions: string[];
  steps: Array<{ step: number; action: string; expected: string }>;
  testData: Record<string, string | number | boolean>;
  assignedTo: string;
  executedBy: string | null;
  executedAt: string | null;
  suiteId: string;
}

export default function SuiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: suite, isLoading: isSuiteLoading } = useTestSuite(id);
  const { data: allTestCases = [], isLoading: isTestCasesLoading } = useTestCases(id);

  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter test cases
  const filteredTestCases = useMemo(() => {
    return allTestCases.filter((testCase: TestCaseWithSuite) => {
      const matchesSearch = testCase.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || testCase.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || testCase.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [allTestCases, searchQuery, statusFilter, priorityFilter]);

  // Paginate test cases
  const paginatedTestCases = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTestCases.slice(startIndex, endIndex);
  }, [filteredTestCases, currentPage]);

  const totalPages = Math.ceil(filteredTestCases.length / itemsPerPage);

  // Calculate stats
  const stats = useMemo(() => {
    const total = allTestCases.length;
    const passed = allTestCases.filter((tc: TestCaseWithSuite) => tc.status === "Passed").length;
    const successRate = total > 0 ? Math.round((passed / total) * 100) : 0;

    return {
      totalCases: total,
      coverage: 98, // This would come from backend in real scenario
      lastRun: "2h ago", // This would come from backend
      lastRunBy: "Alex",
      successRate,
    };
  }, [allTestCases]);

  const toggleTest = (id: string) => {
    setSelectedTests((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedTests.length === paginatedTestCases.length) {
      setSelectedTests([]);
    } else {
      setSelectedTests(paginatedTestCases.map((tc: TestCaseWithSuite) => tc.id));
    }
  };

  const getTimeAgo = (date: string | null) => {
    if (!date) return "Never";
    const now = new Date();
    const executed = new Date(date);
    const diffMs = now.getTime() - executed.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (isSuiteLoading || isTestCasesLoading) {
    return (
      <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!suite) {
    return (
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Test suite not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/suites" className="hover:text-primary transition-colors">
          Test Suites
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-semibold text-foreground">{suite.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">{suite.name}</h1>
          <Badge className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900">
            Active
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Suite
          </Button>
          <Button className="gap-2 bg-primary shadow-lg shadow-primary/20">
            <Play className="h-4 w-4" />
            Run Suite
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg text-primary">
              <ListChecks className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Total Cases</span>
          </div>
          <p className="text-2xl font-bold">
            {stats.totalCases} <span className="text-sm font-normal text-muted-foreground">Test Cases</span>
          </p>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-50 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600 dark:text-purple-400">
              <Target className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Coverage</span>
          </div>
          <p className="text-2xl font-bold">
            {stats.coverage}% <span className="text-sm font-normal text-muted-foreground">of reqs</span>
          </p>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-amber-50 dark:bg-amber-900/30 p-2 rounded-lg text-amber-600 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Last Run</span>
          </div>
          <p className="text-2xl font-bold">
            {stats.lastRun} <span className="text-sm font-normal text-muted-foreground">by {stats.lastRunBy}</span>
          </p>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-50 dark:bg-green-900/30 p-2 rounded-lg text-green-600 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Success Rate</span>
          </div>
          <p className="text-2xl font-bold">
            {stats.successRate}% <span className="text-sm font-normal text-muted-foreground">last run</span>
          </p>
        </div>
      </div>

      {/* Test Cases Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Search and Filters */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search test cases..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Passed">Passed</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bulk Actions Toolbar */}
        {selectedTests.length > 0 && (
          <div className="sticky top-0 z-10 bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-sm px-6 py-3 border-b border-blue-100 dark:border-blue-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selectedTests.length === paginatedTestCases.length}
                onCheckedChange={toggleAll}
              />
              <span className="text-sm font-bold text-primary">
                {selectedTests.length} item{selectedTests.length > 1 ? "s" : ""} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1 text-xs font-bold">
                <FolderInput className="h-4 w-4" />
                Move
              </Button>
              <Button variant="outline" size="sm" className="gap-1 text-xs font-bold">
                <Copy className="h-4 w-4" />
                Duplicate
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="gap-1 text-xs font-bold"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      paginatedTestCases.length > 0 &&
                      selectedTests.length === paginatedTestCases.length
                    }
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                  ID
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground w-1/3">
                  Test Case Name
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                  Priority
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="text-right font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTestCases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No test cases found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTestCases.map((testCase: TestCaseWithSuite) => (
                  <TableRow
                    key={testCase.id}
                    className={cn(
                      "hover:bg-muted/50 transition-colors group",
                      selectedTests.includes(testCase.id) && "bg-primary/5"
                    )}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedTests.includes(testCase.id)}
                        onCheckedChange={() => toggleTest(testCase.id)}
                      />
                    </TableCell>
                    <TableCell className="text-sm font-medium text-muted-foreground">
                      {testCase.id}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-sm">{testCase.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Updated {getTimeAgo(testCase.executedAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs font-medium",
                          testCase.priority === "High" &&
                            "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900",
                          testCase.priority === "Medium" &&
                            "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900",
                          testCase.priority === "Low" &&
                            "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900"
                        )}
                      >
                        {testCase.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs font-medium",
                          testCase.status === "Passed" &&
                            "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900",
                          testCase.status === "Failed" &&
                            "bg-destructive/10 text-destructive border-destructive/20",
                          testCase.status === "Active" &&
                            "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900",
                          testCase.status === "Draft" &&
                            "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                        )}
                      >
                        {testCase.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/30"
                          title="Run"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-red-50 dark:hover:bg-red-900/30"
                          title="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="bg-muted/50 px-6 py-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {filteredTestCases.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-medium text-foreground">
              {Math.min(currentPage * itemsPerPage, filteredTestCases.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">{filteredTestCases.length}</span>{" "}
            results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
