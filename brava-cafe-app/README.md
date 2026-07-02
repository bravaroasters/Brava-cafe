# BRAVA Café — App interna

Fase 1: Productos + Ventas. Construida con React + Vite + Supabase, mismo
patrón que la app MVI, pero en su propia cuenta separada.

## 1. Subir el código a GitHub

1. Crea el repo nuevo (ej: `brava-cafe-app`) en la cuenta de GitHub nueva.
2. Sube esta carpeta completa al repo.

## 2. Crear el proyecto en Supabase

1. Crea un proyecto nuevo en supabase.com (con la cuenta/mail nuevo), región
   São Paulo.
2. Ve a **SQL Editor** → pega el contenido completo de `supabase/schema.sql`
   → ejecútalo. Esto crea las tablas y deja cargados los 4 productos con los
   precios y supuestos reales que ya validamos.
3. Ve a **Project Settings → API** y copia:
   - `Project URL` → va en `VITE_SUPABASE_URL`
   - `anon public key` → va en `VITE_SUPABASE_ANON_KEY`

## 3. Correr localmente (opcional, para probar antes de publicar)

```bash
npm install
cp .env.example .env
# pega tus valores reales de Supabase en .env
npm run dev
```

## 4. Publicar en Vercel

1. Conecta el repo de GitHub en vercel.com (con la cuenta nueva).
2. En **Environment Variables**, agrega `VITE_SUPABASE_URL` y
   `VITE_SUPABASE_ANON_KEY` con los mismos valores del paso 2.
3. Deploy. Vercel te da un link — ese es el link privado que usa tu polola,
   sin login.

## Qué incluye esta Fase 1

- **Productos**: los 4 SKU (Colombia/Honduras × 250g/1kg) con margen
  calculado en vivo desde los supuestos (precio del grano, merma, empaque,
  comisión TUU) — la misma fórmula que en `BRAVA_Cafe_Costeo.xlsx`.
- **Ventas**: registro rápido (producto, cantidad, medio de pago, fecha) y
  resumen de ingresos brutos, líquidos, IVA recaudado y comisiones TUU.

## Qué falta (Fase 2)

- **Inventario**: stock de grano verde, tostado y empaque, con alertas de
  stock bajo.
- **Producción**: registro de tandas de tueste (reemplaza el % de merma fijo
  por datos reales medidos).
- **Finanzas**: ingresos por mes con detalle, resumen anual, gastos por
  proveedor con estado pagado/no pagado, IVA neto a pagar del mes.

## Nota de seguridad

La app no tiene login (por decisión explícita, para mantenerla simple). Usa
la clave "anon" pública de Supabase con reglas de acceso abiertas — igual que
MVI. Es razonable para un link privado que no se comparte, pero cualquiera
que obtenga la URL y la clave (visibles en el código del navegador) podría
leer o modificar los datos. Si más adelante quieren subir el nivel de
seguridad, se puede agregar sin mucho trabajo.
