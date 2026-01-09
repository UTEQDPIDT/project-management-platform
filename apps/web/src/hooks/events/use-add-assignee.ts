import { useQueryClient, useMutation } from '@tanstack/react-query';
import { addAssignee } from '@/services/activities.service';
import { toast } from 'sonner';

export function useAddAssignee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addAssignee,
    onSuccess: () => {
      // Invalidate event queries (all event details) and the events list
      queryClient.invalidateQueries({ queryKey: ['event'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Entraste a la actividad');
    },
  });
}
