"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  count: { label: "Casos", color: "var(--chart-4)" },
} satisfies ChartConfig;

export function EstadoChart({
  data,
}: {
  data: Array<{ estado: string; count: number }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado de la Acción Legal</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay Casos en el período seleccionado.
          </p>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto"
            style={{ height: Math.max(300, data.length * 32) }}
          >
            <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
              <YAxis
                dataKey="estado"
                type="category"
                tickLine={false}
                axisLine={false}
                width={140}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={4} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
