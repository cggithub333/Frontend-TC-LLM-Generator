"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  LayoutTemplate,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  GripVertical,
  Star,
  StarOff,
  AlertTriangle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  useTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  useReplaceTemplateFields,
} from "@/hooks/use-templates";
import type {
  TestCaseTemplate,
  CreateTemplateInput,
  FieldInput,
} from "@/types/template.types";

const FIELD_TYPES = ["text", "textarea", "number", "select", "checkbox", "date"];

// ──── Template Editor Modal ────
function TemplateEditorModal({
  open,
  template,
  onClose,
  onSave,
  onSaveFields,
  isPending,
}: {
  open: boolean;
  template?: TestCaseTemplate | null;
  onClose: () => void;
  onSave: (data: CreateTemplateInput) => void;
  onSaveFields: (templateId: string, fields: FieldInput[]) => void;
  isPending: boolean;
}) {
  const isEditing = !!template;
  const [name, setName] = useState(template?.name ?? "");
  const [description, setDescription] = useState(template?.description ?? "");
  const [isDefault, setIsDefault] = useState(template?.isDefault ?? false);
  const [fields, setFields] = useState<FieldInput[]>(
    template?.fields?.map((f) => ({
      fieldKey: f.fieldKey,
      fieldLabel: f.fieldLabel,
      fieldType: f.fieldType,
      isRequired: f.isRequired,
    })) ?? []
  );

  if (!open) return null;

  const addField = () => {
    setFields([
      ...fields,
      { fieldKey: "", fieldLabel: "", fieldType: "text", isRequired: false },
    ]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, update: Partial<FieldInput>) => {
    setFields(fields.map((f, i) => (i === index ? { ...f, ...update } : f)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isEditing) {
      onSaveFields(template.testCaseTemplateId, fields);
    } else {
      onSave({ name, description, isDefault, fields });
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-card border border-border rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 animate-in fade-in-0 zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5 text-primary" />
            {isEditing ? "Edit Template" : "New Template"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Template info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Name *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Functional Test Case"
                  required
                  disabled={isEditing}
                  autoFocus={!isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this template for?"
                  disabled={isEditing}
                />
              </div>
            </div>

            {!isEditing && (
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded border-input"
                />
                Set as default template for this project
              </label>
            )}

            {/* Fields editor */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold">Custom Fields</label>
                <Button type="button" variant="outline" size="sm" onClick={addField} className="gap-1.5 h-8 text-xs">
                  <Plus className="h-3 w-3" />
                  Add Field
                </Button>
              </div>

              {fields.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-lg">
                  No custom fields. Click &quot;Add Field&quot; to define template structure.
                </p>
              )}

              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2.5 rounded-lg border bg-muted/30"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab" />
                    <Input
                      value={field.fieldKey}
                      onChange={(e) =>
                        updateField(index, { fieldKey: e.target.value.replace(/\s/g, "_").toLowerCase() })
                      }
                      placeholder="field_key"
                      className="h-8 text-xs flex-1 max-w-[140px] font-mono"
                    />
                    <Input
                      value={field.fieldLabel}
                      onChange={(e) => updateField(index, { fieldLabel: e.target.value })}
                      placeholder="Label"
                      className="h-8 text-xs flex-1"
                    />
                    <select
                      value={field.fieldType}
                      onChange={(e) => updateField(index, { fieldType: e.target.value })}
                      className="h-8 text-xs rounded-md border bg-background px-2 w-24"
                    >
                      {FIELD_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <label className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={field.isRequired ?? false}
                        onChange={(e) => updateField(index, { isRequired: e.target.checked })}
                        className="rounded border-input"
                      />
                      Req
                    </label>
                    <button
                      type="button"
                      onClick={() => removeField(index)}
                      className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={!name.trim() || isPending} className="gap-2">
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEditing ? "Save Fields" : "Create Template"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// ──── Main Page ────
export default function TemplatesPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TestCaseTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TestCaseTemplate | null>(null);

  const { data: templates, isLoading } = useTemplates(projectId);
  const createTemplate = useCreateTemplate(projectId);
  const updateTemplate = useUpdateTemplate(projectId);
  const deleteTemplate = useDeleteTemplate(projectId);
  const replaceFields = useReplaceTemplateFields(projectId);

  const handleCreate = async (input: CreateTemplateInput) => {
    try {
      await createTemplate.mutateAsync(input);
      toast.success("Template created");
      setModalOpen(false);
    } catch {
      toast.error("Failed to create template");
    }
  };

  const handleSaveFields = async (templateId: string, fields: FieldInput[]) => {
    try {
      await replaceFields.mutateAsync({ templateId, fields });
      toast.success("Fields updated");
      setModalOpen(false);
      setEditingTemplate(null);
    } catch {
      toast.error("Failed to update fields");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTemplate.mutateAsync(deleteTarget.testCaseTemplateId);
      toast.success("Template deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Cannot delete default template");
    }
  };

  const toggleDefault = async (template: TestCaseTemplate) => {
    try {
      await updateTemplate.mutateAsync({
        id: template.testCaseTemplateId,
        isDefault: !template.isDefault,
      });
      toast.success(template.isDefault ? "Removed as default" : "Set as default");
    } catch {
      toast.error("Failed to update");
    }
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Test Case Templates</h1>
          <p className="text-muted-foreground mt-1">
            Define custom structures for test cases with reusable field layouts
          </p>
        </div>
        <Button
          onClick={() => { setEditingTemplate(null); setModalOpen(true); }}
          className="gap-2 shadow-lg shadow-primary/20"
        >
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && (!templates || templates.length === 0) && (
        <div className="text-center py-20 space-y-4">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <LayoutTemplate className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold">No templates yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Templates define the structure of test cases, including custom fields like test data, environment, and priority.
          </p>
          <Button onClick={() => setModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create your first template
          </Button>
        </div>
      )}

      {/* Template Cards */}
      {!isLoading && templates && templates.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <div
              key={template.testCaseTemplateId}
              className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold truncate">{template.name}</h3>
                    {template.isDefault && (
                      <Badge variant="outline" className="bg-primary/10 text-primary text-[10px] shrink-0">
                        Default
                      </Badge>
                    )}
                  </div>
                  {template.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {template.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Fields summary */}
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {template.fields?.length ?? 0} custom fields
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(template.fields ?? []).slice(0, 5).map((f) => (
                    <Badge key={f.templateFieldId} variant="secondary" className="text-[10px] font-normal">
                      {f.fieldLabel}
                      {f.isRequired && <span className="text-destructive ml-0.5">*</span>}
                    </Badge>
                  ))}
                  {(template.fields?.length ?? 0) > 5 && (
                    <Badge variant="secondary" className="text-[10px] font-normal">
                      +{template.fields.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => toggleDefault(template)}
                  className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground"
                  title={template.isDefault ? "Remove default" : "Set as default"}
                >
                  {template.isDefault ? (
                    <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                  ) : (
                    <StarOff className="h-3.5 w-3.5" />
                  )}
                </button>
                <button
                  onClick={() => { setEditingTemplate(template); setModalOpen(true); }}
                  className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                {!template.isDefault && (
                  <button
                    onClick={() => setDeleteTarget(template)}
                    className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      <TemplateEditorModal
        open={modalOpen}
        template={editingTemplate}
        onClose={() => { setModalOpen(false); setEditingTemplate(null); }}
        onSave={handleCreate}
        onSaveFields={handleSaveFields}
        isPending={createTemplate.isPending || replaceFields.isPending}
      />

      {/* Delete Confirm */}
      {deleteTarget && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setDeleteTarget(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-destructive/30 rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in-0 zoom-in-95 duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-full bg-destructive/10">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Delete Template</h3>
                  <p className="text-sm text-muted-foreground">This will also delete all fields</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-5">
                Delete <strong className="text-foreground">{deleteTarget.name}</strong> and its {deleteTarget.fields?.length ?? 0} fields?
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleteTemplate.isPending}>Cancel</Button>
                <Button variant="destructive" onClick={handleDelete} disabled={deleteTemplate.isPending} className="gap-2">
                  {deleteTemplate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
