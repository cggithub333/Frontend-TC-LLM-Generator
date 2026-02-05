/**
 * Members Table Component
 * Displays project members in a table with sorting and filtering
 */

import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProjectMember } from "@/types/team.types";
import { MemberTableRow } from "./member-table-row";

interface MembersTableProps {
  members: ProjectMember[];
  onMemberMenuClick: (memberId: number) => void;
}

export function MembersTable({
  members,
  onMemberMenuClick,
}: MembersTableProps) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-border flex justify-between items-center">
        <h3 className="font-bold">
          Active Members
        </h3>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Filter members"
          >
            <Filter className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Member
              </th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Email
              </th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Project Role
              </th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Access Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map((member) => (
              <MemberTableRow
                key={member.id}
                member={member}
                onMenuClick={onMemberMenuClick}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
