-- ============================================================
-- Esquema simplificado: sin login, acceso publico para crear
-- ============================================================

-- Si ya habias corrido la version anterior (con user_id), esto la
-- reemplaza limpio. Si es un proyecto nuevo, no pasa nada, simplemente
-- no encuentra nada que borrar.
drop table if exists links cascade;

create table links (
  code text primary key,
  target text not null,
  clicks integer not null default 0,
  created_at timestamptz not null default now()
);

alter table links enable row level security;

-- Cualquiera puede crear un enlace (el formulario corre en el navegador
-- del visitante, sin cuenta de por medio).
create policy "cualquiera puede insertar enlaces"
  on links for insert
  to anon
  with check (true);

-- No hay politica de select publica: nadie puede leer la tabla completa
-- desde el navegador. Se usan las funciones de abajo para lo puntual
-- que hace falta (resolver un codigo, ver su contador de clics).

-- ------------------------------------------------------------
-- Funciones publicas y controladas
-- ------------------------------------------------------------

create or replace function get_target(p_code text)
returns text
language sql
security definer
set search_path = public
as $$
  select target from links where code = p_code;
$$;

create or replace function get_clicks(p_code text)
returns integer
language sql
security definer
set search_path = public
as $$
  select clicks from links where code = p_code;
$$;

create or replace function increment_clicks(p_code text)
returns void
language sql
security definer
set search_path = public
as $$
  update links set clicks = clicks + 1 where code = p_code;
$$;

grant execute on function get_target(text) to anon, authenticated;
grant execute on function get_clicks(text) to anon, authenticated;
grant execute on function increment_clicks(text) to anon, authenticated;
