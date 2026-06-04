import { DashboardPeriod } from '@repo/types';

export const DASHBOARD_PERIOD_RANGES: Record<
    DashboardPeriod,
    { startMonth: number; endMonth: number }
> = {
    [DashboardPeriod.C1]: { startMonth: 0, endMonth: 3 },
    [DashboardPeriod.C2]: { startMonth: 4, endMonth: 7 },
    [DashboardPeriod.C3]: { startMonth: 8, endMonth: 11 },
};

export const DASHBOARD_PERIOD_VALUES = Object.values(DashboardPeriod);