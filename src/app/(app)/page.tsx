import Link from "next/link";
import { getCasosDashboard } from "@/lib/casos/dashboard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { CasosFilters } from "./casos-filters";

function unwrap(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value || undefined;
}

const dash = (value: string | null) => value ?? "—";

export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;

  const activoParam = unwrap(params.activo);
  const activo =
    activoParam === "inactivos" || activoParam === "todos"
      ? activoParam
      : "activos";
  const page = Number(unwrap(params.page)) || 1;

  const dashboard = await getCasosDashboard({
    q: unwrap(params.q),
    estado: unwrap(params.estado),
    subStatus: unwrap(params.subStatus),
    propietario: unwrap(params.propietario),
    abogado: unwrap(params.abogado),
    regionId: unwrap(params.regionId),
    comunaId: unwrap(params.comunaId),
    activo,
    page,
  });

  const currentParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === "page") continue;
    const v = unwrap(value);
    if (v) currentParams.set(key, v);
  }

  const hrefForPage = (targetPage: number) => {
    const p = new URLSearchParams(currentParams);
    if (targetPage > 1) p.set("page", String(targetPage));
    const qs = p.toString();
    return qs ? `/?${qs}` : "/";
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6 p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Casos activos</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {dashboard.kpis.activos}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Casos inactivos</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {dashboard.kpis.inactivos}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monto suspendido (CLP)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {dashboard.kpis.montoTotalSuspendidoClp.toLocaleString("es-CL", {
              style: "currency",
              currency: "CLP",
              maximumFractionDigits: 0,
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Activos por estado</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {dashboard.kpis.porEstado.length === 0 && (
              <span className="text-sm text-muted-foreground">Sin datos</span>
            )}
            {dashboard.kpis.porEstado.map((grupo) => (
              <Badge key={grupo.estado} variant="secondary">
                {grupo.estado}: {grupo.count}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>

      <CasosFilters
        estadosDisponibles={dashboard.estadosDisponibles}
        subStatusesDisponibles={dashboard.subStatusesDisponibles}
        propietariosDisponibles={dashboard.propietariosDisponibles}
        abogadosDisponibles={dashboard.abogadosDisponibles}
        regionesDisponibles={dashboard.regionesDisponibles}
        comunasDisponibles={dashboard.comunasDisponibles}
      />

      <div className="rounded-xl ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>OT</TableHead>
              <TableHead>Sub Status</TableHead>
              <TableHead>Abogado</TableHead>
              <TableHead>Estado Acción Legal</TableHead>
              <TableHead>Estado Denuncia</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dashboard.casos.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No hay Casos que coincidan con los filtros.
                </TableCell>
              </TableRow>
            )}
            {dashboard.casos.map((caso) => (
              <TableRow key={caso.ot}>
                <TableCell>
                  <Link href={`/casos/${caso.ot}`} className="text-primary hover:underline">
                    {caso.ot}
                  </Link>
                </TableCell>
                <TableCell>{dash(caso.subStatus)}</TableCell>
                <TableCell>{dash(caso.abogadoAsignado)}</TableCell>
                <TableCell>{dash(caso.estadoAccionLegal)}</TableCell>
                <TableCell>{dash(caso.estadoFiscalia)}</TableCell>
                <TableCell>
                  <Badge variant={caso.activo ? "default" : "outline"}>
                    {caso.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {dashboard.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={hrefForPage(Math.max(1, dashboard.page - 1))}
              />
            </PaginationItem>
            <PaginationItem className="px-2 text-sm text-muted-foreground">
              Página {dashboard.page} de {dashboard.totalPages}
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href={hrefForPage(
                  Math.min(dashboard.totalPages, dashboard.page + 1),
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
