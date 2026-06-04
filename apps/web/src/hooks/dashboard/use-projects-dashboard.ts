import { useQuery } from '@tanstack/react-query';
import { getProjectsDashboard } from '@/services/projects.service';
import { DashboardPeriod } from '@repo/types';

export function useProjectsDashboard(period: DashboardPeriod, year?: number) {
  return useQuery({
    queryKey: ['dashboard-projects', period, year],
    queryFn: () => getProjectsDashboard(period, year),
    enabled: Boolean(period),
  });
}