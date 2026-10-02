// Cálculo de turnos libres. Es lógica pura (sin base de datos) para poder
// usarla igual al mostrar la agenda y al validar una reserva en el servidor.

import { diaSemana, fechaLocal, instante, sumarDias } from "./fechas";
import { festivo } from "./festivos";
import { aMinutos, type HorarioSemanal } from "./horarios";

export const PASO_MINUTOS = 30; // cada cuánto empieza un turno
export const ANTICIPACION_MINUTOS = 120; // no se reserva para dentro de menos de 2 h
export const DIAS_VISIBLES = 30; // hasta cuántos días adelante se puede reservar

export type Rango = { inicio: Date; fin: Date };

const seCruzan = (a: Rango, b: Rango) => a.inicio < b.fin && b.inicio < a.fin;

const aHHMM = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

/** Turnos de un día que caben completos dentro del horario del dentista. */
export function turnosDelDia(horario: HorarioSemanal, fecha: string, duracion: number) {
  const turnos: string[] = [];
  for (const franja of horario[diaSemana(fecha)] ?? []) {
    const fin = aMinutos(franja.fin);
    for (let t = aMinutos(franja.inicio); t + duracion <= fin; t += PASO_MINUTOS) turnos.push(aHHMM(t));
  }
  return turnos;
}

type Opciones = {
  horario: HorarioSemanal;
  duracion: number;
  ocupados: Rango[]; // citas activas y bloqueos
  ahora: Date;
};

/** Turnos libres por fecha, desde hoy hasta DIAS_VISIBLES. Solo incluye días con algún turno. */
export function turnosLibres({ horario, duracion, ocupados, ahora }: Opciones) {
  const limite = new Date(ahora.getTime() + ANTICIPACION_MINUTOS * 60_000);
  const hoy = fechaLocal(ahora);
  const dias: Record<string, string[]> = {};

  for (let i = 0; i < DIAS_VISIBLES; i++) {
    const fecha = sumarDias(hoy, i);
    if (festivo(fecha)) continue; // la clínica cierra todos los festivos
    const libres = turnosDelDia(horario, fecha, duracion).filter((hhmm) => {
      const inicio = instante(fecha, hhmm);
      const turno = { inicio, fin: new Date(inicio.getTime() + duracion * 60_000) };
      return inicio >= limite && !ocupados.some((o) => seCruzan(turno, o));
    });
    if (libres.length) dias[fecha] = libres;
  }
  return dias;
}

/** Rango que cubre toda la ventana de reservas, para consultar lo ocupado. */
export function ventanaDeReservas(ahora: Date): Rango {
  const hoy = fechaLocal(ahora);
  return { inicio: instante(hoy, "00:00"), fin: instante(sumarDias(hoy, DIAS_VISIBLES), "00:00") };
}
