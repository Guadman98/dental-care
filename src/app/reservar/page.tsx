import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { dentistas, tratamientos } from "@/content/clinica";
import { obtenerDisponibilidad } from "./acciones";
import { Reserva } from "./Reserva";

export const metadata: Metadata = {
  title: "Reservar cita | DentalCare",
  description: "Elige tratamiento, especialista y horario, y solicita tu cita en DentalCare Palmira.",
};

export default async function Reservar({ searchParams }: PageProps<"/reservar">) {
  const { dentista, tratamiento } = await searchParams;
  const dentistaInicial = dentistas.some((d) => d.slug === dentista) ? (dentista as string) : undefined;
  const t = tratamientos.find((x) => x.slug === tratamiento && (!dentistaInicial || x.dentistas.includes(dentistaInicial)));
  // Si el tratamiento lo hace un solo especialista, ya queda elegido.
  const dentistaElegido = dentistaInicial ?? (t?.dentistas.length === 1 ? t.dentistas[0] : undefined);
  // Con tratamiento y especialista definidos, la agenda llega lista desde el servidor.
  const agendaInicial = t && dentistaElegido ? await obtenerDisponibilidad(dentistaElegido, t.slug) : undefined;

  return (
    <>
      <Header />
      <main className="bg-hielo">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:py-20">
          <h1 className="text-4xl font-semibold sm:text-5xl">Reserva tu cita</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed">
            Elige qué necesitas, con quién y cuándo. Tu solicitud queda pendiente hasta que la confirmemos por correo,
            normalmente el mismo día hábil.
          </p>
          <Reserva
            dentistaInicial={dentistaInicial}
            dentistaElegido={dentistaElegido}
            tratamientoInicial={t?.slug}
            agendaInicial={agendaInicial}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
