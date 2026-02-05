/**
 * Member Table Row Component
 * Displays individual member information in table format
 */

import { useState, useCallback } from "react";
import { MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import type { ProjectMember } from "@/types/team.types";
import { getRoleBadgeClass, getMemberInitials } from "@/lib/utils/member.utils";
import { useUpdateMemberStatus } from "@/hooks/use-project-members";

interface MemberTableRowProps {
  member: ProjectMember;
  onMenuClick: (memberId: number) => void;
}

export function MemberTableRow({ member, onMenuClick }: MemberTableRowProps) {
  const [isActive, setIsActive] = useState(member.status === "Active");
  const updateStatus = useUpdateMemberStatus();

  const handleStatusToggle = useCallback(
    async (checked: boolean) => {
      const newStatus = checked ? "Active" : "Inactive";
      setIsActive(checked);

      try {
        await updateStatus.mutateAsync({
          projectId: member.projectId,
          memberId: member.id,
          status: newStatus,
        });
      } catch (error) {
        // Revert on error
        setIsActive(!checked);
        console.error("Failed to update member status:", error);
      }
    },
    [member.projectId, member.id, updateStatus]
  );

  return (
    <tr className="hover:bg-muted/50 transition-colors">
      {/* Member */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={member.avatar} alt={member.name} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getMemberInitials(member.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-bold">
              {member.name}
            </p>
          </div>
        </div>
      </td>

      {/* Email */}
      <td className="px-6 py-4">
        <p className="text-sm text-muted-foreground">
          {member.email}
        </p>
      </td>

      {/* Project Role */}
      <td className="px-6 py-4">
        <Badge className={getRoleBadgeClass(member.role)} variant="secondary">
          {member.role}
        </Badge>
      </td>

      {/* Access Status */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Switch
            checked={isActive}
            onCheckedChange={handleStatusToggle}
            disabled={updateStatus.isPending}
            aria-label={`Toggle ${member.name} access status`}
          />
          <span
            className={`text-sm font-medium ${
              isActive
                ? "text-gray-900 dark:text-gray-300"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 text-right">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onMenuClick(member.id)}
          aria-label={`Open menu for ${member.name}`}
        >
          <MoreVertical className="h-4 w-4" aria-hidden="true" />
        </Button>
      </td>
    </tr>
  );
}
