import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refresca la sesión de Supabase en las rutas del panel y saca a quien no
// haya iniciado sesión. Es una comprobación optimista: el permiso real de
// administrador se verifica otra vez en el servidor (src/lib/admin.ts).
export async function proxy(request: NextRequest) {
  let respuesta = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (lista, cabeceras) => {
          lista.forEach(({ name, value }) => request.cookies.set(name, value));
          respuesta = NextResponse.next({ request });
          lista.forEach(({ name, value, options }) => respuesta.cookies.set(name, value, options));
          Object.entries(cabeceras ?? {}).forEach(([k, v]) => respuesta.headers.set(k, v));
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const enLogin = request.nextUrl.pathname === "/admin/login";

  if (!data?.claims && !enLogin) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (data?.claims && enLogin) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return respuesta;
}

export const config = {
  matcher: ["/admin/:path*"],
};
