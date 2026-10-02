// Festivos de Colombia calculados para cualquier año (Ley 51 de 1983, "Ley Emiliani").
// La clínica cierra todos los festivos, así que no se ofrecen turnos en ellos.
// Si la ley cambia, este es el único archivo que hay que ajustar.

export type Festivo = { fecha: string; nombre: string }; // fecha "YYYY-MM-DD"

const DIA_MS = 86_400_000;
const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d));
const masDias = (d: Date, n: number) => new Date(d.getTime() + n * DIA_MS);
const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Si no cae en lunes, se traslada al lunes siguiente. */
const alLunes = (d: Date) => (d.getUTCDay() === 1 ? d : masDias(d, (8 - d.getUTCDay()) % 7));

/** Domingo de Pascua (algoritmo gregoriano anónimo de Meeus/Jones/Butcher). */
export function domingoDePascua(y: number) {
  const a = y % 19;
  const b = Math.floor(y / 100);
  const c = y % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const n = h + l - 7 * m + 114;
  return utc(y, Math.floor(n / 31), (n % 31) + 1);
}

const cache = new Map<number, Festivo[]>();

export function festivosDelAnio(y: number): Festivo[] {
  const guardado = cache.get(y);
  if (guardado) return guardado;

  const pascua = domingoDePascua(y);
  const lista: [Date, string][] = [
    // Fechas fijas
    [utc(y, 1, 1), "Año Nuevo"],
    [utc(y, 5, 1), "Día del Trabajo"],
    [utc(y, 7, 20), "Día de la Independencia"],
    [utc(y, 8, 7), "Batalla de Boyacá"],
    [utc(y, 12, 8), "Inmaculada Concepción"],
    [utc(y, 12, 25), "Navidad"],
    // Se trasladan al lunes siguiente
    [alLunes(utc(y, 1, 6)), "Reyes Magos"],
    [alLunes(utc(y, 3, 19)), "San José"],
    [alLunes(utc(y, 6, 29)), "San Pedro y San Pablo"],
    [alLunes(utc(y, 8, 15)), "Asunción de la Virgen"],
    [alLunes(utc(y, 10, 12)), "Día de la Raza"],
    [alLunes(utc(y, 11, 1)), "Todos los Santos"],
    [alLunes(utc(y, 11, 11)), "Independencia de Cartagena"],
    // Según la Semana Santa
    [masDias(pascua, -3), "Jueves Santo"],
    [masDias(pascua, -2), "Viernes Santo"],
    [alLunes(masDias(pascua, 39)), "Ascensión del Señor"],
    [alLunes(masDias(pascua, 60)), "Corpus Christi"],
    [alLunes(masDias(pascua, 68)), "Sagrado Corazón"],
  ];

  // Algunos años dos festivos caen el mismo lunes (p. ej. 30 de junio de 2025).
  const porFecha = new Map<string, string[]>();
  for (const [d, nombre] of lista) porFecha.set(iso(d), [...(porFecha.get(iso(d)) ?? []), nombre]);
  const festivos = [...porFecha]
    .map(([fecha, nombres]) => ({ fecha, nombre: nombres.join(" · ") }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  cache.set(y, festivos);
  return festivos;
}

/** Nombre del festivo en esa fecha, o undefined si es día hábil. */
export const festivo = (fecha: string) =>
  festivosDelAnio(Number(fecha.slice(0, 4))).find((f) => f.fecha === fecha)?.nombre;

/** Festivos entre dos fechas "YYYY-MM-DD", ambas incluidas. */
export function festivosEntre(desde: string, hasta: string) {
  const anios = Array.from({ length: Number(hasta.slice(0, 4)) - Number(desde.slice(0, 4)) + 1 }, (_, i) => Number(desde.slice(0, 4)) + i);
  return anios.flatMap(festivosDelAnio).filter((f) => f.fecha >= desde && f.fecha <= hasta);
}
