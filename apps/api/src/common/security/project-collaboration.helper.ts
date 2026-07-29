import { UserRole } from '@repo/types';

type TeamMembershipLike = {
  user?: unknown;
  status?: string;
};

type TeamLike = {
  memberships?: TeamMembershipLike[];
};

type ProjectCollaborationLike = {
  owner?: unknown;
  team?: TeamLike | null;
};

type ToId = (value: unknown) => string | null;

export function hasProjectCollaborationAccess(
  project: ProjectCollaborationLike,
  actorId: string,
  actorRole: UserRole,
  toId: ToId,
): boolean {
  if (actorRole === UserRole.ADMIN) {
    return true;
  }

  const ownerId = toId(project.owner);

  if (ownerId === actorId) {
    return true;
  }

  return (project.team?.memberships ?? []).some(
    (membership) =>
      membership.status === 'ACTIVE' && toId(membership.user) === actorId,
  );
}