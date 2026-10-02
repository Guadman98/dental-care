"use client";

import { useActionState } from "react";
import { iniciarSesion } from "../acciones";

const campo =
  "mt-1.5 w-full rounded-xl border-2 border-hielo-200 px-4 py-3 text-marino outline-none focus:border-azul";

export function FormularioLogin() {
  const [estado, accion, enviando] = useActionState(iniciarSesion, {});

  return (
    <form action={accion} className="mt-6 space-y-4">
      <label className="block text-sm font-semibold text-marino">
        Correo
        <input name="email" type="email" autoComplete="username" required className={campo} />
      </label>
      <label className="block text-sm font-semibold text-marino">
        Contraseña
        <input name="password" type="password" autoComplete="current-password" required className={campo} />
      </label>
      {estado.error && (
        <p className="font-medium text-red-700" role="alert">
          {estado.error}
        </p>
      )}
      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-full bg-azul py-3.5 font-semibold text-white hover:bg-azul-700 disabled:opacity-60"
      >
        {enviando ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
