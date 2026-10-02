import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { clinica, horarioClinica } from "@/content/clinica";
import { filasPorDia } from "@/lib/horarios";
import { IconoRed } from "./IconosRedes";

export function Contacto() {
  return (
    <section id="contacto" className="relative overflow-hidden bg-marino py-20 text-white lg:py-24">
      <div className="absolute -top-40 -right-40 size-[28rem] rounded-full bg-azul/40 blur-3xl" aria-hidden />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:items-start">
        <div>
          <h2 className="text-4xl font-semibold text-white sm:text-5xl">Tu próxima sonrisa empieza con una cita</h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/85">
            Elige especialista, tratamiento y horario en línea. Te confirmamos la cita por correo.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/reservar"
              className="rounded-full bg-white px-7 py-3.5 text-center font-semibold text-marino transition-colors hover:bg-hielo"
            >
              Reservar cita en línea
            </Link>
            <a
              href={clinica.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-full border-2 border-white/30 px-7 py-3 font-semibold transition-colors hover:border-white"
            >
              <IconoRed nombre="WhatsApp" className="size-5" />
              Escríbenos por WhatsApp
            </a>
          </div>

          <address className="mt-12 space-y-5 not-italic">
            <p className="flex gap-4">
              <MapPin className="mt-0.5 size-5 shrink-0 text-aqua" aria-hidden />
              <span>
                {clinica.direccion}
                <br />
                {clinica.ciudad}
                <br />
                <a
                  href={clinica.mapaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block font-semibold text-aqua underline-offset-4 hover:underline"
                >
                  Cómo llegar
                </a>
              </span>
            </p>
            <p className="flex gap-4">
              <Phone className="mt-0.5 size-5 shrink-0 text-aqua" aria-hidden />
              <a href={clinica.telefonoHref} className="hover:underline">
                {clinica.telefono} <span className="text-white/70">(llamadas y WhatsApp)</span>
              </a>
            </p>
            <p className="flex gap-4">
              <Mail className="mt-0.5 size-5 shrink-0 text-aqua" aria-hidden />
              <a href={`mailto:${clinica.email}`} className="break-all hover:underline">
                {clinica.email}
              </a>
            </p>
          </address>
        </div>

        <div id="horario" className="rounded-3xl bg-white/[0.07] p-7 ring-1 ring-white/10 sm:p-8">
          <h3 className="flex items-center gap-3 font-sans text-lg font-semibold text-white">
            <Clock className="size-5 text-aqua" aria-hidden />
            Horario de atención
          </h3>
          <table className="mt-5 w-full text-left">
            <tbody>
              {filasPorDia(horarioClinica).map((f) => (
                <tr key={f.dia} className="border-b border-white/10 last:border-0">
                  <th scope="row" className="py-3 pr-4 font-medium">
                    {f.dia}
                  </th>
                  <td className={`py-3 text-right tabular-nums ${f.horas === "Cerrado" ? "text-white/60" : ""}`}>
                    {f.horas}
                  </td>
                </tr>
              ))}
              <tr>
                <th scope="row" className="py-3 pr-4 font-medium">
                  Festivos
                </th>
                <td className="py-3 text-right text-white/60">Cerrado</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-5 text-sm leading-relaxed text-white/70">
            Cada especialista atiende en días y horas distintos. Al reservar en línea solo verás los turnos disponibles de
            quien elijas.
          </p>
        </div>
      </div>
    </section>
  );
}
