-- DentalCare · esquema del sistema de reservas
-- Ejecutar una sola vez en Supabase → SQL Editor.
--
-- Los dentistas, tratamientos y horarios viven en el código
-- (src/content/clinica.ts); aquí solo se guardan las citas, los bloqueos
-- de agenda y quién puede administrar.

create extension if not exists btree_gist;

create type public.estado_cita as enum ('pendiente', 'confirmada', 'rechazada', 'cancelada');

-- ─── Citas ──────────────────────────────────────────────────────────────
create table public.citas (
  id                uuid primary key default gen_random_uuid(),
  dentista          text not null,
  tratamiento       text not null,
  inicio            timestamptz not null,
  fin               timestamptz not null,
  estado            public.estado_cita not null default 'pendiente',
  paciente_nombre   text not null check (char_length(paciente_nombre) between 3 and 120),
  paciente_telefono text not null check (char_length(paciente_telefono) between 7 and 20),
  paciente_email    text not null check (char_length(paciente_email) <= 200),
  notas             text check (char_length(notas) <= 1000),
  respuesta         text check (char_length(respuesta) <= 1000),
  gestionada_por    uuid references auth.users (id) on delete set null,
  creada_en         timestamptz not null default now(),
  actualizada_en    timestamptz not null default now(),
  check (fin > inicio),
  -- Un dentista no puede tener dos citas activas que se crucen,
  -- aunque dos pacientes reserven el mismo turno al mismo tiempo.
  constraint citas_sin_cruces exclude using gist (
    dentista with =,
    tstzrange(inicio, fin) with &&
  ) where (estado in ('pendiente', 'confirmada'))
);

create index citas_inicio_idx on public.citas (inicio);
create index citas_estado_idx on public.citas (estado);

create function public.tocar_actualizada_en() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.actualizada_en := now();
  return new;
end;
$$;

create trigger citas_actualizada_en
  before update on public.citas
  for each row execute function public.tocar_actualizada_en();

-- ─── Bloqueos de agenda (vacaciones, festivos, capacitaciones…) ─────────
create table public.bloqueos (
  id          uuid primary key default gen_random_uuid(),
  dentista    text,            -- null = bloquea a toda la clínica
  inicio      timestamptz not null,
  fin         timestamptz not null,
  motivo      text check (char_length(motivo) <= 200),
  creado_por  uuid references auth.users (id) on delete set null,
  creado_en   timestamptz not null default now(),
  check (fin > inicio)
);

create index bloqueos_rango_idx on public.bloqueos (inicio, fin);

-- ─── Administradores del panel ──────────────────────────────────────────
-- Tener cuenta en Supabase Auth no basta: el usuario debe estar en esta tabla.
create table public.administradores (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  nombre     text,
  creado_en  timestamptz not null default now()
);

create function public.es_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.administradores where user_id = (select auth.uid())
  );
$$;

-- ─── Seguridad (RLS) ────────────────────────────────────────────────────
-- El público nunca toca estas tablas directamente: la página de reservas
-- escribe desde el servidor con la clave secreta, tras validar el turno.
alter table public.citas           enable row level security;
alter table public.bloqueos        enable row level security;
alter table public.administradores enable row level security;

create policy "admins leen citas" on public.citas
  for select to authenticated using ((select public.es_admin()));

create policy "admins gestionan citas" on public.citas
  for update to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

create policy "admins gestionan bloqueos" on public.bloqueos
  for all to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

create policy "cada admin ve su fila" on public.administradores
  for select to authenticated using (user_id = (select auth.uid()));
