"use client";

import { useRouter } from "next/navigation";
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
  count: { label: "Casos", color: "var(--chart-5)" },
} satisfies ChartConfig;

export function ResponsableChart({
  data,
}: {
  data: Array<{ abogado: string; count: number }>;
}) {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Carga por responsable</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay Casos con Abogado Asignado en el período seleccionado.
          </p>
        ) : (
          <>
            <ChartContainer
              config={chartConfig}
              className="aspect-auto"
              style={{ height: Math.max(300, data.length * 32) }}
            >
              <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                <YAxis
                  dataKey="abogado"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={140}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="count"
                  fill="var(--color-count)"
                  radius={4}
                  className="cursor-pointer"
                  onClick={(entry) => {
                    const abogado = (entry as { payload?: { abogado?: string } }).payload
                      ?.abogado;
                    if (abogado) {
                      router.push(`/?abogado=${encodeURIComponent(abogado)}`);
                    }
                  }}
                />
              </BarChart>
            </ChartContainer>
            <p className="text-xs text-muted-foreground">
              Hacé clic en una barra para ver los Casos de ese abogado en el dashboard.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
