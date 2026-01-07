import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerParticipant } from '@/services/events.service';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useRegisterParticipant() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: registerParticipant,
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      router.push(`/user/eventos/${eventId}`);
      toast.success('Se ha registrado al evento');
    },
    onError: () => {
      toast.error('No se ha registrado el evento');
    },
  });
}
