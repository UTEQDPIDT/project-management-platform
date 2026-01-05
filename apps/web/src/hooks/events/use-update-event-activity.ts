import { useQueryClient, useMutation } from '@tanstack/react-query';
import { updateActivity } from '@/services/activity.service';

export function useUpdateEventActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['event'],
      });
    },
  });
}
