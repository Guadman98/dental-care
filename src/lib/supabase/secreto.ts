import "server-only";
import { createClient } from "@supabase/supabase-js";

// Cliente con la clave secreta: ignora RLS. Solo se usa en el servidor para
// la reserva pública, después de validar el turno solicitado.
export function supabaseSecreto() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = process.env.SUPABASE_SECRET_KEY;
  if (!url || !clave) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY en .env.local");
  }
  return createClient(url, clave, { auth: { persistSession: false, autoRefreshToken: false } });
}
