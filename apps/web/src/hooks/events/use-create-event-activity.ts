import { useQueryClient, useMutation } from '@tanstack/react-query';
import { createEventActivity } from '@/services/events.service';

export const useCreateEventActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEventActivity,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['events', 'event', variables.eventId],
      });
    },
  });
};
