"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LayoutTemplate } from "lucide-react";
import type { UserStory } from "@/types/story.types";
import type { TestCase } from "@/types/test-case.types";
import type { TestCaseTemplate, TemplateField } from "@/types/template.types";
import { useCreateTestCase, useUpdateTestCase } from "@/hooks/use-test-cases";
import { useTemplates } from "@/hooks/use-templates";
import { toast } from "sonner";

interface CreateManualTestCaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userStory: UserStory | null;
  projectId?: string;
  defaultAcId?: string | null;
  editTestCase?: TestCase | null;
  onSuccess?: (createdTestCase?: TestCase) => void;
}

export function CreateManualTestCaseDialog({
  open,
  onOpenChange,
  userStory,
  projectId,
  defaultAcId,
  editTestCase,
  onSuccess,
}: CreateManualTestCaseDialogProps) {
  const { mutateAsync: createTestCase, isPending: isCreating } = useCreateTestCase();
  const { mutateAsync: updateTestCase, isPending: isUpdating } = useUpdateTestCase();
  const isPending = isCreating || isUpdating;
  const isEditMode = !!editTestCase;

  // Fetch templates for the project
  const { data: templates } = useTemplates(projectId ?? "");
  const templatesWithFields = (templates ?? []).filter(
    (t) => t.fields && t.fields.length > 0
  );

  // Form State
  const [selectedAcId, setSelectedAcId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [preconditions, setPreconditions] = useState("");
  const [steps, setSteps] = useState("");
  const [expectedResult, setExpectedResult] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [customFields, setCustomFields] = useState<Record<string, string>>({});

  // Get selected template
  const selectedTemplate = templatesWithFields.find(
    (t) => t.testCaseTemplateId === selectedTemplateId
  );

  useEffect(() => {
    if (open) {
      if (editTestCase) {
        setTitle(editTestCase.title);
        setPreconditions(editTestCase.preconditions || "");
        setSteps(editTestCase.steps || "");
        setExpectedResult(editTestCase.expectedResult || "");
        if (editTestCase.acceptanceCriteriaId) {
          setSelectedAcId(editTestCase.acceptanceCriteriaId);
        }
        // Restore custom fields from JSON
        if (editTestCase.customFieldsJson) {
          try {
            const parsed = JSON.parse(editTestCase.customFieldsJson);
            if (parsed.templateId) setSelectedTemplateId(parsed.templateId);
            if (parsed.fields) setCustomFields(parsed.fields);
          } catch {
            setCustomFields({});
          }
        }
      } else {
        resetForm();
        if (defaultAcId) {
          setSelectedAcId(defaultAcId);
        } else if (userStory?.acceptanceCriteria?.length) {
          setSelectedAcId(userStory.acceptanceCriteria[0].acceptanceCriteriaId);
        }
        // Auto-select default template if one exists
        const defaultTemplate = templatesWithFields.find((t) => t.isDefault);
        if (defaultTemplate) {
          setSelectedTemplateId(defaultTemplate.testCaseTemplateId);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultAcId, userStory, editTestCase]);

  const resetForm = () => {
    setTitle("");
    setPreconditions("");
    setSteps("");
    setExpectedResult("");
    setSelectedTemplateId("");
    setCustomFields({});
  };

  const handleTemplateChange = (templateId: string) => {
    if (templateId === "__none__") {
      setSelectedTemplateId("");
      setCustomFields({});
      return;
    }
    setSelectedTemplateId(templateId);
    // Reset custom fields when switching template
    setCustomFields({});
  };

  const updateCustomField = (fieldKey: string, value: string) => {
    setCustomFields((prev) => ({ ...prev, [fieldKey]: value }));
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const buildCustomFieldsJson = (): string => {
    if (!selectedTemplate) return "{}";
    return JSON.stringify({
      templateId: selectedTemplate.testCaseTemplateId,
      templateName: selectedTemplate.name,
      fields: customFields,
    });
  };

  const handleSave = async (closeAfterSave: boolean) => {
    if (!title.trim() || !selectedAcId) return;

    // Validate required custom fields
    if (selectedTemplate) {
      const missingRequired = selectedTemplate.fields
        .filter((f) => f.isRequired && !customFields[f.fieldKey]?.trim())
        .map((f) => f.fieldLabel);
      if (missingRequired.length > 0) {
        toast.error(`Please fill required fields: ${missingRequired.join(", ")}`);
        return;
      }
    }

    try {
      let result: TestCase | undefined;
      if (isEditMode && editTestCase) {
        await updateTestCase({
          id: editTestCase.testCaseId,
          title,
          preconditions,
          steps,
          expectedResult,
          customFieldsJson: buildCustomFieldsJson(),
        });
      } else {
        result = await createTestCase({
          userStoryId: userStory?.userStoryId,
          acceptanceCriteriaId: selectedAcId,
          title,
          preconditions,
          steps,
          expectedResult,
          customFieldsJson: buildCustomFieldsJson(),
          generatedByAi: false,
        });
      }

      if (closeAfterSave) {
        handleClose();
      } else {
        resetForm();
        // Re-select default template
        const defaultTemplate = templatesWithFields.find((t) => t.isDefault);
        if (defaultTemplate) {
          setSelectedTemplateId(defaultTemplate.testCaseTemplateId);
        }
      }

      onSuccess?.(result);
      if (!onSuccess) {
        toast.success(isEditMode ? "Test case updated successfully" : "Test case created successfully");
      }
    } catch {
      toast.error(isEditMode ? "Failed to update test case" : "Failed to create test case");
    }
  };

  if (!userStory) return null;

  const renderCustomField = (field: TemplateField) => {
    const value = customFields[field.fieldKey] ?? "";
    const id = `custom-${field.fieldKey}`;

    return (
      <div key={field.fieldKey} className="space-y-1.5">
        <Label htmlFor={id} className="text-sm flex items-center gap-1.5">
          {field.fieldLabel}
          {field.isRequired && <span className="text-destructive">*</span>}
          <Badge variant="outline" className="text-[9px] px-1 py-0 font-normal text-muted-foreground">
            {field.fieldType}
          </Badge>
        </Label>
        {field.fieldType === "textarea" ? (
          <Textarea
            id={id}
            placeholder={`Enter ${field.fieldLabel.toLowerCase()}...`}
            value={value}
            onChange={(e) => updateCustomField(field.fieldKey, e.target.value)}
            className="resize-none"
            rows={3}
          />
        ) : field.fieldType === "checkbox" ? (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value === "true"}
              onChange={(e) =>
                updateCustomField(field.fieldKey, e.target.checked ? "true" : "false")
              }
              className="rounded border-input"
            />
            <span className="text-sm text-muted-foreground">
              {field.fieldLabel}
            </span>
          </label>
        ) : field.fieldType === "number" ? (
          <Input
            id={id}
            type="number"
            placeholder={`Enter ${field.fieldLabel.toLowerCase()}...`}
            value={value}
            onChange={(e) => updateCustomField(field.fieldKey, e.target.value)}
          />
        ) : field.fieldType === "date" ? (
          <Input
            id={id}
            type="date"
            value={value}
            onChange={(e) => updateCustomField(field.fieldKey, e.target.value)}
          />
        ) : (
          <Input
            id={id}
            placeholder={`Enter ${field.fieldLabel.toLowerCase()}...`}
            value={value}
            onChange={(e) => updateCustomField(field.fieldKey, e.target.value)}
          />
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Test Case" : "Create Test Case"}</DialogTitle>
          <DialogDescription>
            User Story: {userStory.title}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Acceptance Criteria */}
          <div className="space-y-2">
            <Label htmlFor="acceptanceCriteria">Acceptance Criteria *</Label>
            <Select value={selectedAcId} onValueChange={setSelectedAcId}>
              <SelectTrigger id="acceptanceCriteria" className="w-full truncate">
                <SelectValue placeholder="Select Acceptance Criteria" />
              </SelectTrigger>
              <SelectContent className="max-w-[calc(100vw-4rem)]">
                {userStory.acceptanceCriteria?.map((ac) => (
                  <SelectItem
                    key={ac.acceptanceCriteriaId}
                    value={ac.acceptanceCriteriaId}
                    className="max-w-full"
                  >
                    <span className="line-clamp-2 break-words whitespace-normal">
                      {ac.content}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Template Selector */}
          {templatesWithFields.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="template" className="flex items-center gap-2">
                <LayoutTemplate className="h-4 w-4 text-primary" />
                Template
                <span className="text-xs text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Select value={selectedTemplateId || "__none__"} onValueChange={handleTemplateChange}>
                <SelectTrigger id="template" className="w-full">
                  <SelectValue placeholder="No template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No template</SelectItem>
                  {templatesWithFields.map((t) => (
                    <SelectItem key={t.testCaseTemplateId} value={t.testCaseTemplateId}>
                      <span className="flex items-center gap-2">
                        {t.name}
                        {t.isDefault && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0">
                            Default
                          </Badge>
                        )}
                        <span className="text-muted-foreground text-xs">
                          ({t.fields.length} fields)
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Standard fields */}
          <div className="space-y-2">
            <Label htmlFor="title">Test Case Title *</Label>
            <Input
              id="title"
              placeholder="e.g. Verify user can login with valid credentials"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preconditions">Preconditions</Label>
            <Textarea
              id="preconditions"
              placeholder="Conditions that must be met before executing the test case"
              value={preconditions}
              onChange={(e) => setPreconditions(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="steps">Steps</Label>
            <Textarea
              id="steps"
              placeholder={"Step 1: ...\nStep 2: ..."}
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              className="resize-none"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedResult">Expected Result</Label>
            <Textarea
              id="expectedResult"
              placeholder="The expected outcome after executing the steps"
              value={expectedResult}
              onChange={(e) => setExpectedResult(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Custom Fields from Template */}
          {selectedTemplate && selectedTemplate.fields.length > 0 && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center gap-2">
                <LayoutTemplate className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold">
                  Custom Fields
                </span>
                <Badge variant="secondary" className="text-[10px]">
                  {selectedTemplate.name}
                </Badge>
              </div>
              {selectedTemplate.fields
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map(renderCustomField)}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0 border-t pt-4 shrink-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <div className="flex gap-2">
            {!isEditMode && (
              <Button
                variant="secondary"
                onClick={() => handleSave(false)}
                disabled={!title.trim() || !selectedAcId || isPending}
              >
                Save &amp; Add Another
              </Button>
            )}
            <Button
              onClick={() => handleSave(true)}
              disabled={!title.trim() || !selectedAcId || isPending}
            >
              {isEditMode ? "Save Changes" : "Save & Close"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
