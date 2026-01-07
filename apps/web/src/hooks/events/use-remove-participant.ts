import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeParticipant } from '@/services/events.service';
import { toast } from 'sonner';

export function useRemoveParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeParticipant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event'] });
      toast.success('Se ha expulsado al participante');
    },
    onError: () => {
      toast.error('No se ha expulsado al participante');
    },
  });
}
