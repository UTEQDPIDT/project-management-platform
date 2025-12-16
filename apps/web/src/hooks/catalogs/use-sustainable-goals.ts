import { useQuery } from '@tanstack/react-query';
import { getSustainableGoals } from '@/services/sustainable-goals.service';

export function useSustainableGoals() {
  return useQuery({
    queryKey: ['sustainable-goals'],
    queryFn: getSustainableGoals,
  });
}
