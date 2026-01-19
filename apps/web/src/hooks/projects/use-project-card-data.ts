import { calculateProgress } from '@/lib/utils';
import { IProject } from '@repo/types';

export function useProjectCardData(project: IProject) {
  const {
    name,
    team,
    owner,
    _id,
    trlRating,
    startDate,
    endDate,
    relatedProjects,
  } = project;

  const members = team?.members ?? [];
  const collaborators = team?.collaborators ?? [];

  const uniqueUsers = Array.from(
    new Map([...members, ...collaborators].map((u) => [u._id, u])).values(),
  );

  const profiles = uniqueUsers.map((u) => ({
    givenName: u.givenName,
    familyName: u.familyName,
    avatarUrl: u.avatarUrl,
  }));

  profiles.push({
    givenName: owner.givenName,
    familyName: owner.familyName,
    avatarUrl: owner.avatarUrl,
  });

  return {
    id: _id,
    name,
    trlRating,
    startDate,
    endDate,
    relatedProjects,
    profiles,
  };
}
