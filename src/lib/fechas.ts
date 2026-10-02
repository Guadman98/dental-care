// Fechas en la hora de Colombia. Colombia no cambia de horario en el año
// (siempre UTC−5), así que un desplazamiento fijo es exacto.

import type { Dia } from "./horarios";

export const ZONA = "America/Bogota";
const DESFASE = "-05:00";

/** Fecha local "YYYY-MM-DD" de un instante. */
export const fechaLocal = (instante: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: ZONA }).format(instante);

/** Hora local "HH:MM" de un instante. */
export const horaLocal = (instante: Date) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: ZONA, hour: "2-digit", minute: "2-digit" }).format(instante);

/** Instante correspondiente a una fecha y hora locales de Colombia. */
export const instante = (fecha: string, hhmm: string) => new Date(`${fecha}T${hhmm}:00${DESFASE}`);

export const diaSemana = (fecha: string) => instante(fecha, "12:00").getUTCDay() as Dia;

export function sumarDias(fecha: string, dias: number) {
  const d = instante(fecha, "12:00");
  d.setUTCDate(d.getUTCDate() + dias);
  return fechaLocal(d);
}

/** "2026-10-06" → "martes 6 de octubre" (Intl agrega una coma tras el día de la semana). */
export function fechaLarga(fecha: string) {
  const partes = new Intl.DateTimeFormat("es-CO", { timeZone: ZONA, weekday: "long", day: "numeric", month: "long" })
    .formatToParts(instante(fecha, "12:00"))
    .reduce<Record<string, string>>((acc, p) => ({ ...acc, [p.type]: p.value }), {});
  return `${partes.weekday} ${partes.day} de ${partes.month}`;
}
