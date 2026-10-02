import type { Metadata } from "next";
import Image from "next/image";
import { FormularioLogin } from "./FormularioLogin";

export const metadata: Metadata = { title: "Ingresar | Panel DentalCare", robots: { index: false } };

export default function Login() {
  return (
    <main className="grid min-h-dvh place-items-center bg-hielo px-4 py-12">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8">
        <Image src="/images/logo-horizontal.png" alt="DentalCare" width={893} height={200} className="h-10 w-auto" preload />
        <h1 className="mt-8 text-3xl font-semibold">Panel de citas</h1>
        <p className="mt-2">Ingresa con la cuenta que te dio el administrador.</p>
        <FormularioLogin />
      </div>
    </main>
  );
}
