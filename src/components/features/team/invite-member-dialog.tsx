/**
 * Invite Member Dialog Component
 * Multi-email input with chip UI for inviting team members
 */

import { useState, useCallback, KeyboardEvent } from "react";
import { X, Info } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { useInviteMember } from "@/hooks/use-project-members";
import { isValidEmail } from "@/lib/utils/member.utils";
import { DEFAULT_MEMBER_ROLE } from "@/lib/constants/member.constants";
import type { MemberRole } from "@/types/team.types";

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  onSuccess?: () => void;
}

export function InviteMemberDialog({
  open,
  onOpenChange,
  projectId,
  onSuccess,
}: InviteMemberDialogProps) {
  const [emails, setEmails] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [role, setRole] = useState<MemberRole>(DEFAULT_MEMBER_ROLE);
  const [error, setError] = useState<string | undefined>();

  const inviteMember = useInviteMember();

  // Add email chip
  const addEmail = useCallback((email: string) => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) return;

    // Validate email
    if (!isValidEmail(trimmedEmail)) {
      setError(`"${trimmedEmail}" is not a valid email address`);
      return;
    }

    // Check for duplicates
    if (emails.includes(trimmedEmail)) {
      setError(`"${trimmedEmail}" is already added`);
      return;
    }

    setEmails((prev) => [...prev, trimmedEmail]);
    setInputValue("");
    setError(undefined);
  }, [emails]);

  // Remove email chip
  const removeEmail = useCallback((emailToRemove: string) => {
    setEmails((prev) => prev.filter((email) => email !== emailToRemove));
    setError(undefined);
  }, []);

  // Handle keyboard input
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      const value = inputValue.trim();

      // Add on Enter, comma, or space
      if (e.key === "Enter" || e.key === "," || e.key === " ") {
        e.preventDefault();
        if (value) {
          addEmail(value);
        }
      }

      // Remove last email on Backspace if input is empty
      if (e.key === "Backspace" && !inputValue && emails.length > 0) {
        removeEmail(emails[emails.length - 1]);
      }
    },
    [inputValue, emails, addEmail, removeEmail]
  );

  // Handle paste (support comma-separated emails)
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const pastedText = e.clipboardData.getData("text");
      const pastedEmails = pastedText
        .split(/[,\s]+/)
        .filter((email) => email.trim());

      if (pastedEmails.length > 1) {
        e.preventDefault();
        pastedEmails.forEach((email) => addEmail(email));
      }
    },
    [addEmail]
  );

  // Submit form
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Add current input value if present
      if (inputValue.trim()) {
        addEmail(inputValue.trim());
        return; // Wait for email to be added, user will click submit again
      }

      // Validate at least one email
      if (emails.length === 0) {
        setError("Please add at least one email address");
        return;
      }

      try {
        // Send invitations for each email
        for (const email of emails) {
          await inviteMember.mutateAsync({
            projectId,
            email,
            role,
          });
        }

        // Success - close dialog and reset
        onOpenChange(false);
        setEmails([]);
        setInputValue("");
        setRole(DEFAULT_MEMBER_ROLE);
        setError(undefined);
        onSuccess?.();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to send invitations. Please try again."
        );
      }
    },
    [
      inputValue,
      emails,
      role,
      projectId,
      addEmail,
      inviteMember,
      onOpenChange,
      onSuccess,
    ]
  );

  // Reset state when dialog closes
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      onOpenChange(newOpen);
      if (!newOpen) {
        setEmails([]);
        setInputValue("");
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
            Invite your team
          </DialogTitle>
          <DialogDescription className="text-center">
            Start collaborating with your project team. Enter email addresses
            separated by a comma.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input with Chips */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold">To</label>
            <div
              className={`flex flex-wrap items-center gap-2 p-2 border rounded-md bg-background focus-within:ring-2 focus-within:ring-primary/20 min-h-[50px] ${
                error ? "border-destructive" : "border-primary"
              }`}
            >
              {/* Email Chips */}
              {emails.map((email) => (
                <Badge
                  key={email}
                  variant="secondary"
                  className="gap-1.5 px-2.5 py-1"
                >
                  {email}
                  <button
                    type="button"
                    onClick={() => removeEmail(email)}
                    className="flex items-center hover:text-foreground transition-colors"
                    aria-label={`Remove ${email}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}

              {/* Input */}
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                onBlur={() => {
                  if (inputValue.trim()) {
                    addEmail(inputValue.trim());
                  }
                }}
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm p-0 min-w-[60px] focus-visible:outline-none"
                placeholder={emails.length === 0 ? "Enter email addresses" : ""}
                aria-label="Email addresses"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>

          {/* Role Selection */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold">Project Role</label>
            <Select value={role} onValueChange={(value) => setRole(value as MemberRole)}>
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
              When someone with an existing account joins your team, they&apos;ll
              receive an email invitation to access this project immediately.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={inviteMember.isPending}
          >
            {inviteMember.isPending ? "Sending..." : "Send Invitations"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
