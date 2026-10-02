import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { IconoRed } from "@/components/IconosRedes";
import { dentistas, nombreCompleto, tratamientos } from "@/content/clinica";
import { sesionAdmin } from "@/lib/admin";
import { fechaLarga, fechaLocal, horaLocal } from "@/lib/fechas";
import { formatoHora } from "@/lib/horarios";
import { actualizarCita } from "../acciones";

type Cita = {
  id: string;
  dentista: string;
  tratamiento: string;
  inicio: string;
  estado: "pendiente" | "confirmada" | "rechazada" | "cancelada";
  paciente_nombre: string;
  paciente_telefono: string;
  paciente_email: string;
  notas: string | null;
  respuesta: string | null;
  creada_en: string;
};

const vistas = {
  pendientes: "Por confirmar",
  proximas: "Próximas confirmadas",
  historial: "Historial",
} as const;
type Vista = keyof typeof vistas;

const etiquetaEstado: Record<Cita["estado"], string> = {
  pendiente: "bg-amber-100 text-amber-900",
  confirmada: "bg-emerald-100 text-emerald-900",
  rechazada: "bg-slate-200 text-slate-700",
  cancelada: "bg-slate-200 text-slate-700",
};

export default async function Citas({ searchParams }: PageProps<"/admin">) {
  const params = await searchParams;
  const vista: Vista = typeof params.vista === "string" && params.vista in vistas ? (params.vista as Vista) : "pendientes";
  const dentista = dentistas.some((d) => d.slug === params.dentista) ? (params.dentista as string) : undefined;

  const { supabase } = await sesionAdmin();
  const ahora = new Date().toISOString();
  let consulta = supabase.from("citas").select("*");
  if (vista === "pendientes") consulta = consulta.eq("estado", "pendiente").order("inicio");
  if (vista === "proximas") consulta = consulta.eq("estado", "confirmada").gte("inicio", ahora).order("inicio");
  if (vista === "historial")
    consulta = consulta.or(`inicio.lt."${ahora}",estado.in.(rechazada,cancelada)`).order("inicio", { ascending: false });
  if (dentista) consulta = consulta.eq("dentista", dentista);
  const { data, error } = await consulta.limit(200);

  const { count: pendientes } = await supabase
    .from("citas")
    .select("id", { count: "exact", head: true })
    .eq("estado", "pendiente");

  // Agrupar por día para leer la agenda de corrido.
  const porDia = new Map<string, Cita[]>();
  for (const c of (data ?? []) as Cita[]) {
    const dia = fechaLocal(new Date(c.inicio));
    porDia.set(dia, [...(porDia.get(dia) ?? []), c]);
  }

  const enlace = (cambios: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const v = { vista, dentista, ...cambios };
    if (v.vista && v.vista !== "pendientes") p.set("vista", v.vista);
    if (v.dentista) p.set("dentista", v.dentista);
    return `/admin${p.size ? `?${p}` : ""}`;
  };

  return (
    <>
      <h1 className="text-3xl font-semibold">Citas</h1>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {(Object.keys(vistas) as Vista[]).map((v) => (
          <Link
            key={v}
            href={enlace({ vista: v })}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
              vista === v ? "bg-marino text-white" : "bg-white text-marino hover:bg-hielo-200"
            }`}
          >
            {vistas[v]}
            {v === "pendientes" && !!pendientes && (
              <span className="rounded-full bg-amber-400 px-2 text-xs text-marino">{pendientes}</span>
            )}
          </Link>
        ))}
      </div>
      {/* En celular los filtros se desplazan de lado en vez de ocupar varias filas. */}
      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 text-sm whitespace-nowrap sm:mx-0 sm:flex-wrap sm:px-0">
        <Link
          href={enlace({ dentista: undefined })}
          className={`rounded-full px-3 py-1.5 ${!dentista ? "bg-azul text-white" : "bg-white text-marino hover:bg-hielo-200"}`}
        >
          Todos
        </Link>
        {dentistas.map((d) => (
          <Link
            key={d.slug}
            href={enlace({ dentista: d.slug })}
            className={`rounded-full px-3 py-1.5 ${dentista === d.slug ? "bg-azul text-white" : "bg-white text-marino hover:bg-hielo-200"}`}
          >
            {nombreCompleto(d)}
          </Link>
        ))}
      </div>

      {error && <p className="mt-8 font-medium text-red-700">No se pudieron cargar las citas: {error.message}</p>}
      {!error && porDia.size === 0 && (
        <p className="mt-8 rounded-3xl bg-white p-8 text-center">No hay citas en esta vista.</p>
      )}

      <div className="mt-8 space-y-10">
        {[...porDia].map(([dia, citas]) => (
          <section key={dia}>
            <h2 className="font-sans text-lg font-semibold first-letter:uppercase">{fechaLarga(dia)}</h2>
            <ul className="mt-3 space-y-3">
              {citas.map((c) => (
                <TarjetaCita key={c.id} cita={c} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}

function TarjetaCita({ cita: c }: { cita: Cita }) {
  const d = dentistas.find((x) => x.slug === c.dentista);
  const t = tratamientos.find((x) => x.slug === c.tratamiento);
  const telefono = c.paciente_telefono.replace(/\D/g, "");
  const whatsapp = `https://wa.me/${telefono.length === 10 ? `57${telefono}` : telefono}`;
  const activa = c.estado === "pendiente" || c.estado === "confirmada";

  return (
    <li className="grid gap-5 rounded-2xl bg-white p-5 sm:p-6 lg:grid-cols-[9rem_1fr_auto]">
      <div>
        <p className="text-xl font-semibold text-marino tabular-nums">{formatoHora(horaLocal(new Date(c.inicio)))}</p>
        <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${etiquetaEstado[c.estado]}`}>
          {c.estado}
        </span>
      </div>

      <div className="min-w-0">
        <p className="font-semibold text-marino">
          {t?.nombre ?? c.tratamiento} · {d ? nombreCompleto(d) : c.dentista}
        </p>
        <p className="mt-1 text-lg text-marino">{c.paciente_nombre}</p>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <a href={`tel:${c.paciente_telefono}`} className="flex items-center gap-1.5 hover:text-azul">
            <Phone className="size-3.5" aria-hidden /> {c.paciente_telefono}
          </a>
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-azul">
            <IconoRed nombre="WhatsApp" className="size-3.5" /> WhatsApp
          </a>
          <a href={`mailto:${c.paciente_email}`} className="flex min-w-0 items-center gap-1.5 break-all hover:text-azul">
            <Mail className="size-3.5 shrink-0" aria-hidden /> {c.paciente_email}
          </a>
        </div>
        {c.notas && <p className="mt-3 rounded-xl bg-hielo px-4 py-2.5 text-sm">“{c.notas}”</p>}
        {c.respuesta && <p className="mt-2 text-sm">Respuesta enviada: {c.respuesta}</p>}
        <p className="mt-2 text-xs text-texto/70">
          Solicitada el {fechaLarga(fechaLocal(new Date(c.creada_en)))} a las{" "}
          {formatoHora(horaLocal(new Date(c.creada_en)))}
        </p>
      </div>

      {activa && (
        // En pantallas medianas: dos botones del mismo ancho; en grandes, una columna a la derecha.
        <div className="grid grid-cols-2 content-start gap-2 sm:max-w-md lg:w-56 lg:grid-cols-1">
          {c.estado === "pendiente" && (
            <form action={actualizarCita}>
              <input type="hidden" name="id" value={c.id} />
              <input type="hidden" name="estado" value="confirmada" />
              <button
                type="submit"
                className="w-full rounded-full border-2 border-azul bg-azul px-5 py-2 text-sm font-semibold text-white hover:border-azul-700 hover:bg-azul-700"
              >
                Confirmar
              </button>
            </form>
          )}
          <details className={`group open:col-span-2 lg:open:col-span-1 ${c.estado === "pendiente" ? "" : "col-span-2 sm:col-span-1"}`}>
            <summary className="cursor-pointer list-none rounded-full border-2 border-hielo-200 px-5 py-2 text-center text-sm font-semibold text-marino hover:border-marino/30">
              {c.estado === "pendiente" ? "Rechazar" : "Cancelar cita"}
            </summary>
            <form action={actualizarCita} className="mt-3 space-y-2">
              <input type="hidden" name="id" value={c.id} />
              <input type="hidden" name="estado" value={c.estado === "pendiente" ? "rechazada" : "cancelada"} />
              <label className="block text-xs font-semibold text-marino">
                Mensaje para el paciente (opcional)
                <textarea
                  name="respuesta"
                  rows={3}
                  maxLength={1000}
                  placeholder="Ej.: Ese día la doctora no estará. ¿Te sirve el jueves a la misma hora?"
                  className="mt-1 w-full rounded-xl border-2 border-hielo-200 px-3 py-2 text-sm font-normal outline-none focus:border-azul"
                />
              </label>
              <button type="submit" className="w-full rounded-full bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-800">
                {c.estado === "pendiente" ? "Rechazar y avisar" : "Cancelar y avisar"}
              </button>
            </form>
          </details>
        </div>
      )}
    </li>
  );
}
