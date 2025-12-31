import { useQueryClient, useMutation } from '@tanstack/react-query';
import { updateActivity } from '@/services/activity.service';

export function useUpdateProjectActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['project'],
      });
    },
  });
}
