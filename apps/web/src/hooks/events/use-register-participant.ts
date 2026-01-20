import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerParticipant } from '@/services/events.service';
import { toast } from 'sonner';

export function useRegisterParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerParticipant,
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Se ha registrado al evento');
    },
    onError: () => toast.error('No se pudo registrar al evento'),
  });
}
