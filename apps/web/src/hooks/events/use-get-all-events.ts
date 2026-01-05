import { useQuery } from '@tanstack/react-query';
import { getAllEvents } from '@/services/events.service';

// todo: query key to fetch teams by isPrivate
export function useGetAllEvents() {
  return useQuery({
    queryFn: getAllEvents,
    queryKey: ['events'],
  });
}
