import { calculateProgress, isCompletedActivityStatus } from '@/lib/utils';
import { IActivity, IProject, Status } from '@repo/types';
import { useActivitiesByEntity } from '../activities';
import { useProjectProducts } from '../products';
import { useFilesForEntity } from '../files';

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

  // Tanstack
  const { data: activities } = useActivitiesByEntity(project._id);
  const { data: products } = useProjectProducts(project._id);
  const { data: files } = useFilesForEntity(project._id);

  // Team memberships (new schema)
  const memberships = team?.memberships ?? [];
  const profiles = memberships
    .map((m) => ({
      givenName: m.user?.givenName,
      familyName: m.user?.familyName,
      avatarUrl: m.user?.avatarUrl,
    }))
    .filter((p) => p.givenName && p.familyName);

  // Always include owner
  if (owner) {
    profiles.push({
      givenName: owner.givenName,
      familyName: owner.familyName,
      avatarUrl: owner.avatarUrl,
    });
  }

  // Progress calculation (by completed activities)
  const completedActivities =
    activities?.filter((a: IActivity) => isCompletedActivityStatus(a.status)) ?? [];
  const progress = calculateProgress(activities ?? []);

  return {
    id: _id,
    name,
    trlRating,
    startDate,
    endDate,
    relatedProjects,
    profiles,
    progress,
    products,
    files,
    activities,
    completedActivitiesCount: completedActivities.length,
    totalActivitiesCount: activities?.length ?? 0,
  };
}
