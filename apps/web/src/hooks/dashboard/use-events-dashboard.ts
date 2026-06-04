import { useQuery } from '@tanstack/react-query';
import { getEventsDashboard } from '@/services/events.service';
import { DashboardPeriod } from '@repo/types';

export function useEventsDashboard(period: DashboardPeriod, year?: number) {
  return useQuery({
    queryKey: ['dashboard-events', period, year],
    queryFn: () => getEventsDashboard(period, year),
    enabled: Boolean(period),
  });
}