import { useQueryClient, useMutation } from '@tanstack/react-query';
import { deleteEventActivity } from '@/services/events.service';
import { toast } from 'sonner';

export const useDeleteEventActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEventActivity,
    onSuccess: (_, variables) => {
      // Invalidate the single event cache and the events list
      queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Se ha eliminado la actividad');
    },
    onError: () => {
      toast.error('No se ha eliminado la actividad');
    },
  });
};
