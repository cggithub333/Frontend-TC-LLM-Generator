export interface ProjectMember {
  projectMemberId: string;
  projectId: string;
  projectName: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  role: string;
  joinedAt: string;
}

export interface AddProjectMemberInput {
  projectId: string;
  userId: string;
  role: string;
}

export interface UpdateProjectMemberInput {
  role: string;
}

export interface ProjectTeamStats {
  totalMembers: number;
  availableSlots: number;
  activeMembers: number;
  inactiveMembers: number;
}
