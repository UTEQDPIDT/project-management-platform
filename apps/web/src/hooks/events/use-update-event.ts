import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateEvent } from '@/services/events.service';
import { useRouter } from 'next/navigation';

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ eventId, eventData }: { eventId: string; eventData: any }) =>
      updateEvent({ eventId, eventData }),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      router.push('/admin/eventos');
    },
  });
}
