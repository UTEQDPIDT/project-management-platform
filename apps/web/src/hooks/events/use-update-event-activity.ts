import { useQueryClient, useMutation } from '@tanstack/react-query';
import { updateActivity } from '@/services/activity.service';
import { toast } from 'sonner';

export function useUpdateEventActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateActivity,
    onSuccess: () => {
      // Invalidate event queries (all event details) and the events list
      queryClient.invalidateQueries({ queryKey: ['event'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Se actualizó la actividad');
    },
  });
}
