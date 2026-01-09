import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerParticipant } from '@/services/events.service';

export function useRegisterParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerParticipant,
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
