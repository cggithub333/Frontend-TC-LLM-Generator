/**
 * Add Member Dialog Component
 * Simple form to add a project member by userId and role
 */

import { useState, useCallback } from "react";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAddProjectMember } from "@/hooks/use-project-members";
import { DEFAULT_MEMBER_ROLE } from "@/lib/constants/member.constants";
import { toast } from "sonner";

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSuccess?: () => void;
}

export function InviteMemberDialog({
  open,
  onOpenChange,
  projectId,
  onSuccess,
}: InviteMemberDialogProps) {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState(DEFAULT_MEMBER_ROLE);
  const [error, setError] = useState<string | undefined>();

  const addMember = useAddProjectMember();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const trimmedUserId = userId.trim();
      if (!trimmedUserId) {
        setError("Please enter a user ID");
        return;
      }

      try {
        await addMember.mutateAsync({
          projectId,
          userId: trimmedUserId,
          role,
        });

        onOpenChange(false);
        setUserId("");
        setRole(DEFAULT_MEMBER_ROLE);
        setError(undefined);
        onSuccess?.();
        toast.success("Member added successfully");
      } catch (err) {
        const msg = err instanceof Error
            ? err.message
            : "Failed to add member. Please try again.";
        setError(msg);
        toast.error(msg);
      }
    },
    [userId, role, projectId, addMember, onOpenChange, onSuccess]
  );

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      onOpenChange(newOpen);
      if (!newOpen) {
        setUserId("");
        setRole(DEFAULT_MEMBER_ROLE);
        setError(undefined);
      }
    },
    [onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            Add Team Member
          </DialogTitle>
          <DialogDescription className="text-center">
            Add a member to this project by entering their user ID and selecting
            a role.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User ID Input */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold">User ID</label>
            <Input
              type="text"
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
                setError(undefined);
              }}
              placeholder="Enter user ID"
              className={error ? "border-destructive" : ""}
              aria-label="User ID"
            />
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>

          {/* Role Selection */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold">Project Role</label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Contributor">Contributor</SelectItem>
                <SelectItem value="Lead">Lead</SelectItem>
                <SelectItem value="Viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-3 p-4 bg-muted rounded-lg border border-border">
            <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              The user must have an existing account. They will be added to the
              project with the selected role immediately.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={addMember.isPending}
          >
            {addMember.isPending ? "Adding..." : "Add Member"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
