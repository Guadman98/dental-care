import Image from "next/image";
import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { dentistas, nombreCompleto } from "@/content/clinica";
import { resumirHorario } from "@/lib/horarios";

const compromisos = [
  "Te explicamos el diagnóstico y las opciones antes de empezar",
  "Cada especialista atiende lo que mejor sabe hacer",
  "Seguimiento después de cada tratamiento",
];

const iniciales = (nombre: string) =>
  nombre
    .split(" ")
    .map((p) => p[0])
    .join("");

export function Equipo() {
  return (
    <section id="equipo" className="bg-arena py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* La foto se muestra a tamaño medio: el original es de baja resolución. */}
          <div className="relative mx-auto w-full max-w-[520px]">
            <div className="absolute -inset-3 -z-0 rotate-[-2deg] rounded-3xl bg-hielo-200" aria-hidden />
            <Image
              src="/images/equipo.jpg"
              alt="Parte del equipo de DentalCare con uniforme azul en el consultorio"
              width={770}
              height={512}
              sizes="(min-width: 640px) 520px, 100vw"
              className="relative rounded-3xl"
            />
          </div>

          <div>
            <h2 className="text-4xl font-semibold sm:text-5xl">Un equipo que te escucha antes de tratarte</h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed">
              En DentalCare trabajamos odontólogos de diferentes especialidades. Si tu caso necesita a más de uno, nos
              coordinamos entre nosotros para que no tengas que ir de consultorio en consultorio.
            </p>
            <ul className="mt-7 space-y-3">
              {compromisos.map((c) => (
                <li key={c} className="flex gap-3 font-medium text-marino">
                  <CircleCheck className="mt-0.5 size-5 shrink-0 text-azul" aria-hidden />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <ul className="mt-16 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {dentistas.map((d) => (
            <li key={d.slug} className="flex flex-col rounded-3xl bg-white p-7 ring-1 ring-marino/5">
              {/* Monograma temporal mientras llegan las fotos individuales. */}
              <div
                className="grid size-16 place-items-center rounded-full bg-gradient-to-br from-azul to-aqua font-serif text-xl font-semibold text-white"
                aria-hidden
              >
                {iniciales(d.nombre)}
              </div>
              <h3 className="mt-5 text-2xl font-semibold">{nombreCompleto(d)}</h3>
              <p className="mt-1 font-medium text-azul">{d.area}</p>
              <p className="mt-1 text-sm">{d.experienciaAnios} años de experiencia</p>
              <p className="mt-4 leading-relaxed">{d.bio}</p>
              <dl className="mt-5 space-y-2 rounded-2xl bg-hielo/70 p-4 text-sm">
                {resumirHorario(d.horario).map((h) => (
                  <div key={h.dias}>
                    <dt className="font-semibold text-marino">{h.dias}</dt>
                    <dd className="tabular-nums">{h.horas}</dd>
                  </div>
                ))}
              </dl>
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Especialidades">
                {d.especialidades.map((e) => (
                  <li key={e} className="rounded-full bg-hielo px-3 py-1 text-xs font-medium text-marino">
                    {e}
                  </li>
                ))}
              </ul>
              <Link
                href={`/reservar?dentista=${d.slug}`}
                className="mt-auto pt-6 font-semibold text-azul underline-offset-4 hover:underline"
              >
                Agendar con {d.titulo === "Dra." ? "la" : "el"} {d.titulo} {d.nombre.split(" ")[0]}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
