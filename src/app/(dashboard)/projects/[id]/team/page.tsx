"use client";

/**
 * Team Management Page
 * Displays project team members with search, filtering, and management capabilities
 */

import { useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { useProjectMembers } from "@/hooks/use-project-members";
import { useProjects } from "@/hooks/use-projects";
import { filterMembersByQuery } from "@/lib/utils/member.utils";
import { DEFAULT_MEMBERS_PER_PAGE } from "@/lib/constants/member.constants";
import type { ProjectTeamStats } from "@/types/team.types";

import {
  TeamHeader,
  TeamStatsCards,
  MembersTable,
  TeamPagination,
  InviteMemberDialog,
} from "@/components/features/team";

export default function TeamManagementPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const { data: projectsResult, isLoading: projectsLoading } = useProjects();
  const {
    data: membersResult,
    isLoading: membersLoading,
    error,
    refetch: refetchMembers,
  } = useProjectMembers(projectId);

  const members = membersResult?.items;

  const currentProject = useMemo(
    () => projectsResult?.items.find((p) => p.projectId === projectId),
    [projectsResult, projectId]
  );

  const filteredMembers = useMemo(() => {
    if (!members) return [];
    return filterMembersByQuery(members, searchQuery);
  }, [members, searchQuery]);

  const totalMembers = filteredMembers.length;
  const totalPages = Math.ceil(totalMembers / DEFAULT_MEMBERS_PER_PAGE);
  const startIndex = (currentPage - 1) * DEFAULT_MEMBERS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * DEFAULT_MEMBERS_PER_PAGE, totalMembers);

  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * DEFAULT_MEMBERS_PER_PAGE;
    const end = start + DEFAULT_MEMBERS_PER_PAGE;
    return filteredMembers.slice(start, end);
  }, [filteredMembers, currentPage]);

  const teamStats: ProjectTeamStats = useMemo(() => {
    const total = members?.length ?? 0;
    const maxSlots = 30;

    return {
      totalMembers: total,
      availableSlots: maxSlots - total,
      activeMembers: total,
      inactiveMembers: 0,
    };
  }, [members]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleInviteMember = useCallback(() => {
    setInviteDialogOpen(true);
  }, []);

  const handleMemberMenuClick = useCallback((memberId: string) => {
    // TODO: Open member actions menu
    console.log("Member menu clicked:", memberId);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  if (projectsLoading || membersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading team members...</p>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-center">
          <p className="text-destructive mb-4 font-medium">Project not found</p>
          <a
            href="/workspaces"
            className="text-primary hover:text-primary/80 font-medium"
          >
            Back to Workspaces
          </a>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-center">
          <p className="text-destructive mb-4 font-medium">
            Failed to load team members
          </p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
        </div>
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <>
        <TeamHeader
          project={currentProject}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onInviteMember={handleInviteMember}
        />
        <main className="p-8">
          <TeamStatsCards stats={teamStats} />
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No team members yet
            </p>
            <button
              onClick={handleInviteMember}
              className="text-primary hover:text-primary/80 font-medium"
            >
              Invite your first member
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <TeamHeader
        project={currentProject}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onInviteMember={handleInviteMember}
      />

      <main className="p-8">
        <TeamStatsCards stats={teamStats} />

        {filteredMembers.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-xl">
            <p className="text-muted-foreground">
              No members found matching &quot;{searchQuery}&quot;
            </p>
          </div>
        ) : (
          <>
            <MembersTable
              members={paginatedMembers}
              onMemberMenuClick={handleMemberMenuClick}
            />

            {totalPages > 1 && (
              <TeamPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalMembers={totalMembers}
                startIndex={startIndex}
                endIndex={endIndex}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </main>

      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        projectId={projectId}
        onSuccess={() => {
          refetchMembers();
        }}
      />
    </>
  );
}
