import { useQueryClient, useMutation } from '@tanstack/react-query';
import { deleteActivity } from '@/services/project.service';

export const useDeleteActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteActivity,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['project', variables.projectId],
      });
    },
  });
};
