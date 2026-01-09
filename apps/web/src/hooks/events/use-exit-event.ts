import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeParticipant } from '@/services/events.service';
import { useRouter } from 'next/navigation';

export function useExitEvent() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: removeParticipant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event'] });
      router.push('/user/eventos');
    },
  });
}
