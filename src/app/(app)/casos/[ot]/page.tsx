import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { getCasoByOt } from "@/lib/casos/detalle";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const dash = (value: string | null) => value ?? "—";
const dashDate = (value: Date | null) =>
  value ? value.toLocaleDateString("es-CL") : "—";
const dashClp = (value: { toNumber(): number } | null) =>
  value
    ? value.toNumber().toLocaleString("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
      })
    : "—";

function Dato({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Seccion({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
        {titulo}
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </div>
  );
}

export default async function CasoDetallePage({
  params,
}: PageProps<"/casos/[ot]">) {
  const { ot } = await params;
  const caso = await getCasoByOt(ot);

  if (!caso) notFound();

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:underline"
        >
          <ArrowLeftIcon className="size-4" />
          Volver a Casos
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">
            Caso {caso.ot}
            {caso.nombreContacto ? ` — ${caso.nombreContacto}` : ""}
          </h1>
          <Badge variant={caso.activo ? "default" : "outline"}>
            {caso.activo ? "Activo" : "Inactivo"}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="datos">
        <TabsList>
          <TabsTrigger value="datos">Datos del Caso</TabsTrigger>
          <TabsTrigger value="mp">Medida Precautoria (MP)</TabsTrigger>
          <TabsTrigger value="demanda">Demanda</TabsTrigger>
        </TabsList>

        <TabsContent value="datos" className="pt-4">
          <Card>
            <CardContent className="flex flex-col gap-6">
              <Seccion titulo="Cliente">
                <Dato label="Cliente" value={dash(caso.nombreContacto)} />
                <Dato label="RUT" value={dash(caso.rut)} />
                <Dato label="Localidad" value={dash(caso.localidadComunaRegion)} />
              </Seccion>
              <Seccion titulo="Denuncia">
                <Dato label="OT" value={caso.ot} />
                <Dato label="Monto reclamado" value={dashClp(caso.montoTotalSuspendidoClp)} />
                <Dato label="Fecha reclamo" value={dashDate(caso.fechaRecepcion)} />
                <Dato label="Estado de la denuncia" value={dash(caso.estadoFiscalia)} />
              </Seccion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mp" className="pt-4">
          <Card>
            <CardContent className="flex flex-col gap-6">
              <Seccion titulo="Tribunal">
                <Dato label="Tribunal" value={dash(caso.tribunal)} />
                <Dato label="Número del Tribunal" value={dash(caso.numeroTribunal)} />
                <Dato label="Rol" value={dash(caso.rol)} />
              </Seccion>
              <Seccion titulo="Resolución">
                <Dato label="Resolución tribunal" value={dash(caso.resolucionTribunal)} />
                <Dato
                  label="Fecha resolución tribunal"
                  value={dashDate(caso.fechaResolucionTribunal)}
                />
                <Dato
                  label="Fecha notificación resolución tribunal"
                  value={dashDate(caso.fechaNotificacionResolucionTribunal)}
                />
                <Dato label="Abogado Asignado" value={dash(caso.abogadoAsignado)} />
                <Dato
                  label="Fecha de asignación abogado"
                  value={dashDate(caso.fechaCreacionAccionLegal)}
                />
                <Dato label="Fecha de presentación" value={dashDate(caso.fechaPresentacion)} />
              </Seccion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demanda" className="pt-4">
          <p className="text-sm text-muted-foreground">Próximamente.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
