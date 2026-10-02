import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { sesionAdmin } from "@/lib/admin";
import { cerrarSesion } from "../acciones";

export const metadata: Metadata = { title: "Panel | DentalCare", robots: { index: false } };

export default async function LayoutPanel({ children }: LayoutProps<"/admin">) {
  const sesion = await sesionAdmin();

  return (
    <div className="min-h-dvh bg-hielo">
      <header className="border-b border-hielo-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-8">
            <Link href="/admin" aria-label="Panel de citas">
              <Image src="/images/logo-horizontal.png" alt="DentalCare" width={893} height={200} className="h-7 w-auto sm:h-9" />
            </Link>
            {sesion.autorizado && (
              <nav className="flex text-sm font-semibold sm:gap-1" aria-label="Panel">
                <Link href="/admin" className="rounded-full px-2.5 py-2 text-marino hover:bg-hielo sm:px-4">
                  Citas
                </Link>
                <Link href="/admin/bloqueos" className="rounded-full px-2.5 py-2 text-marino hover:bg-hielo sm:px-4">
                  Bloqueos<span className="hidden sm:inline"> de agenda</span>
                </Link>
              </nav>
            )}
          </div>
          <form action={cerrarSesion} className="flex shrink-0 items-center gap-3 text-sm">
            <span className="hidden sm:inline">{sesion.nombre ?? sesion.email}</span>
            <button type="submit" className="flex items-center gap-1.5 rounded-full px-3 py-2 font-semibold text-marino hover:bg-hielo">
              <LogOut className="size-4" aria-hidden /> Salir
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {sesion.autorizado ? (
          children
        ) : (
          <div className="rounded-3xl bg-white p-8">
            <h1 className="text-2xl font-semibold">Tu cuenta no tiene acceso al panel</h1>
            <p className="mt-2">
              Iniciaste sesión como {sesion.email}, pero esta cuenta no está registrada como administradora. Pide a quien
              gestiona el sitio que la agregue.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
