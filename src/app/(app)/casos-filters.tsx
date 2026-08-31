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

const TODOS = "__todos__";

const MOSTRAR_LABELS: Record<string, string> = {
  activos: "Activos",
  inactivos: "Inactivos",
  todos: "Todos",
};

const TODAS_LAS_REGIONES = "__todas__";
const TODAS_LAS_COMUNAS = "__todas__";

type Region = { id: string; nombre: string };
type Comuna = { id: string; nombre: string; regionId: string };

function StringFilterSelect({
  label,
  paramKey,
  options,
  value,
  navigate,
  className = "w-44",
}: {
  label: string;
  paramKey: string;
  options: string[];
  value: string;
  navigate: (overrides: Record<string, string | undefined>) => void;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <Select
        value={value}
        onValueChange={(v) =>
          navigate({ [paramKey]: v === TODOS ? undefined : String(v) })
        }
      >
        <SelectTrigger className={className}>
          <SelectValue>{(v: string) => (v === TODOS ? "Todos" : v)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TODOS}>Todos</SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function CasosFilters({
  estadosDisponibles,
  subStatusesDisponibles,
  propietariosDisponibles,
  abogadosDisponibles,
  regionesDisponibles,
  comunasDisponibles,
}: {
  estadosDisponibles: string[];
  subStatusesDisponibles: string[];
  propietariosDisponibles: string[];
  abogadosDisponibles: string[];
  regionesDisponibles: Region[];
  comunasDisponibles: Comuna[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") ?? "");

  const regionId = searchParams.get("regionId") ?? TODAS_LAS_REGIONES;
  const comunasFiltradas =
    regionId === TODAS_LAS_REGIONES
      ? comunasDisponibles
      : comunasDisponibles.filter((comuna) => comuna.regionId === regionId);

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
    navigate({ q });
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
        <Label>Región</Label>
        <Select
          value={regionId}
          onValueChange={(value) =>
            navigate({
              regionId: value === TODAS_LAS_REGIONES ? undefined : String(value),
              comunaId: undefined,
            })
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue>
              {(value: string) =>
                value === TODAS_LAS_REGIONES
                  ? "Todas"
                  : (regionesDisponibles.find((r) => r.id === value)?.nombre ?? value)
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODAS_LAS_REGIONES}>Todas</SelectItem>
            {regionesDisponibles.map((region) => (
              <SelectItem key={region.id} value={region.id}>
                {region.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Comuna</Label>
        <Select
          value={searchParams.get("comunaId") ?? TODAS_LAS_COMUNAS}
          onValueChange={(value) =>
            navigate({ comunaId: value === TODAS_LAS_COMUNAS ? undefined : String(value) })
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue>
              {(value: string) =>
                value === TODAS_LAS_COMUNAS
                  ? "Todas"
                  : (comunasDisponibles.find((c) => c.id === value)?.nombre ?? value)
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODAS_LAS_COMUNAS}>Todas</SelectItem>
            {comunasFiltradas.map((comuna) => (
              <SelectItem key={comuna.id} value={comuna.id}>
                {comuna.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <StringFilterSelect
        label="Estado"
        paramKey="estado"
        options={estadosDisponibles}
        value={searchParams.get("estado") ?? TODOS}
        navigate={navigate}
      />

      <StringFilterSelect
        label="Sub Status"
        paramKey="subStatus"
        options={subStatusesDisponibles}
        value={searchParams.get("subStatus") ?? TODOS}
        navigate={navigate}
      />

      <StringFilterSelect
        label="Propietario"
        paramKey="propietario"
        options={propietariosDisponibles}
        value={searchParams.get("propietario") ?? TODOS}
        navigate={navigate}
        className="w-56"
      />

      <StringFilterSelect
        label="Abogado"
        paramKey="abogado"
        options={abogadosDisponibles}
        value={searchParams.get("abogado") ?? TODOS}
        navigate={navigate}
        className="w-56"
      />

      <div className="flex flex-col gap-1.5">
        <Label>Mostrar</Label>
        <Select
          value={searchParams.get("activo") ?? "activos"}
          onValueChange={(value) => navigate({ activo: String(value) })}
        >
          <SelectTrigger className="w-36">
            <SelectValue>
              {(value: string) => MOSTRAR_LABELS[value] ?? value}
            </SelectValue>
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
