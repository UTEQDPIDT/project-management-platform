import { useQueryClient, useMutation } from '@tanstack/react-query';
import { deleteEventActivity } from '@/services/events.service';

export const useDeleteEventActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEventActivity,
    onSuccess: (_, variables) => {
      // Invalidate the single event cache and the events list
      queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};
