import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteEvent } from '@/services/events.service';

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
