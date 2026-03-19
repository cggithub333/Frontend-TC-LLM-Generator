"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  X,
  Plus,
  Loader2,
  FileText,
  BookOpen,
  LayoutTemplate,
  AlertTriangle,
} from "lucide-react";
import { useProjects } from "@/hooks/use-projects";
import { useTemplates } from "@/hooks/use-templates";
import { useGenerateAcceptanceCriteria } from "@/hooks/use-ai-generation";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────────────
interface CreateStoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateStory?: (story: StoryFormData) => void;
  defaultProjectId?: string;
  editStory?: {
    title: string;
    asA?: string;
    iWantTo?: string;
    soThat?: string;
    acceptanceCriteria?: { content: string }[];
  };
  isPending?: boolean;
}

interface AcceptanceCriterion {
  id: string;
  description: string;
}

export interface PendingBusinessRule {
  id: string;
  title: string;
  description: string;
  priority: number;
  source: string;
}

export interface StoryFormData {
  projectId: string;
  title: string;
  asA: string;
  iWantTo: string;
  soThat: string;
  acceptanceCriteria: AcceptanceCriterion[];
  pendingBusinessRules: PendingBusinessRule[];
  selectedTemplateId: string;
}

// ─── Priority helpers ──────────────────────────────────────
const PRIORITY_OPTIONS = [
  { value: 1, label: "Critical", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  { value: 2, label: "High", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  { value: 3, label: "Medium", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  { value: 4, label: "Low", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: 5, label: "Info", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
];

function getPriorityStyle(p: number) {
  return PRIORITY_OPTIONS.find((o) => o.value === p) ?? PRIORITY_OPTIONS[2];
}

// ─── Main Component ────────────────────────────────────────
export function CreateStoryModal({
  open,
  onOpenChange,
  onCreateStory,
  defaultProjectId,
  editStory,
  isPending = false,
}: CreateStoryModalProps) {
  const params = useParams();
  const projectId = (defaultProjectId ?? params.id) as string;

  const { data: projectsData } = useProjects({ size: 100 });
  const projects = projectsData?.items ?? [];

  const { data: templates } = useTemplates(projectId);
  const generateAcMutation = useGenerateAcceptanceCriteria();

  const isEditMode = !!editStory;

  // ── inline BR add-form state ──
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [ruleTitle, setRuleTitle] = useState("");
  const [ruleDesc, setRuleDesc] = useState("");
  const [rulePriority, setRulePriority] = useState(3);
  const [ruleSource, setRuleSource] = useState("");

  const getInitialFormData = (): StoryFormData => ({
    projectId: defaultProjectId ?? "",
    title: editStory?.title ?? "",
    asA: editStory?.asA ?? "",
    iWantTo: editStory?.iWantTo ?? "",
    soThat: editStory?.soThat ?? "",
    acceptanceCriteria: editStory?.acceptanceCriteria?.length
      ? editStory.acceptanceCriteria.map((ac, i) => ({
          id: String(i + 1),
          description: ac.content,
        }))
      : [{ id: "1", description: "" }],
    pendingBusinessRules: [],
    selectedTemplateId: "",
  });

  const [formData, setFormData] = useState<StoryFormData>(getInitialFormData());

  useEffect(() => {
    setFormData(getInitialFormData());
    setShowRuleForm(false);
    resetRuleForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editStory, open]);

  // Set default template when templates load
  useEffect(() => {
    if (templates && templates.length > 0 && !formData.selectedTemplateId) {
      const defaultTpl = templates.find((t) => t.isDefault);
      if (defaultTpl) {
        setFormData((prev) => ({ ...prev, selectedTemplateId: defaultTpl.testCaseTemplateId }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templates]);

  // ── AC helpers ──
  const addCriterion = () => {
    setFormData({
      ...formData,
      acceptanceCriteria: [
        ...formData.acceptanceCriteria,
        { id: crypto.randomUUID(), description: "" },
      ],
    });
  };
  const updateCriterion = (id: string, description: string) => {
    setFormData({
      ...formData,
      acceptanceCriteria: formData.acceptanceCriteria.map((c) =>
        c.id === id ? { ...c, description } : c,
      ),
    });
  };
  const removeCriterion = (id: string) => {
    if (formData.acceptanceCriteria.length > 1) {
      setFormData({
        ...formData,
        acceptanceCriteria: formData.acceptanceCriteria.filter((c) => c.id !== id),
      });
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Tab" && !e.shiftKey) {
      const idx = formData.acceptanceCriteria.findIndex((c) => c.id === id);
      if (idx === formData.acceptanceCriteria.length - 1) {
        e.preventDefault();
        addCriterion();
      }
    }
  };

  // ── BR helpers ──
  const resetRuleForm = () => {
    setRuleTitle("");
    setRuleDesc("");
    setRulePriority(3);
    setRuleSource("");
  };
  const addBusinessRule = () => {
    if (!ruleTitle.trim()) return;
    setFormData({
      ...formData,
      pendingBusinessRules: [
        ...formData.pendingBusinessRules,
        {
          id: crypto.randomUUID(),
          title: ruleTitle.trim(),
          description: ruleDesc.trim(),
          priority: rulePriority,
          source: ruleSource.trim(),
        },
      ],
    });
    resetRuleForm();
    setShowRuleForm(false);
  };
  const removeBusinessRule = (id: string) => {
    setFormData({
      ...formData,
      pendingBusinessRules: formData.pendingBusinessRules.filter((r) => r.id !== id),
    });
  };

  // ── Submit ──
  const handleSubmit = () => {
    if (!formData.projectId || !formData.title.trim()) return;
    if (onCreateStory) onCreateStory(formData);
    if (!isEditMode) setFormData(getInitialFormData());
    onOpenChange(false);
  };

  // Selected template detail
  const selectedTemplate = templates?.find(
    (t) => t.testCaseTemplateId === formData.selectedTemplateId,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-5xl max-h-[92vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditMode ? "Edit User Story" : "Create New User Story"}
          </DialogTitle>
        </DialogHeader>

        {/* ── TWO-COLUMN LAYOUT ── */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* ══════════════════════════════════════════════
                LEFT COLUMN — Story Details + Acceptance Criteria
               ══════════════════════════════════════════════ */}
            <div className="lg:col-span-3 space-y-5">
              {/* Section Header */}
              <div className="flex items-center gap-2 mb-1">
                <div className="size-6 rounded bg-primary/10 flex items-center justify-center">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Story Details
                </span>
              </div>

              {/* Project Selector */}
              {!isEditMode && !defaultProjectId && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Project <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={formData.projectId}
                    onValueChange={(v) => setFormData({ ...formData, projectId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project..." />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem key={p.projectId} value={p.projectId}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Title */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Title <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="e.g. View order history"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* User Role + Action/Goal in a row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    User Role
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground font-bold text-xs">
                      AS A...
                    </span>
                    <Input
                      className="pl-16 pt-2.5"
                      placeholder="e.g. returning customer"
                      value={formData.asA}
                      onChange={(e) => setFormData({ ...formData, asA: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Benefit / Value
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground font-bold text-xs">
                      SO THAT...
                    </span>
                    <Input
                      className="pl-20 pt-2.5"
                      placeholder="e.g. I can reorder easily"
                      value={formData.soThat}
                      onChange={(e) => setFormData({ ...formData, soThat: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Action / Goal — full width */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Action / Goal
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-muted-foreground font-bold text-xs">
                    I WANT TO...
                  </span>
                  <Textarea
                    className="pl-24 pt-3 min-h-[72px] resize-none"
                    placeholder="e.g. view my previous order history"
                    value={formData.iWantTo}
                    onChange={(e) => setFormData({ ...formData, iWantTo: e.target.value })}
                  />
                </div>
              </div>

              {/* ── Divider ── */}
              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Acceptance Criteria
                  </span>
                </div>
              </div>

              {/* ── Acceptance Criteria ── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-bold">Acceptance Criteria</label>
                  <Button type="button" variant="ghost" size="sm" onClick={addCriterion} className="gap-1 text-xs">
                    <Plus className="h-3 w-3" /> Add
                  </Button>
                </div>
                <div className="space-y-2 bg-muted/30 rounded-xl p-3 border">
                  {formData.acceptanceCriteria.map((criterion, index) => (
                    <div key={criterion.id} className="flex items-start gap-2 group">
                      <span className="mt-2.5 text-xs font-bold text-muted-foreground/50 tabular-nums w-4 text-right shrink-0">
                        {index + 1}
                      </span>
                      <Textarea
                        className="flex-1 bg-transparent border-0 border-b border-transparent focus:border-primary/30 rounded-none px-0 focus-visible:ring-0 min-h-[40px] resize-none transition-colors duration-150 text-sm"
                        rows={1}
                        placeholder={index === 0 ? "Type criterion... (Tab to add next)" : "Add another... (Tab to add next)"}
                        value={criterion.description}
                        onChange={(e) => updateCriterion(criterion.id, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, criterion.id)}
                      />
                      {formData.acceptanceCriteria.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCriterion(criterion.id)}
                          className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-destructive rounded hover:bg-destructive/10"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* AI Generate */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-3 gap-2 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-sm"
                  disabled={generateAcMutation.isPending || (!formData.title && !formData.iWantTo)}
                  onClick={() => {
                    generateAcMutation.mutate(
                      {
                        title: formData.title,
                        asA: formData.asA,
                        iWantTo: formData.iWantTo,
                        soThat: formData.soThat,
                        description: "",
                      },
                      {
                        onSuccess: (criteria) => {
                          const newCriteria = criteria.map((c) => ({
                            id: Math.random().toString(36).substring(2, 9),
                            description: c,
                          }));
                          setFormData((prev) => ({
                            ...prev,
                            acceptanceCriteria: newCriteria,
                          }));
                          toast.success(`AI generated ${criteria.length} acceptance criteria`);
                        },
                        onError: (error) => {
                          toast.error(error.message || "Failed to generate criteria");
                        },
                      }
                    );
                  }}
                >
                  {generateAcMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  {generateAcMutation.isPending ? "Generating..." : "Re-generate with AI"}
                </Button>
                <p className="text-center text-[10px] text-muted-foreground mt-1.5">
                  {generateAcMutation.isPending
                    ? "AI is analyzing your story... This may take 30-60s on first use."
                    : "AI will suggest criteria based on the story description above."}
                </p>
              </div>
            </div>

            {/* ══════════════════════════════════════════════
                RIGHT COLUMN — Business Rules + Template
               ══════════════════════════════════════════════ */}
            <div className="lg:col-span-2 space-y-5 lg:border-l lg:pl-6 border-border">
              {/* ── Business Rules Section ── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded bg-amber-500/10 flex items-center justify-center">
                      <BookOpen className="h-3.5 w-3.5 text-amber-500" />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Business Rules
                    </span>
                  </div>
                  {!isEditMode && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowRuleForm(!showRuleForm)}
                      className="gap-1 text-xs h-7"
                    >
                      <Plus className="h-3 w-3" />
                      Add Rule
                    </Button>
                  )}
                </div>

                {isEditMode ? (
                  <p className="text-xs text-muted-foreground italic">
                    Business rules can be managed from the Business Rules page.
                  </p>
                ) : (
                  <>
                    {/* Inline Add Rule Form */}
                    {showRuleForm && (
                      <div className="space-y-2 bg-muted/30 rounded-lg p-3 border mb-3">
                        <Input
                          placeholder="Rule title *"
                          value={ruleTitle}
                          onChange={(e) => setRuleTitle(e.target.value)}
                          className="text-sm h-8"
                        />
                        <Textarea
                          placeholder="Description (optional)"
                          value={ruleDesc}
                          onChange={(e) => setRuleDesc(e.target.value)}
                          className="min-h-[48px] resize-none text-sm"
                          rows={2}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Select
                            value={String(rulePriority)}
                            onValueChange={(v) => setRulePriority(Number(v))}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                              {PRIORITY_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={String(o.value)}>
                                  {o.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Source"
                            value={ruleSource}
                            onChange={(e) => setRuleSource(e.target.value)}
                            className="text-xs h-8"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => { setShowRuleForm(false); resetRuleForm(); }}
                            className="h-7 text-xs"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={addBusinessRule}
                            disabled={!ruleTitle.trim()}
                            className="h-7 text-xs"
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Pending Rules List */}
                    {formData.pendingBusinessRules.length > 0 ? (
                      <div className="space-y-2">
                        {formData.pendingBusinessRules.map((rule) => {
                          const pStyle = getPriorityStyle(rule.priority);
                          return (
                            <div
                              key={rule.id}
                              className="group bg-card border border-border rounded-lg p-2.5 relative"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{rule.title}</p>
                                  {rule.description && (
                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                      {rule.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <span
                                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${pStyle.color}`}
                                    >
                                      {pStyle.label}
                                    </span>
                                    {rule.source && (
                                      <span className="text-[10px] text-muted-foreground">
                                        {rule.source}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeBusinessRule(rule.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-destructive rounded hover:bg-destructive/10 shrink-0"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : !showRuleForm ? (
                      <div className="text-center py-6 border border-dashed border-border rounded-lg">
                        <AlertTriangle className="h-5 w-5 mx-auto text-muted-foreground/40 mb-2" />
                        <p className="text-xs text-muted-foreground">
                          No business rules yet
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          Rules help AI generate better test coverage
                        </p>
                      </div>
                    ) : null}
                  </>
                )}
              </div>

              {/* ── Divider ── */}
              <div className="border-t border-border" />

              {/* ── Template Section ── */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="size-6 rounded bg-violet-500/10 flex items-center justify-center">
                    <LayoutTemplate className="h-3.5 w-3.5 text-violet-500" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Test Template
                  </span>
                </div>

                <Select
                  value={formData.selectedTemplateId}
                  onValueChange={(v) =>
                    setFormData({ ...formData, selectedTemplateId: v })
                  }
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No template</SelectItem>
                    {templates?.map((t) => (
                      <SelectItem key={t.testCaseTemplateId} value={t.testCaseTemplateId}>
                        {t.name}
                        {t.isDefault && " (default)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Selected template fields preview */}
                {selectedTemplate && selectedTemplate.fields.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Template Fields
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTemplate.fields.map((f) => (
                        <span
                          key={f.templateFieldId}
                          className="inline-flex items-center px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[10px] font-medium"
                        >
                          {f.fieldLabel}
                          {f.isRequired && <span className="text-destructive ml-0.5">*</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-muted-foreground/60 mt-2">
                  Template defines the output format for generated test cases.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <DialogFooter className="border-t pt-4 bg-muted/30 -mx-6 -mb-6 px-6 pb-6 rounded-b-lg">
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-muted-foreground">
              {formData.pendingBusinessRules.length > 0 && (
                <span>{formData.pendingBusinessRules.length} rule(s) will be created</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.projectId || !formData.title.trim() || isPending}
                className="shadow-lg shadow-primary/25"
              >
                {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isPending
                  ? isEditMode
                    ? "Saving..."
                    : "Creating..."
                  : isEditMode
                    ? "Save Changes"
                    : "Create Story"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
