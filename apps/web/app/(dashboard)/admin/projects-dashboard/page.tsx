'use client';

import {
  Header,
  HeaderDescription,
  HeaderHeading,
  HeaderTitle,
} from '@/components/header';
import { PageContent } from '@/components/page-content';
import { ChartRadial } from '@/components/charts/chart-radial';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQueries } from '@tanstack/react-query';

import { useProjectsDashboard } from '@/hooks/dashboard';

import React from 'react';
import { ChartBarMultiple } from '@/components/charts/chart-bar-multiple';
import { DashboardProjectsTable } from '@/components/charts/dashboard-projects-table';
import { getProjectsDashboard } from '@/services/projects.service';

const PERIOD_OPTIONS = ['T1', 'T2', 'T3'] as const;
const PERIOD_MONTH_LABELS: Record<(typeof PERIOD_OPTIONS)[number], string> = {
  T1: 'ene-abr',
  T2: 'may-ago',
  T3: 'sep-dic',
};

const Page = () => {
  const currentYear = new Date().getFullYear();
  const [period, setPeriod] = React.useState<(typeof PERIOD_OPTIONS)[number]>('T1');
  const [year, setYear] = React.useState<string>(String(currentYear));
  const selectedYear = Number(year);
  const yearForQueries = Number.isInteger(selectedYear) ? selectedYear : currentYear;

  const { data, isLoading, isError } = useProjectsDashboard(
    period,
    yearForQueries,
  );

  const periodQueries = useQueries({
    queries: PERIOD_OPTIONS.map((periodOption) => ({
      queryKey: ['dashboard-projects', periodOption, yearForQueries],
      queryFn: () => getProjectsDashboard(periodOption, yearForQueries),
    })),
  });

  const chartBarData = React.useMemo(
    () =>
      PERIOD_OPTIONS.map((periodOption, index) => {
        const periodData = periodQueries[index]?.data;

        return {
          period: periodOption,
          students: periodData?.kpis.studentsInProjects ?? 0,
          teachers: periodData?.kpis.teachersInProjects ?? 0,
        };
      }),
    [periodQueries],
  );

  const isChartBarLoading = periodQueries.some((query) => query.isLoading);

  const yearOptions = React.useMemo(
    () => Array.from({ length: 5 }, (_, index) => String(currentYear - 4 + index)),
    [currentYear],
  );

  return (
    <div>
      <Header>
        <HeaderHeading>
          <HeaderTitle>Metricas de Proyectos</HeaderTitle>
          <HeaderDescription>
            Gestiona las métricas de los proyectos existentes.
          </HeaderDescription>
        </HeaderHeading>
      </Header>
      <PageContent>
        <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center md:mb-4 md:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Periodo -</span>
            <Select
              value={period}
              onValueChange={(value: (typeof PERIOD_OPTIONS)[number]) =>
                setPeriod(value)
              }
            >
              <SelectTrigger className="w-28 border-zinc-500">
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map((option) => (
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
            <div className="flex flex-col gap-4 p-3 sm:p-4 md:gap-5 md:p-5 lg:flex-row lg:items-stretch lg:gap-6 lg:p-6 xl:gap-6 xl:p-6">
              <div className="w-full lg:w-2/5 xl:w-5/12">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-1 lg:gap-4 xl:grid-cols-1 xl:gap-4 2xl:grid-cols-2">
                  <ChartRadial
                  title="Total Proyectos"
                  description={`Periodo ${data.period}: ${PERIOD_MONTH_LABELS[data.period]}`}
                  value={data.kpis.totalProjects}
                  label="Proyectos"
                  color="#242D55"
                  />
                  <ChartRadial
                    title="Estudiantes en proyectos"
                    description="Participacion estudiantil"
                    value={data.kpis.studentsInProjects}
                    label="Estudiantes"
                    color="#DBA936"
                  />
                  <ChartRadial
                  title="Maestros en proyectos"
                  description="Participacion docente"
                  value={data.kpis.teachersInProjects}
                  label="Maestros"
                  color="#1F6E8C"
                  />
                </div>
              </div>

              <div className="w-full lg:flex lg:w-3/5 lg:items-center xl:w-7/12">
                <ChartBarMultiple
                data={chartBarData}
                year={yearForQueries}
                isLoading={isChartBarLoading}
                />
              </div>
            </div>

            <div className="p-2 md:p-4 lg:p-6 xl:p-6 lg:w-full">
              <DashboardProjectsTable dateRange={data.dateRange} />
            </div>

          </div>

        ) : null}
      </PageContent>
    </div>
  );
};
export default Page;
