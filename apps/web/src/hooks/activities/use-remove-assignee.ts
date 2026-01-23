import { useQueryClient, useMutation } from '@tanstack/react-query';
import { removeAssignee } from '@/services/activities.service';

export function useRemoveAssignee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeAssignee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}
