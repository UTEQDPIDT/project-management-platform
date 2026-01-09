import { useQueryClient, useMutation } from '@tanstack/react-query';
import { removeAssignee } from '@/services/activities.service';

export function useRemoveAssignee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeAssignee,
    onSuccess: () => {
      // Invalidate event queries (all event details) and the events list
      queryClient.invalidateQueries({ queryKey: ['event'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
