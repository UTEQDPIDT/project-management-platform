import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addParticipants } from '@/services/events.service';

export function useAddParticipants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, userIds }: { eventId: string; userIds: any }) =>
      addParticipants({ eventId, userIds }),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
