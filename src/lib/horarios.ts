// Horarios semanales y su formato en español de Colombia.
// Los días siguen Date.getDay(): 0 = domingo … 6 = sábado.

export type Dia = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type Franja = { inicio: string; fin: string }; // "HH:MM" en 24 h
export type HorarioSemanal = Partial<Record<Dia, Franja[]>>;

const DIAS_CORTOS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
// Semana empezando en lunes, como se lee en Colombia.
const ORDEN: Dia[] = [1, 2, 3, 4, 5, 6, 0];

export const aMinutos = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const deMinutos = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

/** "13:00" → "1:00 p. m."; el mediodía se escribe "12:00 m.". */
export function formatoHora(hhmm: string) {
  const min = aMinutos(hhmm);
  const h = Math.floor(min / 60);
  const m = String(min % 60).padStart(2, "0");
  if (h === 12 && m === "00") return "12:00 m.";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${h < 12 ? "a. m." : "p. m."}`;
}

const formatoFranjas = (franjas: Franja[]) =>
  franjas.map((f) => `${formatoHora(f.inicio)} – ${formatoHora(f.fin)}`).join(" y ");

/** [1,2,3,4,5] → "Lunes a viernes"; [1,3,5] → "Lunes, miércoles y viernes". */
function nombrarDias(dias: Dia[], corto: boolean) {
  const nombres = corto ? DIAS_CORTOS : DIAS;
  const pos = dias.map((d) => ORDEN.indexOf(d));
  const consecutivos = pos.every((p, i) => i === 0 || p === pos[i - 1] + 1);
  const n = (d: Dia, i: number) => (i === 0 ? nombres[d] : nombres[d].toLowerCase());
  if (dias.length >= 3 && consecutivos) return `${n(dias[0], 0)} a ${n(dias[dias.length - 1], 1)}`;
  if (dias.length === 1) return nombres[dias[0]];
  return `${dias.slice(0, -1).map(n).join(", ")} y ${n(dias[dias.length - 1], 1)}`;
}

/** Agrupa los días que comparten franja: [{ dias: "Lunes a viernes", horas: "8:00 a. m. – 5:00 p. m." }]. */
export function resumirHorario(horario: HorarioSemanal, { corto = false } = {}) {
  const grupos = new Map<string, Dia[]>();
  for (const d of ORDEN) {
    const franjas = horario[d];
    if (!franjas?.length) continue;
    const clave = formatoFranjas(franjas);
    grupos.set(clave, [...(grupos.get(clave) ?? []), d]);
  }
  return [...grupos].map(([horas, dias]) => ({ dias: nombrarDias(dias, corto), horas }));
}

/** Horario de la sede: por cada día, desde la primera apertura hasta el último cierre. */
export function horarioSede(horarios: HorarioSemanal[]): HorarioSemanal {
  const sede: HorarioSemanal = {};
  for (const d of ORDEN) {
    const franjas = horarios.flatMap((h) => h[d] ?? []);
    if (!franjas.length) continue;
    const inicio = Math.min(...franjas.map((f) => aMinutos(f.inicio)));
    const fin = Math.max(...franjas.map((f) => aMinutos(f.fin)));
    sede[d] = [{ inicio: deMinutos(inicio), fin: deMinutos(fin) }];
  }
  return sede;
}

/** Filas día por día para una tabla de horario, con los días cerrados incluidos. */
export function filasPorDia(horario: HorarioSemanal) {
  return ORDEN.map((d) => ({
    dia: DIAS[d],
    horas: horario[d]?.length ? formatoFranjas(horario[d]) : "Cerrado",
  }));
}
