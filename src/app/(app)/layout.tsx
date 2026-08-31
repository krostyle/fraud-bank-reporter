import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { ImportDialog } from "@/components/import-dialog";

// La importación de CSV puede tardar bastante con archivos grandes
// (varias filas -> varios round-trips a la base); sube el límite de
// ejecución de la función más allá del default para evitar 504.
export const maxDuration = 60;

export default async function AppLayout({
  children,
}: LayoutProps<"/">) {
  await auth.protect();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between bg-primary px-6 py-3 text-primary-foreground">
        <div className="flex items-center gap-6">
          <span className="font-semibold tracking-tight">
            Sistema de Gestión de Fraudes
          </span>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="hover:underline">
              Casos
            </Link>
            <Link href="/estadisticas" className="hover:underline">
              Estadísticas
            </Link>
          </nav>
        </div>
        <UserButton />
      </header>
      <div className="flex justify-end border-b bg-muted/30 px-6 py-2">
        <ImportDialog />
      </div>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
