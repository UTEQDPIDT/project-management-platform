import { useQuery } from '@tanstack/react-query';
import { getAllTeams } from '@/services/team.service';

export function useAllTeams(isPrivate?: boolean) {
  return useQuery({
    queryFn: () => getAllTeams(isPrivate),
    queryKey: ['teams'],
  });
}
