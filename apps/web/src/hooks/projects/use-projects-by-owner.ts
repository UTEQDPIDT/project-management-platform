import { useQuery } from '@tanstack/react-query';
import { getByOwner } from '@/services/projects.service';

export function useProjectsByOwner() {
  return useQuery({
    queryKey: ['projects-by-owner'],
    queryFn: async () => await getByOwner(),
  });
}
