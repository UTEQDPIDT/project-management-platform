import { useQueryClient, useMutation } from '@tanstack/react-query';
import { addAssignee } from '@/services/activities.service';

export function useAddAssignee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addAssignee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}
