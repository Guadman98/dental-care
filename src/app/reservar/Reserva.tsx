"use client";

import Link from "next/link";
import { cloneElement, useActionState, useState, useTransition } from "react";
import { CalendarCheck, Check, Clock, LoaderCircle } from "lucide-react";
import { clinica, dentistas, nombreCompleto, tratamientos } from "@/content/clinica";
import { fechaLarga, instante, ZONA } from "@/lib/fechas";
import { formatoHora } from "@/lib/horarios";
import { obtenerDisponibilidad, solicitarCita, type Disponibilidad, type EstadoSolicitud } from "./acciones";

type Props = {
  dentistaInicial?: string; // filtra los tratamientos (llega desde "Agendar con…")
  dentistaElegido?: string;
  tratamientoInicial?: string;
  agendaInicial?: Disponibilidad;
};

const chipFecha = (fecha: string) => {
  const f = instante(fecha, "12:00");
  const p = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("es-CO", { timeZone: ZONA, ...o }).format(f);
  return { dia: p({ weekday: "short" }).replace(".", ""), num: p({ day: "numeric" }), mes: p({ month: "short" }).replace(".", "") };
};

export function Reserva({ dentistaInicial, dentistaElegido, tratamientoInicial, agendaInicial }: Props) {
  const opcionesTratamiento = tratamientos.filter((t) => !dentistaInicial || t.dentistas.includes(dentistaInicial));

  const [tratamiento, setTratamiento] = useState(tratamientoInicial);
  const [dentista, setDentista] = useState(dentistaElegido);
  const [agenda, setAgenda] = useState<Disponibilidad | null>(agendaInicial ?? null);
  const [fecha, setFecha] = useState<string | undefined>(
    agendaInicial?.ok ? Object.keys(agendaInicial.dias)[0] : undefined,
  );
  const [hora, setHora] = useState<string>();
  const [cargando, iniciar] = useTransition();

  const t = tratamientos.find((x) => x.slug === tratamiento);
  const d = dentistas.find((x) => x.slug === dentista);
  const opcionesDentista = t ? dentistas.filter((x) => t.dentistas.includes(x.slug)) : [];

  function cargarAgenda(dent: string, trat: string) {
    setAgenda(null);
    setFecha(undefined);
    setHora(undefined);
    iniciar(async () => {
      const r = await obtenerDisponibilidad(dent, trat);
      setAgenda(r);
      if (r.ok) setFecha(Object.keys(r.dias)[0]);
    });
  }

  function elegirTratamiento(slug: string) {
    setTratamiento(slug);
    const posibles = tratamientos.find((x) => x.slug === slug)!.dentistas;
    // Si el especialista elegido no hace este tratamiento, se limpia; si solo hay uno, se elige solo.
    const siguiente = dentista && posibles.includes(dentista) ? dentista : posibles.length === 1 ? posibles[0] : undefined;
    setDentista(siguiente);
    if (siguiente) cargarAgenda(siguiente, slug);
    else setAgenda(null);
  }

  function elegirDentista(slug: string) {
    setDentista(slug);
    if (tratamiento) cargarAgenda(slug, tratamiento);
  }

  const [estado, enviar, enviando] = useActionState(async (previo: EstadoSolicitud, form: FormData) => {
    const r = await solicitarCita(previo, form);
    if (r.estado === "error" && r.turnoOcupado && dentista && tratamiento) cargarAgenda(dentista, tratamiento);
    return r;
  }, { estado: "inicial" } as EstadoSolicitud);

  if (estado.estado === "enviada" && t && d && fecha && hora) {
    return (
      <div className="mt-10 rounded-3xl bg-white p-8 text-center sm:p-12" role="status">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-hielo text-azul">
          <CalendarCheck className="size-8" aria-hidden />
        </div>
        <h2 className="mt-6 text-3xl font-semibold">¡Solicitud enviada!</h2>
        <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed">
          {t.nombre} con {nombreCompleto(d)}, el {fechaLarga(fecha)} a las {formatoHora(hora)}
        </p>
        <p className="mx-auto mt-3 max-w-md leading-relaxed">
          Te escribiremos a <strong className="text-marino">{estado.email}</strong> cuando confirmemos la cita. Si tienes
          alguna duda, llámanos o escríbenos al {clinica.telefono}.
        </p>
        <Link href="/" className="mt-8 inline-block rounded-full bg-azul px-7 py-3 font-semibold text-white hover:bg-azul-700">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const errores = estado.estado === "error" ? (estado.campos ?? {}) : {};
  const valores = estado.estado === "error" ? (estado.valores ?? {}) : {};
  const fechas = agenda?.ok ? Object.keys(agenda.dias) : [];
  const horas = agenda?.ok && fecha ? (agenda.dias[fecha] ?? []) : [];

  return (
    <div className="mt-10 space-y-6">
      <Paso numero={1} titulo="¿Qué necesitas?" listo={!!t}>
        <div className="grid gap-3 sm:grid-cols-2">
          {opcionesTratamiento.map((x) => (
            <Opcion key={x.slug} activa={tratamiento === x.slug} onClick={() => elegirTratamiento(x.slug)}>
              <span className="block font-semibold text-marino">{x.nombre}</span>
              <span className="mt-0.5 flex items-center gap-1.5 text-sm">
                <Clock className="size-3.5" aria-hidden /> Cita de {x.citaMinutos} min
              </span>
            </Opcion>
          ))}
        </div>
        {dentistaInicial && (
          <p className="mt-4 text-sm">
            Mostrando los tratamientos de {nombreCompleto(dentistas.find((x) => x.slug === dentistaInicial)!)}.{" "}
            <Link href="/reservar" className="font-semibold text-azul underline-offset-4 hover:underline">
              Ver todos
            </Link>
          </p>
        )}
      </Paso>

      {t && (
        <Paso numero={2} titulo="¿Con quién?" listo={!!d}>
          <div className="grid gap-3 sm:grid-cols-2">
            {opcionesDentista.map((x) => (
              <Opcion key={x.slug} activa={dentista === x.slug} onClick={() => elegirDentista(x.slug)}>
                <span className="block font-semibold text-marino">{nombreCompleto(x)}</span>
                <span className="mt-0.5 block text-sm">{x.area}</span>
              </Opcion>
            ))}
          </div>
        </Paso>
      )}

      {t && d && (
        <Paso numero={3} titulo="¿Cuándo?" listo={!!hora}>
          {cargando && (
            <p className="flex items-center gap-2" role="status">
              <LoaderCircle className="size-5 animate-spin text-azul" aria-hidden /> Buscando horarios libres…
            </p>
          )}
          {agenda && !agenda.ok && <p className="font-medium text-red-700">{agenda.error}</p>}
          {agenda?.ok && fechas.length === 0 && (
            <p>
              No hay turnos libres en los próximos días con {nombreCompleto(d)}. Escríbenos por{" "}
              <a href={clinica.whatsappHref} className="font-semibold text-azul underline">
                WhatsApp
              </a>{" "}
              y buscamos un espacio.
            </p>
          )}
          {agenda?.ok && fechas.length > 0 && (
            <>
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2" role="group" aria-label="Fechas disponibles">
                {fechas.map((f) => {
                  const c = chipFecha(f);
                  const activa = f === fecha;
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => {
                        setFecha(f);
                        setHora(undefined);
                      }}
                      aria-pressed={activa}
                      aria-label={fechaLarga(f)}
                      className={`flex w-16 shrink-0 flex-col items-center rounded-2xl border-2 py-2.5 transition-colors ${
                        activa ? "border-azul bg-azul text-white" : "border-hielo-200 bg-white text-marino hover:border-azul"
                      }`}
                    >
                      <span className="text-xs capitalize">{c.dia}</span>
                      <span className="text-xl font-semibold">{c.num}</span>
                      <span className="text-xs">{c.mes}</span>
                    </button>
                  );
                })}
              </div>
              {fecha && (
                <>
                  <p className="mt-4 font-medium text-marino first-letter:uppercase">{fechaLarga(fecha)}</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5" role="group" aria-label="Horas disponibles">
                    {horas.map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setHora(h)}
                        aria-pressed={hora === h}
                        className={`rounded-xl border-2 py-2.5 text-sm font-semibold tabular-nums transition-colors ${
                          hora === h ? "border-azul bg-azul text-white" : "border-hielo-200 bg-white text-marino hover:border-azul"
                        }`}
                      >
                        {formatoHora(h)}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </Paso>
      )}

      {t && d && fecha && hora && (
        <Paso numero={4} titulo="Tus datos" listo={false}>
          <p className="rounded-2xl bg-hielo p-4 text-marino">
            <strong>{t.nombre}</strong> con {nombreCompleto(d)}
            <br />
            <span className="first-letter:uppercase">{fechaLarga(fecha)}</span> a las {formatoHora(hora)}
          </p>

          <form action={enviar} className="mt-6 grid gap-5 sm:grid-cols-2" noValidate>
            <input type="hidden" name="tratamiento" value={t.slug} />
            <input type="hidden" name="dentista" value={d.slug} />
            <input type="hidden" name="fecha" value={fecha} />
            <input type="hidden" name="hora" value={hora} />
            <div className="hidden" aria-hidden>
              <label>
                No llenar <input name="sitio_web" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <Campo nombre="nombre" etiqueta="Nombre completo" error={errores.nombre} className="sm:col-span-2">
              <input name="nombre" defaultValue={valores.nombre} autoComplete="name" required maxLength={120} />
            </Campo>
            <Campo nombre="telefono" etiqueta="Celular" error={errores.telefono}>
              <input name="telefono" defaultValue={valores.telefono} type="tel" autoComplete="tel" inputMode="tel" required placeholder="315 123 4567" />
            </Campo>
            <Campo nombre="email" etiqueta="Correo electrónico" error={errores.email}>
              <input name="email" defaultValue={valores.email} type="email" autoComplete="email" required />
            </Campo>
            <Campo nombre="notas" etiqueta="¿Algo que debamos saber? (opcional)" error={errores.notas} className="sm:col-span-2">
              <textarea name="notas" defaultValue={valores.notas} rows={3} maxLength={1000} placeholder="Por ejemplo: tengo sensibilidad, es para mi hijo de 7 años…" />
            </Campo>

            <label className="flex gap-3 text-sm leading-relaxed sm:col-span-2">
              <input type="checkbox" name="autorizacion" value="si" required className="mt-1 size-4 shrink-0 accent-azul" />
              <span>
                Autorizo a {clinica.nombre} a tratar mis datos personales para gestionar mi cita y contactarme sobre ella,
                conforme a la Ley 1581 de 2012.
                {errores.autorizacion && <span className="mt-1 block font-medium text-red-700">{errores.autorizacion}</span>}
              </span>
            </label>

            {estado.estado === "error" && (
              <p className="font-medium text-red-700 sm:col-span-2" role="alert">
                {estado.mensaje}
              </p>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="flex items-center justify-center gap-2 rounded-full bg-azul px-7 py-3.5 font-semibold text-white transition-colors hover:bg-azul-700 disabled:opacity-60 sm:col-span-2 sm:justify-self-start"
            >
              {enviando && <LoaderCircle className="size-5 animate-spin" aria-hidden />}
              {enviando ? "Enviando…" : "Solicitar cita"}
            </button>
          </form>
        </Paso>
      )}
    </div>
  );
}

function Paso({ numero, titulo, listo, children }: { numero: number; titulo: string; listo: boolean; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-white p-6 sm:p-8" aria-labelledby={`paso-${numero}`}>
      <h2 id={`paso-${numero}`} className="mb-5 flex items-center gap-3 font-sans text-xl font-semibold">
        <span
          className={`grid size-8 shrink-0 place-items-center rounded-full text-sm ${listo ? "bg-azul text-white" : "bg-hielo text-marino"}`}
          aria-hidden
        >
          {listo ? <Check className="size-4" /> : numero}
        </span>
        {titulo}
      </h2>
      {children}
    </section>
  );
}

function Opcion({ activa, onClick, children }: { activa: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      className={`rounded-2xl border-2 p-4 text-left transition-colors ${
        activa ? "border-azul bg-hielo" : "border-hielo-200 hover:border-azul/50"
      }`}
    >
      {children}
    </button>
  );
}

function Campo({
  nombre,
  etiqueta,
  error,
  className = "",
  children,
}: {
  nombre: string;
  etiqueta: string;
  error?: string;
  className?: string;
  children: React.ReactElement<React.InputHTMLAttributes<HTMLInputElement>>;
}) {
  return (
    <div className={className}>
      <label htmlFor={nombre} className="mb-1.5 block text-sm font-semibold text-marino">
        {etiqueta}
      </label>
      <div
        className={`[&>*]:w-full [&>*]:rounded-xl [&>*]:border-2 [&>*]:bg-white [&>*]:px-4 [&>*]:py-3 [&>*]:text-marino [&>*]:outline-none [&>*]:focus:border-azul ${
          error ? "[&>*]:border-red-600" : "[&>*]:border-hielo-200"
        }`}
      >
        {/* El id y aria-invalid se añaden aquí para no repetirlos en cada campo. */}
        {cloneElement(children, { id: nombre, "aria-invalid": !!error, "aria-describedby": error ? `${nombre}-error` : undefined })}
      </div>
      {error && (
        <p id={`${nombre}-error`} className="mt-1.5 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
