/**
 * Member Table Row Component
 * Displays individual member information in table format
 */

import { useCallback } from "react";
import { MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProjectMember } from "@/types/team.types";
import { getRoleBadgeClass, getMemberInitials } from "@/lib/utils/member.utils";
import { useUpdateProjectMember } from "@/hooks/use-project-members";
import { toast } from "sonner";

interface MemberTableRowProps {
  member: ProjectMember;
  onMenuClick: (memberId: string) => void;
}

export function MemberTableRow({ member, onMenuClick }: MemberTableRowProps) {
  const updateMember = useUpdateProjectMember();

  const handleRoleChange = useCallback(
    async (newRole: string) => {
      try {
        await updateMember.mutateAsync({
          projectId: member.projectId,
          memberId: member.projectMemberId,
          role: newRole,
        });
        toast.success(`Role updated to ${newRole}`);
      } catch (error) {
        toast.error("Failed to update member role");
      }
    },
    [member.projectId, member.projectMemberId, updateMember]
  );

  return (
    <tr className="hover:bg-muted/50 transition-colors">
      {/* Member */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary">
              {getMemberInitials(member.userFullName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-bold">
              {member.userFullName}
            </p>
          </div>
        </div>
      </td>

      {/* Email */}
      <td className="px-6 py-4">
        <p className="text-sm text-muted-foreground">
          {member.userEmail}
        </p>
      </td>

      {/* Project Role */}
      <td className="px-6 py-4">
        <Badge className={getRoleBadgeClass(member.role)} variant="secondary">
          {member.role}
        </Badge>
      </td>

      {/* Role Change */}
      <td className="px-6 py-4">
        <Select
          value={member.role}
          onValueChange={handleRoleChange}
          disabled={updateMember.isPending}
        >
          <SelectTrigger className="w-[130px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Lead">Lead</SelectItem>
            <SelectItem value="Contributor">Contributor</SelectItem>
            <SelectItem value="Viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 text-right">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onMenuClick(member.projectMemberId)}
          aria-label={`Open menu for ${member.userFullName}`}
        >
          <MoreVertical className="h-4 w-4" aria-hidden="true" />
        </Button>
      </td>
    </tr>
  );
}
