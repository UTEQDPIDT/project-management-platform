import { UserRole } from '@repo/types';
import { hasProjectCollaborationAccess } from './project-collaboration.helper';

describe('project collaboration selection', () => {
  const project = {
    owner: 'owner',
    team: {
      memberships: [
        { _id: 'selected', user: 'member', status: 'ACTIVE' },
        { _id: 'excluded', user: 'other', status: 'ACTIVE' },
        { _id: 'owner-membership', user: 'owner', status: 'ACTIVE' },
        { _id: 'pending', user: 'pending-user', status: 'PENDING' },
      ],
    },
    excludedTeamMemberships: ['excluded', 'owner-membership'],
  };
  const toId = (value: unknown) => (typeof value === 'string' ? value : null);

  it('allows selected active members, the owner and administrators', () => {
    expect(
      hasProjectCollaborationAccess(project, 'member', UserRole.USER, toId),
    ).toBe(true);
    expect(
      hasProjectCollaborationAccess(project, 'owner', UserRole.USER, toId),
    ).toBe(true);
    expect(
      hasProjectCollaborationAccess(project, 'other', UserRole.ADMIN, toId),
    ).toBe(true);
  });

  it('denies excluded and pending members', () => {
    expect(
      hasProjectCollaborationAccess(project, 'other', UserRole.USER, toId),
    ).toBe(false);
    expect(
      hasProjectCollaborationAccess(
        project,
        'pending-user',
        UserRole.USER,
        toId,
      ),
    ).toBe(false);
  });

  it('allows a new membership even if an earlier membership was excluded', () => {
    const rejoined = {
      ...project,
      team: { memberships: [{ _id: 'new', user: 'other', status: 'ACTIVE' }] },
    };
    expect(
      hasProjectCollaborationAccess(rejoined, 'other', UserRole.USER, toId),
    ).toBe(true);
  });
});
