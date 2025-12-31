import { useQueryClient, useMutation } from '@tanstack/react-query';
import { createActivity } from '@/services/project.service';

export const useCreateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createActivity,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['project', variables.projectId],
      });
    },
  });
};
