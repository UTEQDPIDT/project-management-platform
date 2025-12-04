import { useQuery } from '@tanstack/react-query';
import { getAllTeams } from '@/services/team.service';

export function useAllTeams() {
  return useQuery({
    queryFn: getAllTeams,
    queryKey: ['teams'],
  });
}
