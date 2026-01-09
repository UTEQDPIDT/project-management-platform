import { useQuery } from '@tanstack/react-query';
import { getProjectByTeam } from '@/services/projects.service';

export function useProjectsByTeam(teamId: string) {
  return useQuery({
    queryKey: ['projects-by-team', teamId],
    queryFn: async () => await getProjectByTeam(teamId),
    enabled: !!teamId,
  });
}
