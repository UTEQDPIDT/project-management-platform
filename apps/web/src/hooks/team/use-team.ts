import { useQuery } from '@tanstack/react-query';
import { getTeam } from '@/services/team.service';

export function useTeam(teamId: string) {
  return useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => await getTeam(teamId),
    enabled: !!teamId,
  });
}
