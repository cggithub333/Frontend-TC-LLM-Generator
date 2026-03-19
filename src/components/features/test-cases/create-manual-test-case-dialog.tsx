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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserStory, AcceptanceCriteria } from "@/types/story.types";
import type { TestCase } from "@/types/test-case.types";
import { useCreateTestCase, useUpdateTestCase } from "@/hooks/use-test-cases";
import { toast } from "sonner";

interface CreateManualTestCaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userStory: UserStory | null;
  defaultAcId?: string | null;
  editTestCase?: TestCase | null;
  onSuccess?: (createdTestCase?: TestCase) => void;
}

export function CreateManualTestCaseDialog({
  open,
  onOpenChange,
  userStory,
  defaultAcId,
  editTestCase,
  onSuccess,
}: CreateManualTestCaseDialogProps) {
  const { mutateAsync: createTestCase, isPending: isCreating } = useCreateTestCase();
  const { mutateAsync: updateTestCase, isPending: isUpdating } = useUpdateTestCase();
  const isPending = isCreating || isUpdating;
  const isEditMode = !!editTestCase;

  // Form State
  const [selectedAcId, setSelectedAcId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [preconditions, setPreconditions] = useState("");
  const [steps, setSteps] = useState("");
  const [expectedResult, setExpectedResult] = useState("");

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
      } else {
        resetForm();
        if (defaultAcId) {
          setSelectedAcId(defaultAcId);
        } else if (userStory?.acceptanceCriteria?.length) {
          setSelectedAcId(userStory.acceptanceCriteria[0].acceptanceCriteriaId);
        }
      }
    }
  }, [open, defaultAcId, userStory, editTestCase]);

  const resetForm = () => {
    setTitle("");
    setPreconditions("");
    setSteps("");
    setExpectedResult("");
    // keep selectedAcId
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const handleSave = async (closeAfterSave: boolean) => {
    if (!title.trim() || !selectedAcId) return;

    try {
      let result: TestCase | undefined;
      if (isEditMode && editTestCase) {
        await updateTestCase({
          id: editTestCase.testCaseId,
          title,
          preconditions,
          steps,
          expectedResult,
        });
      } else {
        result = await createTestCase({
          userStoryId: userStory?.userStoryId,
          acceptanceCriteriaId: selectedAcId,
          title,
          preconditions,
          steps,
          expectedResult,
          customFieldsJson: "{}",
          generatedByAi: false,
        });
      }

      if (closeAfterSave) {
        handleClose();
      } else {
        resetForm();
      }

      onSuccess?.(result);
      // Only show generic toast if no onSuccess handler (caller provides richer toast)
      if (!onSuccess) {
        toast.success(isEditMode ? "Test case updated successfully" : "Test case created successfully");
      }
    } catch (error) {
      toast.error(isEditMode ? "Failed to update test case" : "Failed to create test case");
    }
  };

  if (!userStory) return null;

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
                Save & Add Another
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
