"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { dentistas } from "@/content/clinica";
import { exigirAdmin } from "@/lib/admin";
import { correoRespuesta } from "@/lib/correo";
import { instante, sumarDias } from "@/lib/fechas";
import { supabaseServidor } from "@/lib/supabase/servidor";

// ─── Sesión ────────────────────────────────────────────────────────────
export type EstadoLogin = { error?: string };

export async function iniciarSesion(_previo: EstadoLogin, form: FormData): Promise<EstadoLogin> {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "Escribe tu correo y tu contraseña." };

  const supabase = await supabaseServidor();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Correo o contraseña incorrectos." };
  redirect("/admin");
}

export async function cerrarSesion() {
  const supabase = await supabaseServidor();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ─── Citas ─────────────────────────────────────────────────────────────
const cambioCita = z.object({
  id: z.uuid(),
  estado: z.enum(["confirmada", "rechazada", "cancelada"]),
  respuesta: z.string().trim().max(1000).optional(),
});

// Transiciones permitidas: solo se confirma o rechaza lo pendiente, y solo se cancela lo activo.
const desde: Record<string, string[]> = {
  confirmada: ["pendiente"],
  rechazada: ["pendiente"],
  cancelada: ["pendiente", "confirmada"],
};

export async function actualizarCita(form: FormData) {
  const { supabase, userId } = await exigirAdmin();
  const v = cambioCita.parse(Object.fromEntries(form));

  const { data: cita, error } = await supabase
    .from("citas")
    .update({ estado: v.estado, respuesta: v.respuesta || null, gestionada_por: userId })
    .eq("id", v.id)
    .in("estado", desde[v.estado])
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  // Si otra persona del equipo ya la gestionó, no se reenvía el correo.
  if (cita) await correoRespuesta(cita, v.estado);
  revalidatePath("/admin");
}

// ─── Bloqueos de agenda ────────────────────────────────────────────────
const nuevoBloqueo = z
  .object({
    dentista: z.string().refine((s) => s === "" || dentistas.some((d) => d.slug === s)),
    fecha_desde: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    fecha_hasta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    hora_desde: z.string().regex(/^\d{2}:\d{2}$/).or(z.literal("")),
    hora_hasta: z.string().regex(/^\d{2}:\d{2}$/).or(z.literal("")),
    motivo: z.string().trim().max(200),
  })
  .transform((v) => ({
    dentista: v.dentista || null,
    inicio: instante(v.fecha_desde, v.hora_desde || "00:00"),
    // Sin hora final, el bloqueo cubre el último día completo.
    fin: v.hora_hasta ? instante(v.fecha_hasta, v.hora_hasta) : instante(sumarDias(v.fecha_hasta, 1), "00:00"),
    motivo: v.motivo || null,
  }));

export async function crearBloqueo(form: FormData) {
  const { supabase, userId } = await exigirAdmin();
  const datos = nuevoBloqueo.safeParse(Object.fromEntries(form));
  if (!datos.success || datos.data.fin <= datos.data.inicio) redirect("/admin/bloqueos?error=fechas");
  const b = datos.data;

  const { error } = await supabase.from("bloqueos").insert({
    dentista: b.dentista,
    inicio: b.inicio.toISOString(),
    fin: b.fin.toISOString(),
    motivo: b.motivo,
    creado_por: userId,
  });
  if (error) throw new Error(error.message);

  // El bloqueo no toca las citas ya agendadas; se avisa cuántas quedan dentro.
  let consulta = supabase
    .from("citas")
    .select("id", { count: "exact", head: true })
    .in("estado", ["pendiente", "confirmada"])
    .lt("inicio", b.fin.toISOString())
    .gt("fin", b.inicio.toISOString());
  if (b.dentista) consulta = consulta.eq("dentista", b.dentista);
  const { count } = await consulta;

  revalidatePath("/admin/bloqueos");
  redirect(`/admin/bloqueos${count ? `?afectadas=${count}` : ""}`);
}

export async function eliminarBloqueo(form: FormData) {
  const { supabase } = await exigirAdmin();
  const id = z.uuid().parse(form.get("id"));
  const { error } = await supabase.from("bloqueos").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/bloqueos");
}
