import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProject } from '@/services/project.service';

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      projectData,
    }: {
      projectId: string;
      projectData: any;
    }) => updateProject(projectId, projectData),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
