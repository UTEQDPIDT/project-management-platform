import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeParticipant } from '@/services/events.service';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function useExitEvent() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: removeParticipant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event'] });
      toast.success('Ha salido del evento');
      router.push('/user/eventos');
    },
    onError: () => {
      toast.error('No ha salido del evento');
    },
  });
}
