import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProject } from '@/services/project.service';

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
