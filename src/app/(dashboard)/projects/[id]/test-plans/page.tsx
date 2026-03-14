"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Plus,
  ClipboardList,
  Search,
  X,
  Loader2,
  AlertCircle,
  Folder,
  Calendar,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  useTestPlansByProject,
  useTestSuitesInPlan,
  useAttachSuiteToPlan,
  useDetachSuiteFromPlan,
} from "@/hooks/use-test-plans";
import { CreateTestPlanDialog } from "@/components/features/test-plans/create-test-plan-dialog";
import { useTestSuitesByProject } from "@/hooks/use-test-suites";
import { toast } from "sonner";
import type { TestSuite } from "@/types/test-suite.types";
import type { TestPlanStatus } from "@/types/test-plan.types";

// ──────── Status Badge ────────
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    DRAFT: {
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-600 dark:text-slate-300",
      label: "Draft",
    },
    IN_PROGRESS: {
      bg: "bg-blue-50 dark:bg-blue-900/30",
      text: "text-blue-700 dark:text-blue-300",
      label: "In Progress",
    },
    COMPLETED: {
      bg: "bg-green-50 dark:bg-green-900/30",
      text: "text-green-700 dark:text-green-300",
      label: "Completed",
    },
  };
  const s = config[status] ?? config.DRAFT;
  return (
    <Badge
      className={cn(s.bg, s.text, "border-0 font-bold text-[10px] px-2 py-0.5")}
    >
      {s.label}
    </Badge>
  );
}

// ──────── Import Suites Drawer ────────
function ImportSuitesDrawer({
  open,
  onClose,
  planId,
  projectId,
  existingSuiteIds,
}: {
  open: boolean;
  onClose: () => void;
  planId: string;
  projectId: string;
  existingSuiteIds: Set<string>;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { data: allSuites, isLoading } = useTestSuitesByProject(projectId, {
    size: 100,
  });
  const attachSuite = useAttachSuiteToPlan();

  const availableSuites = useMemo(() => {
    const suites = allSuites?.items ?? [];
    return suites.filter(
      (s) =>
        !existingSuiteIds.has(s.testSuiteId) &&
        (search === "" ||
          s.name.toLowerCase().includes(search.toLowerCase()))
    );
  }, [allSuites, existingSuiteIds, search]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleImport = async () => {
    try {
      for (const testSuiteId of selected) {
        await attachSuite.mutateAsync({ planId, testSuiteId });
      }
      toast.success(`Imported ${selected.size} suite(s)`);
      setSelected(new Set());
      onClose();
    } catch {
      toast.error("Failed to import suites");
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-card border-l border-border z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h3 className="text-lg font-bold">Import Test Suites</h3>
            <p className="text-sm text-muted-foreground">
              Add test suites to this plan
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search suites..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : availableSuites.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Folder className="h-8 w-8 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No suites available</p>
              <p className="text-sm mt-1">
                All suites are already in this plan, or none exist yet.
              </p>
            </div>
          ) : (
            availableSuites.map((suite) => (
              <label
                key={suite.testSuiteId}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                  selected.has(suite.testSuiteId)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                )}
              >
                <input
                  type="checkbox"
                  checked={selected.has(suite.testSuiteId)}
                  onChange={() => toggleSelect(suite.testSuiteId)}
                  className="mt-0.5 rounded border-border"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{suite.name}</p>
                  {suite.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {suite.description}
                    </p>
                  )}
                </div>
              </label>
            ))
          )}
        </div>

        <div className="p-4 border-t flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {selected.size} suite(s) selected
          </p>
          <Button
            onClick={handleImport}
            disabled={selected.size === 0 || attachSuite.isPending}
            className="gap-2"
          >
            {attachSuite.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Import to Plan
          </Button>
        </div>
      </div>
    </>
  );
}

// ──────── Main Page ────────
export default function ProjectTestPlansPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data, isLoading, error } = useTestPlansByProject(projectId, {
    size: 50,
  });
  const plans = data?.items ?? [];

  const selectedPlan = plans.find((p) => p.testPlanId === selectedPlanId);

  const { data: planSuitesRaw, isLoading: suitesLoading } =
    useTestSuitesInPlan(selectedPlanId ?? "");
  const planSuites: TestSuite[] = useMemo(() => {
    if (!planSuitesRaw) return [];
    if (Array.isArray(planSuitesRaw)) return planSuitesRaw;
    if ((planSuitesRaw as any).items) return (planSuitesRaw as any).items;
    return [];
  }, [planSuitesRaw]);

  const existingSuiteIds = useMemo(
    () => new Set(planSuites.map((s) => s.testSuiteId)),
    [planSuites]
  );

  const detachSuite = useDetachSuiteFromPlan();

  const handleRemoveSuite = async (testSuiteId: string) => {
    if (!selectedPlanId) return;
    try {
      await detachSuite.mutateAsync({ planId: selectedPlanId, testSuiteId });
      toast.success("Suite removed from plan");
    } catch {
      toast.error("Failed to remove suite");
    }
  };

  // Auto-select first plan
  if (plans.length > 0 && !selectedPlanId && !isLoading) {
    setSelectedPlanId(plans[0].testPlanId);
  }

  return (
    <div className="flex h-[calc(100vh-0px)]">
      {/* ─── Left Pane: Plan List (30%) ─── */}
      <div className="w-[300px] shrink-0 border-r border-border flex flex-col bg-card/50">
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-lg font-bold">Test Plans</h1>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <AlertCircle className="h-8 w-8 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Failed to load
              </p>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-10 px-4">
              <ClipboardList className="h-8 w-8 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground mb-1">
                No test plans yet
              </p>
              <p className="text-xs text-muted-foreground/70 mb-3">
                Create your first test plan
              </p>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                New Plan
              </Button>
            </div>
          ) : (
            plans.map((plan) => {
              const isActive = plan.testPlanId === selectedPlanId;
              return (
                <button
                  key={plan.testPlanId}
                  onClick={() => setSelectedPlanId(plan.testPlanId)}
                  className={cn(
                    "w-full flex flex-col gap-1.5 px-3 py-2.5 rounded-xl text-left transition-all",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-accent"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <StatusBadge status={plan.status} />
                    <span className="text-sm font-medium truncate flex-1">
                      {plan.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(plan.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ─── Right Pane: Plan Detail (70%) ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selectedPlan ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <ClipboardList className="h-12 w-12 mb-4 opacity-30" />
            <p className="text-lg font-semibold">
              {plans.length === 0
                ? "Create your first test plan"
                : "Select a plan"}
            </p>
            <p className="text-sm mt-1">
              {plans.length === 0
                ? "Organize test suites into execution campaigns"
                : "Choose a plan from the left to view details"}
            </p>
          </div>
        ) : (
          <>
            {/* Detail Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold">{selectedPlan.name}</h2>
                  <StatusBadge status={selectedPlan.status} />
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    {selectedPlan.createdByUserFullName}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(selectedPlan.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {selectedPlan.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {selectedPlan.description}
                  </p>
                )}
              </div>
              <Button
                onClick={() => setDrawerOpen(true)}
                className="gap-2 shadow-md shadow-primary/20"
              >
                <Plus className="h-4 w-4" />
                Import Test Suites
              </Button>
            </div>

            {/* Suites Table */}
            <div className="flex-1 overflow-y-auto">
              {suitesLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : planSuites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <Folder className="h-12 w-12 mb-4 opacity-30" />
                  <p className="text-lg font-semibold">No suites attached</p>
                  <p className="text-sm mt-1 mb-4">
                    Import test suites to build your execution campaign
                  </p>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => setDrawerOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Import Test Suites
                  </Button>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-muted/50 text-xs text-muted-foreground uppercase font-medium border-b">
                      <th className="px-6 py-3 font-semibold">Suite Name</th>
                      <th className="px-6 py-3 font-semibold">Description</th>
                      <th className="px-6 py-3 font-semibold">Created</th>
                      <th className="px-6 py-3 font-semibold w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y">
                    {planSuites.map((suite: TestSuite) => (
                      <tr
                        key={suite.testSuiteId}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-3.5 font-medium">
                          <div className="flex items-center gap-2">
                            <Folder className="h-4 w-4 text-muted-foreground" />
                            {suite.name}
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-muted-foreground">
                          {suite.description ?? "—"}
                        </td>
                        <td className="px-6 py-3.5 text-muted-foreground">
                          {new Date(suite.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-3.5">
                          <button
                            onClick={() =>
                              handleRemoveSuite(suite.testSuiteId)
                            }
                            className="text-xs text-destructive hover:underline"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>

      {/* ─── Import Suites Drawer ─── */}
      <ImportSuitesDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        planId={selectedPlanId ?? ""}
        projectId={projectId}
        existingSuiteIds={existingSuiteIds}
      />

      {/* ─── Create Plan Dialog ─── */}
      <CreateTestPlanDialog
        projectId={projectId}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  );
}
