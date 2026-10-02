import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import { dentistas, nombreCompleto, tratamientos } from "@/content/clinica";

const porSlug = Object.fromEntries(dentistas.map((d) => [d.slug, d]));

export function Tratamientos() {
  return (
    <section id="tratamientos" className="bg-white py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="text-4xl font-semibold sm:text-5xl">Tratamientos para cada etapa de tu sonrisa</h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed">
            Te decimos desde el inicio cuánto toma cada tratamiento y quién te va a atender. Los tiempos son
            aproximados y los confirmamos en tu valoración.
          </p>
          <div className="relative mt-8 hidden aspect-[4/3] overflow-hidden rounded-3xl lg:block">
            <Image
              src="/images/estetica-color.jpg"
              alt="Odontólogo mostrando a un paciente la guía de colores para elegir el tono de sus dientes"
              fill
              sizes="(min-width: 1024px) 40vw, 0px"
              className="object-cover object-[70%_center]"
            />
          </div>
        </div>

        <ul className="divide-y divide-hielo-200 border-y border-hielo-200">
          {tratamientos.filter((t) => !t.soloReserva).map((t) => (
            <li key={t.slug} className="grid gap-x-6 gap-y-2 py-6 sm:grid-cols-[1fr_auto]">
              <div>
                <h3 className="text-2xl font-semibold">{t.nombre}</h3>
                <p className="mt-1.5 leading-relaxed">{t.descripcion}</p>
                <p className="mt-2 text-sm text-texto/80">
                  Con {t.dentistas.map((s) => nombreCompleto(porSlug[s])).join(" o ")}
                </p>
              </div>
              <p className="flex items-center gap-2 self-start text-sm font-semibold text-azul sm:max-w-44 sm:justify-end sm:text-right">
                <Clock className="size-4 shrink-0" aria-hidden />
                {t.duracion}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <p className="lg:col-start-2">
          ¿No sabes qué necesitas?{" "}
          <Link href="/reservar" className="font-semibold text-azul underline decoration-2 underline-offset-4 hover:text-azul-700">
            Agenda una valoración
          </Link>{" "}
          y te orientamos.
        </p>
      </div>
    </section>
  );
}
