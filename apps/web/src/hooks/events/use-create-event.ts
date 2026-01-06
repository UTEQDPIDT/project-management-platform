import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createEvent } from '@/services/events.service';
import { useRouter } from 'next/navigation';

export function useCreateEvent() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      router.push('/admin/eventos');
    },
  });
}
