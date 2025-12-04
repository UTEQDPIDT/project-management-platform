import { useQuery } from '@tanstack/react-query';
import { getEducationalPrograms } from '@/services/educational-programs.service';

export function usePrograms() {
  return useQuery({
    queryKey: ['programs'],
    queryFn: getEducationalPrograms,
  });
}
