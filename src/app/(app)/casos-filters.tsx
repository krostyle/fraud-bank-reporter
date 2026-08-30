"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TODOS_LOS_ESTADOS = "__todos__";

export function CasosFilters({
  estadosDisponibles,
}: {
  estadosDisponibles: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [ubicacion, setUbicacion] = useState(searchParams.get("ubicacion") ?? "");

  function navigate(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(overrides)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page");
    router.push(params.size > 0 ? `${pathname}?${params.toString()}` : pathname);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    navigate({ q, ubicacion });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="q">Buscar</Label>
        <Input
          id="q"
          placeholder="OT, RUT o nombre"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          className="w-56"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ubicacion">Región / Comuna</Label>
        <Input
          id="ubicacion"
          placeholder="Ej. Recoleta"
          value={ubicacion}
          onChange={(event) => setUbicacion(event.target.value)}
          className="w-48"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Estado</Label>
        <Select
          value={searchParams.get("estado") ?? TODOS_LOS_ESTADOS}
          onValueChange={(value) =>
            navigate({ estado: value === TODOS_LOS_ESTADOS ? undefined : String(value) })
          }
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS_LOS_ESTADOS}>Todos</SelectItem>
            {estadosDisponibles.map((estado) => (
              <SelectItem key={estado} value={estado}>
                {estado}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Mostrar</Label>
        <Select
          value={searchParams.get("activo") ?? "activos"}
          onValueChange={(value) => navigate({ activo: String(value) })}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="activos">Activos</SelectItem>
            <SelectItem value="inactivos">Inactivos</SelectItem>
            <SelectItem value="todos">Todos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit">Buscar</Button>
    </form>
  );
}
