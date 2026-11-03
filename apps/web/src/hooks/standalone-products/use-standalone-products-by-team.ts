import { useQuery } from '@tanstack/react-query';
import { getStandaloneProductsByTeam } from '@/services/standalone-products.service';

export function useStandaloneProductsByTeam(teamId: string) {
  return useQuery({
    queryKey: ['standalone-products', 'team', teamId],
    queryFn: () => getStandaloneProductsByTeam(teamId),
    enabled: !!teamId,
  });
}
