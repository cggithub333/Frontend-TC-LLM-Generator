"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import {
  useBusinessRules,
  useCreateBusinessRule,
  useUpdateBusinessRule,
  useDeleteBusinessRule,
} from "@/hooks/use-business-rules";
import type {
  BusinessRule,
  CreateBusinessRuleInput,
  UpdateBusinessRuleInput,
} from "@/types/business-rule.types";

const PRIORITY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Critical", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  2: { label: "High", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  3: { label: "Medium", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  4: { label: "Low", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
};

function getPriority(priority: number) {
  return PRIORITY_LABELS[priority] ?? { label: `P${priority}`, color: "bg-muted text-muted-foreground" };
}

// ──── Create/Edit Modal ────
function BusinessRuleModal({
  open,
  rule,
  onClose,
  onSave,
  isPending,
}: {
  open: boolean;
  rule?: BusinessRule | null;
  onClose: () => void;
  onSave: (data: CreateBusinessRuleInput | (UpdateBusinessRuleInput & { id: string })) => void;
  isPending: boolean;
}) {
  const [title, setTitle] = useState(rule?.title ?? "");
  const [description, setDescription] = useState(rule?.description ?? "");
  const [priority, setPriority] = useState(rule?.priority ?? 3);
  const [source, setSource] = useState(rule?.source ?? "");

  if (!open) return null;

  const isEditing = !!rule;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (isEditing) {
      onSave({ id: rule.businessRuleId, title, description, priority, source });
    } else {
      onSave({ title, description, priority, source });
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-card border border-border rounded-xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in-0 zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {isEditing ? "Edit Business Rule" : "New Business Rule"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Title *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Withdrawal limit is $500/day"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed explanation of this business rule..."
                rows={3}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value={1}>Critical</option>
                  <option value={2}>High</option>
                  <option value={3}>Medium</option>
                  <option value={4}>Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Source</label>
                <Input
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g. Product Owner, SRS"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={!title.trim() || isPending} className="gap-2">
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEditing ? "Save Changes" : "Create Rule"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// ──── Delete Confirm Modal ────
function DeleteConfirmModal({
  open,
  ruleName,
  onConfirm,
  onCancel,
  isPending,
}: {
  open: boolean;
  ruleName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-card border border-destructive/30 rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in-0 zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Delete Business Rule</h3>
              <p className="text-sm text-muted-foreground">This action cannot be undone</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-5">
            Are you sure you want to delete <strong className="text-foreground">{ruleName}</strong>?
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onCancel} disabled={isPending}>Cancel</Button>
            <Button variant="destructive" onClick={onConfirm} disabled={isPending} className="gap-2">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// ──── Main Page ────
export default function BusinessRulesPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<BusinessRule | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BusinessRule | null>(null);

  const { data, isLoading } = useBusinessRules(projectId, { size: 100 });
  const createRule = useCreateBusinessRule(projectId);
  const updateRule = useUpdateBusinessRule(projectId);
  const deleteRule = useDeleteBusinessRule(projectId);

  const rules = data?.items ?? [];
  const filtered = rules.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (input: CreateBusinessRuleInput | (UpdateBusinessRuleInput & { id: string })) => {
    try {
      if ("id" in input) {
        await updateRule.mutateAsync(input);
        toast.success("Business rule updated");
      } else {
        await createRule.mutateAsync(input);
        toast.success("Business rule created");
      }
      setModalOpen(false);
      setEditingRule(null);
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRule.mutateAsync(deleteTarget.businessRuleId);
      toast.success("Business rule deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Business Rules</h1>
          <p className="text-muted-foreground mt-1">
            Define business constraints and rules for AI-powered test case generation
          </p>
        </div>
        <Button
          onClick={() => { setEditingRule(null); setModalOpen(true); }}
          className="gap-2 shadow-lg shadow-primary/20"
        >
          <Plus className="h-4 w-4" />
          Add Rule
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search business rules..."
          className="pl-10"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-20 space-y-4">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold">No business rules yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Business rules define constraints that AI uses to generate more accurate and relevant test cases.
          </p>
          <Button onClick={() => { setEditingRule(null); setModalOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" />
            Create your first rule
          </Button>
        </div>
      )}

      {/* Table */}
      {!isLoading && filtered.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground w-28">Priority</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground w-32">Source</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground w-40">Story</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((rule) => {
                const p = getPriority(rule.priority);
                return (
                  <tr
                    key={rule.businessRuleId}
                    className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium">{rule.title}</p>
                      {rule.description && (
                        <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">
                          {rule.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-xs ${p.color}`}>
                        {p.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {rule.source || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {rule.userStoryTitle ? (
                        <span className="inline-flex items-center gap-1 text-xs text-primary">
                          <FileText className="h-3 w-3" />
                          {rule.userStoryTitle}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditingRule(rule); setModalOpen(true); }}
                          className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(rule)}
                          className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <BusinessRuleModal
        open={modalOpen}
        rule={editingRule}
        onClose={() => { setModalOpen(false); setEditingRule(null); }}
        onSave={handleSave}
        isPending={createRule.isPending || updateRule.isPending}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        open={!!deleteTarget}
        ruleName={deleteTarget?.title ?? ""}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isPending={deleteRule.isPending}
      />
    </div>
  );
}
