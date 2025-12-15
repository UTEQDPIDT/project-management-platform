import { useQuery } from '@tanstack/react-query';
import { getAllProjects } from '@/services/project.service';

export function useAllProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => await getAllProjects(),
  });
}
