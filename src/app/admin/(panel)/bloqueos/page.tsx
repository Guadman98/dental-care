import { Trash2 } from "lucide-react";
import { dentistas, nombreCompleto } from "@/content/clinica";
import { sesionAdmin } from "@/lib/admin";
import { fechaLarga, fechaLocal, horaLocal, sumarDias } from "@/lib/fechas";
import { festivosEntre } from "@/lib/festivos";
import { formatoHora } from "@/lib/horarios";
import { crearBloqueo, eliminarBloqueo } from "../../acciones";

const MESES_FESTIVOS = 6;

type Bloqueo = { id: string; dentista: string | null; inicio: string; fin: string; motivo: string | null };

const campo = "mt-1.5 w-full rounded-xl border-2 border-hielo-200 bg-white px-4 py-2.5 text-marino outline-none focus:border-azul";

function describir(b: Bloqueo) {
  const i = new Date(b.inicio);
  const f = new Date(b.fin);
  const diaCompleto = horaLocal(i) === "00:00" && horaLocal(f) === "00:00";
  if (diaCompleto) {
    const ultimo = fechaLocal(new Date(f.getTime() - 1));
    return fechaLocal(i) === ultimo ? `${fechaLarga(ultimo)}, todo el día` : `Del ${fechaLarga(fechaLocal(i))} al ${fechaLarga(ultimo)}`;
  }
  const mismoDia = fechaLocal(i) === fechaLocal(f);
  return mismoDia
    ? `${fechaLarga(fechaLocal(i))}, de ${formatoHora(horaLocal(i))} a ${formatoHora(horaLocal(f))}`
    : `Del ${fechaLarga(fechaLocal(i))} ${formatoHora(horaLocal(i))} al ${fechaLarga(fechaLocal(f))} ${formatoHora(horaLocal(f))}`;
}

export default async function Bloqueos({ searchParams }: PageProps<"/admin/bloqueos">) {
  const { afectadas, error: errorForm } = await searchParams;
  const { supabase } = await sesionAdmin();
  const hoy = fechaLocal(new Date());
  const { data, error } = await supabase
    .from("bloqueos")
    .select("id, dentista, inicio, fin, motivo")
    .gte("fin", new Date().toISOString())
    .order("inicio");

  return (
    <>
      <h1 className="text-3xl font-semibold">Bloqueos de agenda</h1>
      <p className="mt-2 max-w-2xl">
        Vacaciones, festivos o capacitaciones. Mientras dure un bloqueo, nadie podrá reservar en ese horario. Las citas ya
        agendadas no se cancelan solas.
      </p>

      {afectadas && (
        <p className="mt-6 rounded-2xl bg-amber-100 px-5 py-3 font-medium text-amber-900" role="status">
          Bloqueo creado. Hay {afectadas} cita(s) pendiente(s) o confirmada(s) dentro de ese horario: revísalas en Citas.
        </p>
      )}
      {errorForm && (
        <p className="mt-6 rounded-2xl bg-red-100 px-5 py-3 font-medium text-red-800" role="alert">
          Revisa las fechas: el final debe ser posterior al inicio.
        </p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[22rem_1fr]">
        <form action={crearBloqueo} className="space-y-4 self-start rounded-3xl bg-white p-6">
          <h2 className="font-sans text-lg font-semibold">Nuevo bloqueo</h2>
          <label className="block text-sm font-semibold text-marino">
            ¿A quién afecta?
            <select name="dentista" className={campo}>
              <option value="">Toda la clínica</option>
              {dentistas.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {nombreCompleto(d)}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-semibold text-marino">
              Desde
              <input type="date" name="fecha_desde" required className={campo} />
            </label>
            <label className="block text-sm font-semibold text-marino">
              Hasta
              <input type="date" name="fecha_hasta" required className={campo} />
            </label>
            <label className="block text-sm font-semibold text-marino">
              Hora inicio
              <input type="time" name="hora_desde" className={campo} />
            </label>
            <label className="block text-sm font-semibold text-marino">
              Hora fin
              <input type="time" name="hora_hasta" className={campo} />
            </label>
          </div>
          <p className="text-xs">Deja las horas vacías para bloquear días completos.</p>
          <label className="block text-sm font-semibold text-marino">
            Motivo (opcional)
            <input name="motivo" maxLength={200} placeholder="Ej.: Vacaciones, capacitación" className={campo} />
          </label>
          <button type="submit" className="w-full rounded-full bg-azul py-3 font-semibold text-white hover:bg-azul-700">
            Bloquear horario
          </button>
        </form>

        <div>
          {error && <p className="font-medium text-red-700">No se pudieron cargar los bloqueos: {error.message}</p>}
          {!error && !data?.length && <p className="rounded-3xl bg-white p-8 text-center">No hay bloqueos próximos.</p>}
          <ul className="space-y-3">
            {(data as Bloqueo[] | null)?.map((b) => {
              const d = dentistas.find((x) => x.slug === b.dentista);
              return (
                <li key={b.id} className="flex items-start justify-between gap-4 rounded-2xl bg-white p-5">
                  <div>
                    <p className="font-semibold text-marino first-letter:uppercase">{describir(b)}</p>
                    <p className="mt-1 text-sm">
                      {d ? nombreCompleto(d) : "Toda la clínica"}
                      {b.motivo && ` · ${b.motivo}`}
                    </p>
                  </div>
                  <form action={eliminarBloqueo}>
                    <input type="hidden" name="id" value={b.id} />
                    <button
                      type="submit"
                      aria-label="Eliminar bloqueo"
                      className="rounded-full p-2 text-texto hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="size-5" aria-hidden />
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>

          <section className="mt-10" aria-labelledby="titulo-festivos">
            <h2 id="titulo-festivos" className="font-sans text-lg font-semibold">
              Festivos de los próximos meses
            </h2>
            <p className="mt-1 text-sm">
              Se bloquean solos para toda la clínica, cada año. No hace falta crearlos aquí.
            </p>
            <ul className="mt-4 divide-y divide-hielo-200 rounded-2xl bg-white px-5">
              {festivosEntre(hoy, sumarDias(hoy, MESES_FESTIVOS * 31)).map((f) => (
                <li key={f.fecha} className="flex flex-wrap justify-between gap-x-4 gap-y-0.5 py-3 text-sm">
                  <span className="font-semibold text-marino first-letter:uppercase">
                    {fechaLarga(f.fecha)}
                    {f.fecha.slice(0, 4) !== hoy.slice(0, 4) && ` de ${f.fecha.slice(0, 4)}`}
                  </span>
                  <span>{f.nombre}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
