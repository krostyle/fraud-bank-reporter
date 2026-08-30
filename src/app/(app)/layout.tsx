import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

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
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
