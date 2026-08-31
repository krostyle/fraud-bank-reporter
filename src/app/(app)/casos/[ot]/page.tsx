import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { getCasoByOt } from "@/lib/casos/detalle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const dash = (value: string | null) => value ?? "—";
const dashDate = (value: Date | null) =>
  value ? value.toLocaleDateString("es-CL") : "—";

function Dato({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
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
        <h1 className="text-xl font-semibold">
          Caso {caso.ot}
          {caso.nombreContacto ? ` — ${caso.nombreContacto}` : ""}
        </h1>
      </div>

      <Tabs defaultValue="demanda">
        <TabsList>
          <TabsTrigger value="datos">Datos del Caso</TabsTrigger>
          <TabsTrigger value="mp">Medida Precautoria (MP)</TabsTrigger>
          <TabsTrigger value="demanda">Demanda</TabsTrigger>
        </TabsList>

        <TabsContent value="datos" className="pt-4">
          <p className="text-sm text-muted-foreground">Próximamente.</p>
        </TabsContent>

        <TabsContent value="mp" className="pt-4">
          <p className="text-sm text-muted-foreground">Próximamente.</p>
        </TabsContent>

        <TabsContent value="demanda" className="pt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Dato label="OT" value={caso.ot} />
            <Dato label="Cliente" value={dash(caso.nombreContacto)} />
            <Dato label="RUT" value={dash(caso.rut)} />
            <Dato label="Localidad" value={dash(caso.localidadComunaRegion)} />
            <Dato
              label="Monto reclamado"
              value={
                caso.montoTotalSuspendidoClp
                  ? caso.montoTotalSuspendidoClp.toNumber().toLocaleString("es-CL", {
                      style: "currency",
                      currency: "CLP",
                      maximumFractionDigits: 0,
                    })
                  : "—"
              }
            />
            <Dato label="Fecha reclamo" value={dashDate(caso.fechaRecepcion)} />
            <Dato label="Estado de la denuncia" value={dash(caso.estadoFiscalia)} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
