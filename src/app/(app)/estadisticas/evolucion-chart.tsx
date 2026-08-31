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

const MESES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

const chartConfig = {
  count: { label: "Casos nuevos", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function EvolucionChart({
  data,
}: {
  data: Array<{ mes: string; count: number }>;
}) {
  const chartData = data.map(({ mes, count }) => {
    const [anio, mesNumero] = mes.split("-");
    return { label: `${MESES[Number(mesNumero) - 1]} ${anio}`, count };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolución temporal</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay Casos con fecha en el período seleccionado.
          </p>
        ) : (
          <ChartContainer config={chartConfig}>
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={4} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
