import { useQuery } from '@tanstack/react-query';
import { getEventById } from '@/services/events.service';

export function useGetEventById(eventId: string) {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => await getEventById(eventId),
    enabled: !!eventId,
  });
}
