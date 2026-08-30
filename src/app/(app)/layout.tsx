import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { ImportDialog } from "@/components/import-dialog";

export default async function AppLayout({
  children,
}: LayoutProps<"/">) {
  await auth.protect();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between bg-primary px-6 py-3 text-primary-foreground">
        <span className="font-semibold tracking-tight">
          Sistema de Gestión de Fraudes
        </span>
        <UserButton />
      </header>
      <div className="flex justify-end border-b bg-muted/30 px-6 py-2">
        <ImportDialog />
      </div>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
