"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

type TrendPoint = {
  label: string
  events: number
  participants: number
}

type ChartAreaProps = {
  title: string
  description?: string
  data: TrendPoint[]
  metric?: "events" | "participants"
  cumulative?: boolean
  yMin?: number
  yMax?: number
  className?: string
}

const chartConfig = {
  events: {
    label: "Eventos",
    color: "#DBA936",
  },
  participants: {
    label: "Participantes",
    color: "#242D55",
  },
} satisfies ChartConfig

const cumulativeColorByMetric = {
  events: "#DBA936",
  participants: "#242D55",
} as const

function formatTrendLabel(label: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(label)

  if (!match) {
    return label
  }

  const [, year, month] = match
  const parsedMonth = Number(month)

  if (!Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
    return label
  }

  const date = new Date(Number(year), parsedMonth - 1, 1)

  return date.toLocaleDateString("es-ES", {
    month: "short",
    year: "numeric",
  })
}

export function ChartArea({
  title,
  description,
  data,
  metric = "participants",
  cumulative = false,
  yMin,
  yMax,
  className,
}: ChartAreaProps) {
  const yDomain: [number, number | "auto"] =
    typeof yMin === "number" && typeof yMax === "number"
      ? [yMin, yMax]
      : [0, "auto"]

  const chartData = cumulative
    ? data.reduce<TrendPoint[]>((acc, point) => {
        const previous = acc[acc.length - 1]?.[metric] ?? 0
        acc.push({
          ...point,
          [metric]: previous + point[metric],
        })
        return acc
      }, [])
    : data

  const seriesColor = cumulative
    ? cumulativeColorByMetric[metric]
    : chartConfig[metric].color

  return (
    <Card className={cn("h-full border-black", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer
          config={chartConfig}
          className="w-full min-h-56 aspect-video sm:min-h-64 lg:h-full lg:min-h-0 lg:aspect-auto"
        >
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={true}
              axisLine={true}
              tickMargin={8}
              tickFormatter={formatTrendLabel}
            />
            <YAxis
              domain={yDomain}
              tickLine={true}
              axisLine={true}
              tickMargin={8}
              allowDecimals={false}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(value) =>
                    typeof value === "string" ? formatTrendLabel(value) : value
                  }
                />
              }
            />
            <Area
              dataKey={metric}
              type="natural"
              fill={seriesColor}
              fillOpacity={0.3}
              stroke={seriesColor}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
