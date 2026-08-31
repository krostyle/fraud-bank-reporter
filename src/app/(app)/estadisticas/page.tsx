import { auth } from "@clerk/nextjs/server";
import { getEstadisticas, type Periodo } from "@/lib/casos/estadisticas";
import { getOpcionesFiltro } from "@/lib/casos/where";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CasosFilters } from "../casos-filters";
import { PeriodoFilter } from "./periodo-filter";
import { EvolucionChart } from "./evolucion-chart";
import { GeografiaChart } from "./geografia-chart";
import { TribunalesChart } from "./tribunales-chart";
import { EstadoChart } from "./estado-chart";
import { ResponsableChart } from "./responsable-chart";

function unwrap(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value || undefined;
}

const PERIODOS_VALIDOS: Periodo[] = ["actual", "ultimoAnio", "historico"];

export default async function EstadisticasPage({
  searchParams,
}: PageProps<"/estadisticas">) {
  await auth.protect();

  const params = await searchParams;
  const periodoParam = unwrap(params.periodo);
  const periodo = PERIODOS_VALIDOS.includes(periodoParam as Periodo)
    ? (periodoParam as Periodo)
    : "actual";

  const activoParam = unwrap(params.activo);
  const activo: "activos" | "inactivos" | "todos" =
    activoParam === "inactivos" || activoParam === "todos" ? activoParam : "activos";

  const filters = {
    q: unwrap(params.q),
    estado: unwrap(params.estado),
    subStatus: unwrap(params.subStatus),
    propietario: unwrap(params.propietario),
    abogado: unwrap(params.abogado),
    regionId: unwrap(params.regionId),
    comunaId: unwrap(params.comunaId),
    periodo,
    activo,
  };

  const [estadisticas, opcionesFiltro] = await Promise.all([
    getEstadisticas(filters),
    getOpcionesFiltro(),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-wrap items-end gap-3">
        <CasosFilters
          estadosDisponibles={opcionesFiltro.estadosDisponibles}
          subStatusesDisponibles={opcionesFiltro.subStatusesDisponibles}
          propietariosDisponibles={opcionesFiltro.propietariosDisponibles}
          abogadosDisponibles={opcionesFiltro.abogadosDisponibles}
          regionesDisponibles={opcionesFiltro.regionesDisponibles}
          comunasDisponibles={opcionesFiltro.comunasDisponibles}
        />
        <PeriodoFilter />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <EvolucionChart data={estadisticas.evolucionMensual} />
        <GeografiaChart data={estadisticas.geografia} />
        <TribunalesChart
          buckets={estadisticas.resolucionTribunal.buckets}
          sinResolucion={estadisticas.resolucionTribunal.sinResolucion}
        />
        <EstadoChart data={estadisticas.porEstado} />
        <ResponsableChart data={estadisticas.cargaPorAbogado} />
        <Card>
          <CardHeader>
            <CardTitle>Tiempo promedio asignación → presentación (MP)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {estadisticas.promedioDiasAsignacionPresentacionMp === null
              ? "Sin datos suficientes"
              : `${estadisticas.promedioDiasAsignacionPresentacionMp.toLocaleString("es-CL", {
                  maximumFractionDigits: 1,
                })} días`}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
