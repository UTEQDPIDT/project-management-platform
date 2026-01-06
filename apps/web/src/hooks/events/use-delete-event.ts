import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteEvent } from '@/services/events.service';
import { useRouter } from 'next/navigation';

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      router.push('/admin/eventos');
    },
  });
}
