import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeParticipant } from '@/services/events.service';

export function useRemoveParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeParticipant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event'] });
    },
  });
}
