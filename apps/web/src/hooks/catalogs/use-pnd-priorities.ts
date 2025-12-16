import { useQuery } from '@tanstack/react-query';
import { getPndPriorities } from '@/services/pnd-priorities.service';

export function usePndPriorities() {
  return useQuery({
    queryKey: ['pnd-priorities'],
    queryFn: getPndPriorities,
  });
}
