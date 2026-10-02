"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Clock, MapPin, Menu, Phone, X } from "lucide-react";
import { clinica } from "@/content/clinica";
import { IconoRed } from "./IconosRedes";

const enlaces = [
  { href: "/#tratamientos", texto: "Tratamientos" },
  { href: "/#equipo", texto: "Equipo" },
  { href: "/#instalaciones", texto: "Instalaciones" },
  { href: "/#testimonios", texto: "Testimonios" },
  { href: "/#contacto", texto: "Contacto" },
];

export function Header() {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <div className="hidden bg-marino text-sm text-white/90 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-2">
          <div className="flex items-center gap-6">
            <a href={clinica.mapaHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white">
              <MapPin className="size-4 text-aqua" aria-hidden />
              {clinica.direccion}, {clinica.ciudad.split(",")[0]}
            </a>
            <Link href="/#horario" className="hidden items-center gap-2 hover:text-white lg:flex">
              <Clock className="size-4 text-aqua" aria-hidden />
              Lunes a sábado
            </Link>
          </div>
          <div className="flex items-center gap-5">
            <a href={clinica.telefonoHref} className="flex items-center gap-2 hover:text-white">
              <Phone className="size-4 text-aqua" aria-hidden />
              {clinica.telefono}
            </a>
            <ul className="flex items-center gap-3 border-l border-white/20 pl-5">
              {clinica.redes.map((r) => (
                <li key={r.nombre}>
                  <a href={r.href} aria-label={r.nombre} className="block hover:text-aqua">
                    <IconoRed nombre={r.nombre} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <nav className="sticky top-0 z-40 border-b border-hielo-200 bg-white/95 backdrop-blur" aria-label="Principal">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6">
          <Link href="/" aria-label="DentalCare, inicio" className="shrink-0">
            <Image src="/images/logo-horizontal.png" alt="DentalCare" width={893} height={200} className="h-8 w-auto sm:h-11 lg:h-12" preload />
          </Link>

          <ul className="hidden items-center gap-7 text-[15px] font-medium text-marino lg:flex">
            {enlaces.map((e) => (
              <li key={e.href}>
                <a href={e.href} className="py-2 transition-colors hover:text-azul">
                  {e.texto}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <Link
              href="/reservar"
              className="rounded-full bg-azul px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-azul-700"
            >
              Reservar cita
            </Link>
            <button
              type="button"
              onClick={() => setAbierto((v) => !v)}
              aria-expanded={abierto}
              aria-controls="menu-movil"
              aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
              className="rounded-full p-2.5 text-marino hover:bg-hielo lg:hidden"
            >
              {abierto ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>

        {abierto && (
          <ul id="menu-movil" className="border-t border-hielo-200 px-4 pb-4 lg:hidden">
            {enlaces.map((e) => (
              <li key={e.href}>
                <a
                  href={e.href}
                  onClick={() => setAbierto(false)}
                  className="block border-b border-hielo py-3.5 text-lg font-medium text-marino"
                >
                  {e.texto}
                </a>
              </li>
            ))}
            <li>
              <a href={clinica.telefonoHref} className="flex items-center gap-2 pt-4 text-texto">
                <Phone className="size-4 text-azul" aria-hidden /> {clinica.telefono}
              </a>
            </li>
          </ul>
        )}
      </nav>
    </>
  );
}
