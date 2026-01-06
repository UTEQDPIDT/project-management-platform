import { useQueryClient, useMutation } from '@tanstack/react-query';
import { createEventActivity } from '@/services/events.service';

export const useCreateEventActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEventActivity,
    onSuccess: (_, variables) => {
      // Invalidate the single event cache and the events list
      queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};
