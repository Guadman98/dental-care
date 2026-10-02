# DentalCare

Sitio web y sistema de citas en línea para la clínica odontológica DentalCare (Palmira, Valle del Cauca).

- **Sitio público:** tratamientos, equipo, instalaciones, testimonios, horario y contacto.
- **Reservas (`/reservar`):** el paciente elige tratamiento, especialista y un turno libre; la solicitud queda pendiente hasta que la clínica la confirma.
- **Panel (`/admin`):** confirmar, rechazar o cancelar citas (con aviso por correo al paciente) y bloquear la agenda por vacaciones u otros cierres. Los festivos de Colombia se bloquean solos.

## Tecnologías

Next.js 16 · React 19 · Tailwind CSS 4 · Supabase (PostgreSQL + Auth) · Nodemailer (Gmail)

## Puesta en marcha

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Copiar `.env.example` como `.env.local` y completar las claves de Supabase y de Gmail.
3. En Supabase → SQL Editor, ejecutar `supabase/migrations/0001_reservas.sql`.
4. Crear el usuario administrador en Supabase → Authentication → Users y registrarlo:
   ```sql
   insert into public.administradores (user_id, nombre)
   select id, 'Recepción' from auth.users where email = 'correo@ejemplo.com';
   ```
5. Desactivar el registro público en Authentication → Sign In / Providers.
6. Iniciar en desarrollo:
   ```bash
   npm run dev
   ```

## Dónde está cada cosa

| Qué | Archivo |
|---|---|
| Datos de la clínica, dentistas, horarios y tratamientos | `src/content/clinica.ts` |
| Cálculo de turnos libres | `src/lib/disponibilidad.ts` |
| Festivos de Colombia | `src/lib/festivos.ts` |
| Plantillas de correo | `src/lib/correo.ts` |
| Esquema de base de datos | `supabase/migrations/0001_reservas.sql` |
| Fotos originales (sin optimizar) | `assets/` |

> Los testimonios actuales son ficticios, solo para la demostración. Hay que reemplazarlos por reseñas reales antes de publicar el sitio.
