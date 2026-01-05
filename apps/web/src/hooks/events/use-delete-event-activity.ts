import { useQueryClient, useMutation } from '@tanstack/react-query';
import { deleteEventActivity } from '@/services/events.service';

export const useDeleteEventActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEventActivity,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['events', 'event', variables.eventId],
      });
    },
  });
};
