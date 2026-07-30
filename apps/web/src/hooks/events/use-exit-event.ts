import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeParticipant } from '@/services/events.service';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useExitEvent() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: removeParticipant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event'] });
      toast.success('Saliste del evento correctamente');
      router.push('/user/eventos');
    },
    onError: () => {
      toast.error('No fue posible salir del evento');
    },
  });
}
