import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { supabaseServidor } from "./supabase/servidor";

/**
 * Devuelve el cliente de Supabase del administrador con sesión iniciada.
 * Sin sesión, redirige al login; con sesión pero sin permiso, devuelve
 * `autorizado: false` para mostrar un aviso en vez de entrar en un bucle.
 */
export const sesionAdmin = cache(async () => {
  const supabase = await supabaseServidor();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/admin/login");

  const { data: fila } = await supabase
    .from("administradores")
    .select("nombre")
    .eq("user_id", data.claims.sub)
    .maybeSingle();

  return {
    supabase,
    userId: data.claims.sub,
    email: (data.claims.email as string | undefined) ?? "",
    nombre: fila?.nombre as string | undefined,
    autorizado: !!fila,
  };
});

/** Para Server Actions: corta la ejecución si quien llama no es administrador. */
export async function exigirAdmin() {
  const s = await sesionAdmin();
  if (!s.autorizado) throw new Error("No autorizado");
  return s;
}
