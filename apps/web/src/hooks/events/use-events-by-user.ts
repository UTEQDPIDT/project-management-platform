
import { useQuery } from '@tanstack/react-query';
import { getEventsByUser } from '@/services/events.service';

export function useEventsByUser(options = {}) {
	return useQuery({
		queryKey: ['events', 'by-user'],
		queryFn: getEventsByUser,
		...options,
	});
}
