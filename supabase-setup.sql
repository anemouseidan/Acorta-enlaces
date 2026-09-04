-- ============================================================
-- Esquema para el acortador con dueño, historial y clics
-- ============================================================

create table if not exists links (
  code text primary key,
  target text not null,
  user_id uuid not null default auth.uid() references auth.users(id),
  clicks integer not null default 0,
  created_at timestamptz not null default now()
);

alter table links enable row level security;

-- Solo un usuario autenticado (tú) puede crear enlaces.
-- Esto es lo que bloquea el spam de desconocidos.
create policy "solo el dueno inserta"
  on links for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Solo el dueño puede LEER el listado completo (esto es tu "historial").
-- Los visitantes anónimos NO pueden leer la tabla directamente;
-- ellos usan la función get_target de abajo, que solo expone el destino.
create policy "solo el dueno lee su historial"
  on links for select
  to authenticated
  using (auth.uid() = user_id);

-- Solo el dueño puede borrar sus propios enlaces.
create policy "solo el dueno borra"
  on links for delete
  to authenticated
  using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- Funciones públicas y controladas (para la página de espera)
-- ------------------------------------------------------------

-- Resuelve un código a su destino, sin exponer el resto de la tabla.
create or replace function get_target(p_code text)
returns text
language sql
security definer
set search_path = public
as $$
  select target from links where code = p_code;
$$;

-- Suma un clic, sin dar permiso de escritura general sobre la tabla.
create or replace function increment_clicks(p_code text)
returns void
language sql
security definer
set search_path = public
as $$
  update links set clicks = clicks + 1 where code = p_code;
$$;

grant execute on function get_target(text) to anon, authenticated;
grant execute on function increment_clicks(text) to anon, authenticated;
