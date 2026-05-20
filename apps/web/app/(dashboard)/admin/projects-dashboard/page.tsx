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

import { useProjectsDashboard } from '@/hooks/dashboard';

import React from 'react';

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

  const { data, isLoading, isError } = useProjectsDashboard(
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
          <HeaderTitle>Metricas de Proyectos</HeaderTitle>
          <HeaderDescription>
            Gestiona las métricas de los proyectos existentes.
          </HeaderDescription>
        </HeaderHeading>
      </Header>
      <PageContent>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
          <div className="flex flex-col gap-6 py-4">
            <div className="flex flex-wrap justify-center gap-4">
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
        ) : null}
      </PageContent>
    </div>
  );
};
export default Page;
