import { DashboardPeriod } from '@repo/types';

export const DASHBOARD_PERIOD_OPTIONS = [
    DashboardPeriod.C1,
    DashboardPeriod.C2,
    DashboardPeriod.C3,
] as const;

export const DASHBOARD_PERIOD_MONTH_LABELS: Record<DashboardPeriod, string> = {
    [DashboardPeriod.C1]: 'ene-abr',
    [DashboardPeriod.C2]: 'may-ago',
    [DashboardPeriod.C3]: 'sep-dic',
};
