import { useQuery } from '@tanstack/react-query';
import { getByUser } from '@/services/teams.service';

export function useTeamsByUser() {
  return useQuery({
    queryFn: getByUser,
    queryKey: ['teams-by-user'],
  });
}
