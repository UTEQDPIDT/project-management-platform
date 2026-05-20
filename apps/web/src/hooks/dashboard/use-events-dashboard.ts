import { useQuery } from '@tanstack/react-query';
import { getEventsDashboard } from '@/services/events.service';

type DashboardPeriod = 'T1' | 'T2' | 'T3';

export function useEventsDashboard(period: DashboardPeriod, year?: number) {
  return useQuery({
    queryKey: ['dashboard-events', period, year],
    queryFn: () => getEventsDashboard(period, year),
    enabled: Boolean(period),
  });
}