"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PERIODO_LABELS: Record<string, string> = {
  actual: "Año en curso",
  ultimoAnio: "Último año",
  historico: "Todo el histórico",
};

export function PeriodoFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(value: string | null) {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    if (value === "actual") params.delete("periodo");
    else params.set("periodo", value);
    router.push(params.size > 0 ? `${pathname}?${params.toString()}` : pathname);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label>Período</Label>
      <Select value={searchParams.get("periodo") ?? "actual"} onValueChange={handleChange}>
        <SelectTrigger className="w-44">
          <SelectValue>{(value: string) => PERIODO_LABELS[value] ?? value}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="actual">Año en curso</SelectItem>
          <SelectItem value="ultimoAnio">Último año</SelectItem>
          <SelectItem value="historico">Todo el histórico</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
