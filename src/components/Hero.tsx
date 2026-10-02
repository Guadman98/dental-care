import Image from "next/image";
import Link from "next/link";
import { Baby, CalendarCheck, ShieldCheck, Stethoscope } from "lucide-react";
import { clinica, dentistas } from "@/content/clinica";

const aniosExperiencia = dentistas.reduce((t, d) => t + d.experienciaAnios, 0);

const destacados = [
  { icono: Stethoscope, texto: `${dentistas.length} especialistas` },
  { icono: CalendarCheck, texto: `${aniosExperiencia} años de experiencia sumada` },
  { icono: Baby, texto: "Niños, jóvenes y adultos" },
  { icono: ShieldCheck, texto: "Esterilización en cada cita" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-hielo">
      {/* Curva orgánica del borde izquierdo de la foto (solo en escritorio). */}
      <svg width="0" height="0" className="absolute" aria-hidden>
        <clipPath id="curva-hero" clipPathUnits="objectBoundingBox">
          <path d="M0.2,0 C0.04,0.16 0.14,0.36 0.07,0.55 C0,0.74 0.06,0.9 0.16,1 L1,1 L1,0 Z" />
        </clipPath>
      </svg>

      <div className="mx-auto grid max-w-7xl lg:min-h-[600px] lg:grid-cols-[1.05fr_1fr]">
        <div className="relative z-10 px-4 pt-12 pb-10 sm:px-6 lg:py-20 lg:pr-4">
          <h1 className="text-[2.6rem] leading-[1.05] font-semibold sm:text-6xl">
            {clinica.lema}
            <span className="mt-2 block text-azul">{clinica.lemaSecundario}</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed">
            Cuatro especialistas bajo un mismo techo para cuidar la salud y la estética de tu sonrisa, desde la primera
            visita de tus hijos hasta un implante.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/reservar"
              className="rounded-full bg-azul px-7 py-3.5 text-center font-semibold text-white shadow-lg shadow-azul/20 transition-colors hover:bg-azul-700"
            >
              Reservar cita en línea
            </Link>
            <a
              href="#tratamientos"
              className="rounded-full border-2 border-marino/15 bg-white px-7 py-3 text-center font-semibold text-marino transition-colors hover:border-azul hover:text-azul"
            >
              Ver tratamientos
            </a>
          </div>

          <ul className="mt-12 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-marino/10 pt-8 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {destacados.map(({ icono: Icono, texto }) => (
              <li key={texto} className="flex items-start gap-3 text-sm leading-snug font-medium text-marino">
                <Icono className="mt-0.5 size-5 shrink-0 text-azul" strokeWidth={1.75} aria-hidden />
                {texto}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-4 mb-10 h-72 overflow-hidden rounded-3xl sm:mx-6 sm:h-96 lg:absolute lg:inset-y-0 lg:right-0 lg:mx-0 lg:mb-0 lg:h-auto lg:w-[50%] lg:rounded-none lg:[clip-path:url(#curva-hero)]">
          <Image
            src="/images/hero-atencion.jpg"
            alt="Odontóloga de DentalCare atendiendo a una paciente en el consultorio"
            fill
            preload
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover object-[60%_center]"
          />
        </div>
      </div>
    </section>
  );
}
