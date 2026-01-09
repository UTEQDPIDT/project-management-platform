import { useQuery } from '@tanstack/react-query';
import { getProject } from '@/services/projects.service';

export function useProject(projectId: string) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => await getProject(projectId),
    enabled: !!projectId,
  });
}
