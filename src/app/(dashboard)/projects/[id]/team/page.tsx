"use client";

/**
 * Team Management Page
 * Displays project team members with search, filtering, and management capabilities
 * Follows clean architecture patterns and component composition
 */

import { useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { useProjectMembers } from "@/hooks/use-project-members";
import { useProjects } from "@/hooks/use-projects";
import { filterMembersByQuery } from "@/lib/utils/member.utils";
import { DEFAULT_MEMBERS_PER_PAGE } from "@/lib/constants/member.constants";
import type { ProjectTeamStats } from "@/types/team.types";

// Feature components
import {
  TeamHeader,
  TeamStatsCards,
  MembersTable,
  TeamPagination,
} from "@/components/features/team";

export default function TeamManagementPage() {
  const params = useParams();
  const projectIdParam = params.id as string;
  const projectId = Number(projectIdParam);

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Data fetching
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const {
    data: members,
    isLoading: membersLoading,
    error,
  } = useProjectMembers(projectId);

  // Get current project - handle both string and number IDs
  const currentProject = useMemo(
    () => projects?.find((p) => String(p.id) === projectIdParam),
    [projects, projectIdParam]
  );

  // Memoized filtered members
  const filteredMembers = useMemo(() => {
    if (!members) return [];
    return filterMembersByQuery(members, searchQuery);
  }, [members, searchQuery]);

  // Pagination calculations
  const totalMembers = filteredMembers.length;
  const totalPages = Math.ceil(totalMembers / DEFAULT_MEMBERS_PER_PAGE);
  const startIndex = (currentPage - 1) * DEFAULT_MEMBERS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * DEFAULT_MEMBERS_PER_PAGE, totalMembers);

  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * DEFAULT_MEMBERS_PER_PAGE;
    const end = start + DEFAULT_MEMBERS_PER_PAGE;
    return filteredMembers.slice(start, end);
  }, [filteredMembers, currentPage]);

  // Calculate team stats
  const teamStats: ProjectTeamStats = useMemo(() => {
    if (!members) {
      return {
        totalMembers: 0,
        availableSlots: 0,
        activeMembers: 0,
        inactiveMembers: 0,
      };
    }

    const activeMembers = members.filter((m) => m.status === "Active").length;
    const inactiveMembers = members.filter((m) => m.status === "Inactive").length;
    const maxSlots = 30; // TODO: Get from project settings

    return {
      totalMembers: members.length,
      availableSlots: maxSlots - members.length,
      activeMembers,
      inactiveMembers,
    };
  }, [members]);

  // Event handlers
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on search
  }, []);

  const handleInviteMember = useCallback(() => {
    // TODO: Open invite member dialog
    console.log("Invite member clicked");
  }, []);

  const handleMemberMenuClick = useCallback((memberId: number) => {
    // TODO: Open member actions menu
    console.log("Member menu clicked:", memberId);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Loading state
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

  // Project not found
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

  // Error state
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

  // Empty state
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

  // Main render
  return (
    <>
      <TeamHeader
        project={currentProject}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onInviteMember={handleInviteMember}
      />

      <main className="p-8">
        {/* Stats Cards */}
        <TeamStatsCards stats={teamStats} />

        {/* Members Table */}
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

            {/* Pagination */}
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
    </>
  );
}
