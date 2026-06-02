"use client"

import {
  Label,
  PolarAngleAxis,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"

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

type ChartRadialStackedProps = {
  title: string
  description?: string
  men: number
  women: number
}

const chartDataTemplate = { men: 0, women: 0 }

const chartConfig = {
  men: {
    label: "Hombres",
    color: "#2563eb",
  },
  women: {
    label: "Mujeres",
    color: "#e11d48",
  },
} satisfies ChartConfig

export function ChartRadialStacked({
  title,
  description,
  men,
  women,
}: ChartRadialStackedProps) {
  const chartData = [{ ...chartDataTemplate, men, women, total: men + women }]
  const total = men + women

  return (
    <Card className="flex w-full max-w-md flex-col border-black">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-62.5"
        >
          <RadialBarChart
            data={chartData}
            startAngle={180}
            endAngle={0}
            innerRadius={80}
            outerRadius={110}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, Math.max(total, 1)]}
              tick={false}
            />
            <RadialBar
              dataKey="men"
              fill={chartConfig.men.color}
              stackId="a"
              cornerRadius={5}
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="women"
              stackId="a"
              cornerRadius={5}
              fill={chartConfig.women.color}
              className="stroke-transparent stroke-2"
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 16}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {total.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-muted-foreground"
                        >
                          Asistencias
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>

        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: chartConfig.men.color }}
            />
            <span className="text-muted-foreground">Hombres</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: chartConfig.women.color }}
            />
            <span className="text-muted-foreground">Mujeres</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
