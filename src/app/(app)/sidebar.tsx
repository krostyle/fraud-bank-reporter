"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Files } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Casos", icon: Files },
  { href: "/estadisticas", label: "Estadísticas", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r bg-primary text-primary-foreground">
      <div className="px-4 py-5">
        <span className="font-semibold tracking-tight">
          Sistema de Gestión de Fraudes
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary-foreground/15 font-medium"
                  : "hover:bg-primary-foreground/10",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-primary-foreground/15 px-4 py-4">
        <UserButton showName />
      </div>
    </aside>
  );
}
