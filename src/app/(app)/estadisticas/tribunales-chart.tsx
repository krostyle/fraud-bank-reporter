"use client";

import { Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  Acoge: { label: "Acoge", color: "var(--chart-1)" },
  Rechaza: { label: "Rechaza", color: "var(--chart-2)" },
  Otros: { label: "Otros", color: "var(--chart-3)" },
} satisfies ChartConfig;

export function TribunalesChart({
  buckets,
  sinResolucion,
}: {
  buckets: Array<{ resolucion: "Acoge" | "Rechaza" | "Otros"; count: number }>;
  sinResolucion: number;
}) {
  const data = buckets.map((b) => ({ ...b, fill: `var(--color-${b.resolucion})` }));
  const totalConResolucion = buckets.reduce((acc, b) => acc + b.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resultado de los tribunales</CardTitle>
      </CardHeader>
      <CardContent>
        {totalConResolucion === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavía no hay Casos con resolución en el período seleccionado.
          </p>
        ) : (
          <>
            <ChartContainer config={chartConfig}>
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="resolucion" />} />
                <Pie data={data} dataKey="count" nameKey="resolucion" innerRadius={50} />
                <ChartLegend content={<ChartLegendContent nameKey="resolucion" />} />
              </PieChart>
            </ChartContainer>
            <p className="text-center text-sm text-muted-foreground">
              {sinResolucion} caso{sinResolucion === 1 ? "" : "s"} todavía sin resolución
              (no incluido{sinResolucion === 1 ? "" : "s"} arriba).
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
