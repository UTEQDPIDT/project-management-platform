"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";

type PeriodLabel = "T1" | "T2" | "T3";

type ChartBarMultipleData = {
    period: PeriodLabel;
    students: number;
    teachers: number;
};

type ChartBarMultipleProps = {
    data: ChartBarMultipleData[];
    year: number;
    isLoading?: boolean;
};

const PERIOD_MONTH_LABELS: Record<PeriodLabel, string> = {
    T1: "ene-abr",
    T2: "may-ago",
    T3: "sep-dic",
};

const chartConfig = {
    students: {
        label: "Estudiantes",
        color: "#DBA936",
    },
    teachers: {
        label: "Maestros",
        color: "#242D55",
    },
} satisfies ChartConfig;

export function ChartBarMultiple({ data, year, isLoading }: ChartBarMultipleProps) {
    const chartData = data.map((item) => ({
        ...item,
        periodLabel: PERIOD_MONTH_LABELS[item.period],
    }));
    const maxStudents = Math.max(0, ...chartData.map((item) => item.students));
    const yAxisMax = Math.max(5, Math.round(maxStudents) + 5);

    return (
        <Card className="w-full border-black">
        <CardHeader>
            <CardTitle>Participacion en Proyectos por Cuatrimestre</CardTitle>
            <CardDescription>Año: {year}</CardDescription>
        </CardHeader>
        <CardContent>
            {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando grafica...</p>
            ) : (
            <div className="space-y-4">
                <div className="w-full overflow-x-auto">
                    <div className="min-w-120 md:min-w-0 lg:min-w-160">
                        <ChartContainer config={chartConfig}>
                        <BarChart accessibilityLayer data={chartData}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                            dataKey="periodLabel"
                            tickLine={true}
                            tickMargin={10}
                            axisLine={true}
                            />
                            <YAxis
                            domain={[0, yAxisMax]}
                            allowDecimals={false}
                            tickLine={true}
                            axisLine={true}
                            />
                            <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Bar dataKey="students" fill="#DBA936" radius={3}>
                            <LabelList dataKey="students" position="top" fill="#000000" fontSize={12} />
                            </Bar>
                            <Bar dataKey="teachers" fill="#242D55" radius={3}>
                            <LabelList dataKey="teachers" position="top" fill="#000000" fontSize={12} />
                            </Bar>
                        </BarChart>
                        </ChartContainer>
                    </div>
                </div>

                <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded" style={{ backgroundColor: '#DBA936' }} />
                    <span>Estudiantes</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded" style={{ backgroundColor: '#242D55' }} />
                    <span>Maestros</span>
                </div>
                </div>
            </div>
            )}
        </CardContent>
        </Card>
    );
}
