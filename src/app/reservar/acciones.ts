"use server";

import { z } from "zod";
import { dentistas, tratamientos } from "@/content/clinica";
import { correoSolicitudRecibida } from "@/lib/correo";
import { instante } from "@/lib/fechas";
import { turnosLibres, ventanaDeReservas, type Rango } from "@/lib/disponibilidad";
import { supabaseSecreto } from "@/lib/supabase/secreto";

function buscar(dentista: string, tratamiento: string) {
  const d = dentistas.find((x) => x.slug === dentista);
  const t = tratamientos.find((x) => x.slug === tratamiento);
  if (!d || !t || !t.dentistas.includes(d.slug)) return null;
  return { d, t };
}

/** Citas activas y bloqueos del dentista dentro de la ventana de reservas. */
async function ocupados(dentista: string, ahora: Date): Promise<Rango[]> {
  const v = ventanaDeReservas(ahora);
  const db = supabaseSecreto();
  const [citas, bloqueos] = await Promise.all([
    db
      .from("citas")
      .select("inicio, fin")
      .eq("dentista", dentista)
      .in("estado", ["pendiente", "confirmada"])
      .lt("inicio", v.fin.toISOString())
      .gt("fin", v.inicio.toISOString()),
    db
      .from("bloqueos")
      .select("inicio, fin")
      .or(`dentista.is.null,dentista.eq.${dentista}`)
      .lt("inicio", v.fin.toISOString())
      .gt("fin", v.inicio.toISOString()),
  ]);
  if (citas.error || bloqueos.error) throw new Error(citas.error?.message ?? bloqueos.error?.message);
  return [...citas.data, ...bloqueos.data].map((r) => ({ inicio: new Date(r.inicio), fin: new Date(r.fin) }));
}

export type Disponibilidad = { ok: true; dias: Record<string, string[]> } | { ok: false; error: string };

export async function obtenerDisponibilidad(dentista: string, tratamiento: string): Promise<Disponibilidad> {
  const par = buscar(dentista, tratamiento);
  if (!par) return { ok: false, error: "Ese especialista no realiza este tratamiento." };
  try {
    const ahora = new Date();
    const dias = turnosLibres({
      horario: par.d.horario,
      duracion: par.t.citaMinutos,
      ocupados: await ocupados(dentista, ahora),
      ahora,
    });
    return { ok: true, dias };
  } catch (error) {
    console.error("[reservas] disponibilidad", error);
    return { ok: false, error: "No pudimos cargar la agenda. Intenta de nuevo en unos minutos." };
  }
}

const esquema = z.object({
  dentista: z.string(),
  tratamiento: z.string(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hora: z.string().regex(/^\d{2}:\d{2}$/),
  nombre: z.string().trim().min(3, "Escribe tu nombre completo.").max(120),
  telefono: z
    .string()
    .transform((s) => s.replace(/[\s()-]/g, ""))
    .pipe(z.string().regex(/^\+?\d{7,15}$/, "Escribe un teléfono válido, por ejemplo 315 123 4567.")),
  email: z.string().trim().toLowerCase().email("Escribe un correo válido."),
  notas: z.string().trim().max(1000).optional(),
  autorizacion: z.literal("si", { message: "Debes autorizar el tratamiento de tus datos para reservar." }),
  // Campo trampa: los humanos no lo ven; los bots suelen llenarlo.
  sitio_web: z.string().max(0).optional(),
});

export type EstadoSolicitud =
  | { estado: "inicial" }
  | {
      estado: "error";
      mensaje: string;
      campos?: Record<string, string>;
      turnoOcupado?: boolean;
      // React vacía el formulario tras cada envío; se devuelven los valores para rellenarlo.
      valores?: Record<string, string>;
    }
  | { estado: "enviada"; email: string };

export async function solicitarCita(previo: EstadoSolicitud, form: FormData): Promise<EstadoSolicitud> {
  const r = await procesarSolicitud(form);
  if (r.estado !== "error") return r;
  const { nombre, telefono, email, notas } = Object.fromEntries(form) as Record<string, string>;
  return { ...r, valores: { nombre, telefono, email, notas } };
}

async function procesarSolicitud(form: FormData): Promise<EstadoSolicitud> {
  const datos = esquema.safeParse(Object.fromEntries(form));
  if (!datos.success) {
    const campos: Record<string, string> = {};
    for (const issue of datos.error.issues) campos[String(issue.path[0])] ??= issue.message;
    return { estado: "error", mensaje: "Revisa los datos marcados.", campos };
  }
  const v = datos.data;
  const par = buscar(v.dentista, v.tratamiento);
  if (!par) return { estado: "error", mensaje: "Ese especialista no realiza este tratamiento." };

  // Se vuelve a calcular la agenda: el turno debe seguir libre y dentro del horario.
  const disponibilidad = await obtenerDisponibilidad(v.dentista, v.tratamiento);
  if (!disponibilidad.ok) return { estado: "error", mensaje: disponibilidad.error };
  if (!disponibilidad.dias[v.fecha]?.includes(v.hora)) {
    return { estado: "error", mensaje: "Ese horario ya no está disponible. Elige otro, por favor.", turnoOcupado: true };
  }

  const inicio = instante(v.fecha, v.hora);
  const fin = new Date(inicio.getTime() + par.t.citaMinutos * 60_000);
  const cita = {
    dentista: v.dentista,
    tratamiento: v.tratamiento,
    inicio: inicio.toISOString(),
    fin: fin.toISOString(),
    paciente_nombre: v.nombre,
    paciente_telefono: v.telefono,
    paciente_email: v.email,
    notas: v.notas || null,
  };

  const { error } = await supabaseSecreto().from("citas").insert(cita);
  if (error) {
    // 23P01: otra persona tomó el mismo turno un instante antes (restricción citas_sin_cruces).
    if (error.code === "23P01") {
      return { estado: "error", mensaje: "Alguien acaba de reservar ese horario. Elige otro, por favor.", turnoOcupado: true };
    }
    console.error("[reservas] insertar cita", error);
    return { estado: "error", mensaje: "No pudimos registrar tu solicitud. Intenta de nuevo o escríbenos por WhatsApp." };
  }

  await correoSolicitudRecibida(cita);
  return { estado: "enviada", email: v.email };
}
