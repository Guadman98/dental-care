import Image from "next/image";
import Link from "next/link";
import { clinica, horarioClinica, tratamientos } from "@/content/clinica";
import { resumirHorario } from "@/lib/horarios";
import { IconoRed } from "./IconosRedes";

export function Footer() {
  return (
    <footer className="bg-marino-900 text-white/75">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Image src="/images/logo-horizontal-blanco.png" alt="DentalCare" width={880} height={200} className="h-11 w-auto" />
          <p className="mt-5 max-w-xs leading-relaxed">
            {clinica.lema} {clinica.lemaSecundario}
          </p>
          <ul className="mt-6 flex gap-3">
            {clinica.redes.map((r) => (
              <li key={r.nombre}>
                <a
                  href={r.href}
                  aria-label={r.nombre}
                  className="grid size-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-azul"
                >
                  <IconoRed nombre={r.nombre} className="size-[18px]" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Secciones">
          <h2 className="font-sans text-sm font-semibold text-white">La clínica</h2>
          <ul className="mt-4 space-y-2.5">
            <li><Link href="/#equipo" className="hover:text-white">Equipo</Link></li>
            <li><Link href="/#instalaciones" className="hover:text-white">Instalaciones</Link></li>
            <li><Link href="/#testimonios" className="hover:text-white">Testimonios</Link></li>
            <li><Link href="/reservar" className="hover:text-white">Reservar cita</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="font-sans text-sm font-semibold text-white">Tratamientos</h2>
          <ul className="mt-4 space-y-2.5">
            {tratamientos.filter((t) => !t.soloReserva).map((t) => (
              <li key={t.slug}>
                <Link href="/#tratamientos" className="hover:text-white">{t.nombre}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-sans text-sm font-semibold text-white">Contacto</h2>
          <ul className="mt-4 space-y-2.5">
            <li>{clinica.direccion}<br />{clinica.ciudad}</li>
            <li><a href={clinica.telefonoHref} className="hover:text-white">{clinica.telefono}</a></li>
            <li><a href={`mailto:${clinica.email}`} className="break-all hover:text-white">{clinica.email}</a></li>
          </ul>
          <dl className="mt-5 space-y-1 text-sm">
            {resumirHorario(horarioClinica, { corto: true }).map((h) => (
              <div key={h.dias} className="flex flex-wrap gap-x-2">
                <dt className="text-white">{h.dias}</dt>
                <dd className="tabular-nums">{h.horas}</dd>
              </div>
            ))}
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-white">Dom. y festivos</dt>
              <dd>Cerrado</dd>
            </div>
          </dl>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-6 text-sm sm:px-6">
          © {new Date().getFullYear()} {clinica.nombre}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
