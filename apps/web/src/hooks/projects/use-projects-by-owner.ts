import { useQuery } from '@tanstack/react-query';
import { getByOwner } from '@/services/project.service';

export function useProjectsByOwner() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => await getByOwner(),
  });
}
