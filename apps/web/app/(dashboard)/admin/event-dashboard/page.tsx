'use client';

import {
  Header,
  HeaderDescription,
  HeaderHeading,
  HeaderTitle,
} from '@/components/header';
import { PageContent } from '@/components/page-content';

import { ChartArea } from '@/components/charts/chart-area';
import { DashboardEventsTable } from '@/components/charts/dashboard-events-table';
import { ChartRadial } from '@/components/charts/chart-radial';
import { ChartRadialStacked } from '@/components/charts/chart-radial-stacked';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEventsDashboard } from '@/hooks/dashboard';
import { DASHBOARD_PERIOD_MONTH_LABELS, DASHBOARD_PERIOD_OPTIONS } from '@/constants/dashboard-period.const';
import { DashboardPeriod } from '@repo/types';

import React from 'react';

const Page = () => {
  const currentYear = new Date().getFullYear();
  const [period, setPeriod] = React.useState<DashboardPeriod>(DashboardPeriod.C1);
  const [year, setYear] = React.useState<string>(String(currentYear));
  const selectedYear = Number(year);

  const { data, isLoading, isError } = useEventsDashboard(
    period,
    Number.isInteger(selectedYear) ? selectedYear : currentYear,
  );

  const yearOptions = React.useMemo(
    () => Array.from({ length: 5 }, (_, index) => String(currentYear - 4 + index)),
    [currentYear],
  );

  return (
    <div>
      <Header>
        <HeaderHeading>
          <HeaderTitle>Eventos Métricas</HeaderTitle>
          <HeaderDescription>
            Gestiona las métricas de los eventos.
          </HeaderDescription>
        </HeaderHeading>
      </Header>
      <PageContent className="">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Periodo -</span>
            <Select
              value={period}
              onValueChange={(value: DashboardPeriod) =>
                setPeriod(value)
              }
            >
              <SelectTrigger className="w-28 border-zinc-500">
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                {DASHBOARD_PERIOD_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Año -</span>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-32 border-zinc-500">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? <p>Cargando métricas...</p> : null}

        {isError ? (
          <p className="text-destructive">No se pudieron cargar las métricas.</p>
        ) : null}

        {!isLoading && !isError && data ? (
          <div className="w-full">
            <div className="flex flex-col gap-4 sm:p-4 md:gap-4 md:p-2 lg:flex-row lg:items-stretch">
              <div className="w-full lg:w-1/3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-2">
                    <ChartRadial
                    title="Total Eventos"
                    description={`Cuatrimestre: ${DASHBOARD_PERIOD_MONTH_LABELS[data.period]}`}
                    value={data.kpis.totalEvents}
                    label="Eventos"
                    color="#242D55"
                    />
                    <ChartRadial
                    title="Total Participantes"
                    description="Asistencia total"
                    value={data.sexBreakdown.total}
                    label="Participantes"
                    color="#242D55"
                    />
                </div>
                <div className="mt-3 md:mt-4">
                    <ChartRadialStacked
                    title="Distribucion por sexo"
                    description="Asistencia reportada en eventos"
                    men={data.sexBreakdown.men}
                    women={data.sexBreakdown.women}
                    />
                </div>
              </div>
              <div className="w-full lg:flex lg:w-2/3">
                <div className="w-full h-full">
                    <ChartArea
                    title="Tendencia Mensual"
                    description={`Periodo: ${new Date(data.dateRange.startDate).toLocaleDateString()} - ${new Date(data.dateRange.endDate).toLocaleDateString()}`}
                    data={data.trend}
                    metric="participants"
                    cumulative={true}
                    className="h-full"
                  />
                </div>
              </div>
            </div>
            <div className="w-full md:p-2 lg:w-full lg:p-4 xl:p-4">
              <DashboardEventsTable dateRange={data.dateRange} />
            </div>
          </div>
        ) : null}
      </PageContent>
    </div>
  );
};
export default Page;