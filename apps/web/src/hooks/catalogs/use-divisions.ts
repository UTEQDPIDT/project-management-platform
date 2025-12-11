import { useQuery } from '@tanstack/react-query';
import { getDivisions } from '@/services/divisions.service';

export function useDivisions() {
  return useQuery({
    queryKey: ['divisions'],
    queryFn: getDivisions,
  });
}
