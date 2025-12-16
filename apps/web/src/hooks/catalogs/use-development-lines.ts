import { useQuery } from '@tanstack/react-query';
import { getDevelopmentLines } from '@/services/development-lines.service';

export function useDevelopmentLines() {
  return useQuery({
    queryKey: ['development-lines'],
    queryFn: getDevelopmentLines,
  });
}
