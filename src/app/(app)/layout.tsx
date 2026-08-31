import { auth } from "@clerk/nextjs/server";
import { ImportDialog } from "@/components/import-dialog";
import { Sidebar } from "./sidebar";

// La importación de CSV puede tardar bastante con archivos grandes
// (varias filas -> varios round-trips a la base); sube el límite de
// ejecución de la función más allá del default para evitar 504.
export const maxDuration = 60;

export default async function AppLayout({
  children,
}: LayoutProps<"/">) {
  await auth.protect();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <div className="flex justify-end border-b bg-muted/30 px-6 py-2">
          <ImportDialog />
        </div>
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
