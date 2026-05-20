'use client';

import {
  Header,
  HeaderDescription,
  HeaderHeading,
  HeaderTitle,
} from '@/components/header';
import { PageContent } from '@/components/page-content';

import { ChartArea } from '@/components/charts/chart-area';
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

import React from 'react';

const PERIOD_OPTIONS = ['T1', 'T2', 'T3'] as const;

const Page = () => {
  const currentYear = new Date().getFullYear();
  const [period, setPeriod] = React.useState<(typeof PERIOD_OPTIONS)[number]>('T1');
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

  const formatTrendLabel = React.useCallback((label: string) => {
    const match = /^(\d{4})-(\d{2})$/.exec(label);

    if (!match) {
      return label;
    }

    const [, yearPart, monthPart] = match;
    const parsedMonth = Number(monthPart);

    if (!Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      return label;
    }

    const date = new Date(Number(yearPart), parsedMonth - 1, 1);

    return date.toLocaleDateString('es-ES', {
      month: 'short',
      year: 'numeric',
    });
  }, []);

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
          <div className='flex justify-center'>
            <div className='flex flex-row gap-2 p-4 justify-center'>
              <div className='flex flex-col gap-2 justify-start basis-1/3'>
                <div className='basis-2/3 flex justify-center gap-4 p-2 max-h-80'>
                    <ChartRadial
                    title="Total Eventos"
                    description={`Periodo ${data.period}`}
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
                <div className='basis-1/3 flex justify-center gap-2 p-2 max-h-100'>
                    <ChartRadialStacked
                    title="Distribucion por sexo"
                    description="Asistencia reportada en eventos"
                    men={data.sexBreakdown.men}
                    women={data.sexBreakdown.women}
                    />
                </div>
              </div>
              <div className='flex flex-col gap-4 p-2 basis-2/3 justify-center items-center'>
                <div className='w-150 basis-1/2'>
                    <ChartArea
                    title="Tendencia Mensual"
                    description={`Periodo: ${new Date(data.dateRange.startDate).toLocaleDateString()} - ${new Date(data.dateRange.endDate).toLocaleDateString()}`}
                    data={data.trend}
                    metric="participants"
                    cumulative={true}
                  />
                </div>
                <div className='basis-1/2 w-150 h-40 border rounded-md border-zinc-500 p-4'>
                  <div className='h-full w-full overflow-auto'>
                    <table className='w-full text-sm'>
                      <thead>
                        <tr className='border-b text-left'>
                          <th className='py-2 pr-3 font-semibold'>Mes</th>
                          <th className='py-2 px-3 font-semibold'>Eventos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.trend.map((item, index) => (
                          <tr key={`${item.label}-${index}`} className='border-b last:border-b-0'>
                            <td className='py-2 pr-3'>{formatTrendLabel(item.label)}</td>
                            <td className='py-2 px-3'>{item.events}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </PageContent>
    </div>
  );
};
export default Page;