"use client";

import { useSearchParams } from "next/navigation";
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
  count: { label: "Casos", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function GeografiaChart({
  data,
}: {
  data: Array<{ nombre: string; count: number; montoClp: number }>;
}) {
  const searchParams = useSearchParams();
  const porComuna = Boolean(searchParams.get("regionId"));

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Distribución geográfica {porComuna ? "(por Comuna)" : "(por Región)"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay Casos con Región/Comuna resuelta en el período seleccionado.
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
                dataKey="nombre"
                type="category"
                tickLine={false}
                axisLine={false}
                width={120}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name, item) => {
                      if (name !== "count") return String(value);
                      const monto = (item.payload as { montoClp: number }).montoClp;
                      return `${value} casos — ${monto.toLocaleString("es-CL", {
                        style: "currency",
                        currency: "CLP",
                        maximumFractionDigits: 0,
                      })}`;
                    }}
                  />
                }
              />
              <Bar dataKey="count" fill="var(--color-count)" radius={4} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
