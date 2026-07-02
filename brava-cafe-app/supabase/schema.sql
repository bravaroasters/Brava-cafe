-- BRAVA Café — esquema inicial (Fase 1: Productos + Ventas)
-- Ejecutar completo en el SQL Editor de Supabase (proyecto nuevo, separado de MVI)

create extension if not exists "pgcrypto";

-- ============================================================
-- CONFIGURACIÓN / SUPUESTOS (fila única, editable desde la app más adelante)
-- ============================================================
create table if not exists supuestos (
  id int primary key default 1,
  precio_colombia_neto_kg numeric not null default 10300,
  precio_honduras_neto_kg numeric not null default 10800,
  merma_250g numeric not null default 0.08,
  merma_1kg numeric not null default 0.15,
  costo_tueste_propio numeric not null default 0,
  costo_tueste_externo numeric not null default 2900,
  costo_bolsa numeric not null default 420.17,
  costo_etiqueta numeric not null default 147.06,
  comision_tuu_pct numeric not null default 0.0149,
  iva_pct numeric not null default 0.19,
  updated_at timestamptz default now(),
  constraint solo_una_fila check (id = 1)
);

insert into supuestos (id) values (1)
  on conflict (id) do nothing;

-- ============================================================
-- PRODUCTOS (los 4 SKU vigentes)
-- ============================================================
create table if not exists productos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  origen text not null check (origen in ('Colombia', 'Honduras')),
  formato text not null check (formato in ('250g', '1kg')),
  precio_venta_bruto numeric not null,
  activo boolean not null default true,
  created_at timestamptz default now()
);

insert into productos (nombre, origen, formato, precio_venta_bruto)
values
  ('Colombia 250g', 'Colombia', '250g', 12500),
  ('Honduras 250g', 'Honduras', '250g', 12500),
  ('Colombia 1kg', 'Colombia', '1kg', 32000),
  ('Honduras 1kg', 'Honduras', '1kg', 32000)
on conflict do nothing;

-- ============================================================
-- VENTAS
-- ============================================================
create table if not exists ventas (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid not null references productos(id),
  fecha date not null default current_date,
  cantidad int not null default 1 check (cantidad > 0),
  medio_pago text not null check (medio_pago in ('debito', 'credito', 'efectivo')),
  monto_bruto_unitario numeric not null,
  created_at timestamptz default now()
);

-- Nota: no se precargaron ventas históricas de las últimas 3 semanas porque
-- no tenemos el medio de pago real de cada una (solo el total y, en algunos
-- casos, el desglose por SKU). Se pueden ingresar manualmente desde la
-- pestaña Ventas, o pídele a Claude que las agregue si le confirmas los datos.

-- ============================================================
-- ACCESO (sin login: la app usa la clave "anon" de Supabase)
-- ============================================================
-- Importante: como la app no tiene pantalla de login, cualquiera con el link
-- de la app puede leer y escribir. Esto es igual al enfoque de MVI. La clave
-- "anon" queda visible en el código del navegador (es pública por diseño),
-- así que técnicamente alguien que la extraiga del código podría llamar a la
-- API de Supabase directamente. Para un negocio chico y un link que no se
-- comparte, el riesgo es bajo — pero si más adelante quieren más seguridad,
-- se puede agregar una clave compartida simple sin mucho esfuerzo.
alter table supuestos enable row level security;
alter table productos enable row level security;
alter table ventas enable row level security;

create policy "acceso anon total - supuestos" on supuestos
  for all using (true) with check (true);
create policy "acceso anon total - productos" on productos
  for all using (true) with check (true);
create policy "acceso anon total - ventas" on ventas
  for all using (true) with check (true);
