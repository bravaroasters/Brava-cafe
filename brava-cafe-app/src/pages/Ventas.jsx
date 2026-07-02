import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { calcularIvaVenta, formatoCLP } from '../lib/costing'

const MEDIOS_PAGO = [
  { value: 'debito', label: 'Débito' },
  { value: 'credito', label: 'Crédito' },
  { value: 'efectivo', label: 'Efectivo' },
]

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-brava-blush p-4">
      <p className="text-[11px] tracking-label text-brava-reddark/50 uppercase">{label}</p>
      <p className="text-xl font-medium text-brava-reddark mt-1">{value}</p>
    </div>
  )
}

export default function Ventas() {
  const [productos, setProductos] = useState([])
  const [supuestos, setSupuestos] = useState(null)
  const [ventas, setVentas] = useState([])
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    producto_id: '',
    cantidad: 1,
    medio_pago: 'debito',
    fecha: new Date().toISOString().slice(0, 10),
  })

  async function cargarTodo() {
    setLoading(true)
    const [{ data: prod }, { data: sup }, { data: vts, error: errVts }] = await Promise.all([
      supabase.from('productos').select('*').eq('activo', true).order('origen'),
      supabase.from('supuestos').select('*').eq('id', 1).single(),
      supabase
        .from('ventas')
        .select('*, productos(nombre, origen, formato, precio_venta_bruto)')
        .order('fecha', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50),
    ])
    if (errVts) setError(errVts.message)
    setProductos(prod || [])
    setSupuestos(sup || null)
    setVentas(vts || [])
    if (prod?.length && !form.producto_id) {
      setForm((f) => ({ ...f, producto_id: prod[0].id }))
    }
    setLoading(false)
  }

  useEffect(() => {
    cargarTodo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function agregarVenta(e) {
    e.preventDefault()
    const producto = productos.find((p) => p.id === form.producto_id)
    if (!producto) return
    setGuardando(true)
    const montoBrutoUnitario = producto.precio_venta_bruto
    const { error: errInsert } = await supabase.from('ventas').insert({
      producto_id: producto.id,
      fecha: form.fecha,
      cantidad: Number(form.cantidad),
      medio_pago: form.medio_pago,
      monto_bruto_unitario: montoBrutoUnitario,
    })
    setGuardando(false)
    if (errInsert) {
      setError(errInsert.message)
      return
    }
    setForm((f) => ({ ...f, cantidad: 1 }))
    cargarTodo()
  }

  if (loading) return <p className="text-sm text-brava-reddark/60 px-1">Cargando ventas…</p>

  const ivaPct = supuestos?.iva_pct ?? 0.19
  const comisionPct = supuestos?.comision_tuu_pct ?? 0.0149

  let totalBruto = 0
  let totalNeto = 0
  let totalIva = 0
  let totalComision = 0

  for (const v of ventas) {
    const bruto = v.monto_bruto_unitario * v.cantidad
    const { neto, iva } = calcularIvaVenta(bruto, ivaPct)
    const comision = v.medio_pago === 'efectivo' ? 0 : bruto * comisionPct
    totalBruto += bruto
    totalNeto += neto
    totalIva += iva
    totalComision += comision
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Ingresos brutos" value={formatoCLP(totalBruto)} />
        <StatCard label="Ingresos líquidos" value={formatoCLP(totalNeto)} />
        <StatCard label="IVA recaudado" value={formatoCLP(totalIva)} />
        <StatCard label="Comisiones TUU" value={formatoCLP(totalComision)} />
      </div>

      <form
        onSubmit={agregarVenta}
        className="bg-white border border-brava-blush rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-end"
      >
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs text-brava-reddark/60 mb-1">Producto</label>
          <select
            className="w-full border border-brava-blush rounded-lg px-2.5 py-2 text-sm"
            value={form.producto_id}
            onChange={(e) => setForm({ ...form, producto_id: e.target.value })}
          >
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.origen} {p.formato} — {formatoCLP(p.precio_venta_bruto)}
              </option>
            ))}
          </select>
        </div>
        <div className="w-20">
          <label className="block text-xs text-brava-reddark/60 mb-1">Cantidad</label>
          <input
            type="number"
            min="1"
            className="w-full border border-brava-blush rounded-lg px-2.5 py-2 text-sm"
            value={form.cantidad}
            onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
          />
        </div>
        <div className="min-w-[140px]">
          <label className="block text-xs text-brava-reddark/60 mb-1">Medio de pago</label>
          <select
            className="w-full border border-brava-blush rounded-lg px-2.5 py-2 text-sm"
            value={form.medio_pago}
            onChange={(e) => setForm({ ...form, medio_pago: e.target.value })}
          >
            {MEDIOS_PAGO.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[140px]">
          <label className="block text-xs text-brava-reddark/60 mb-1">Fecha</label>
          <input
            type="date"
            className="w-full border border-brava-blush rounded-lg px-2.5 py-2 text-sm"
            value={form.fecha}
            onChange={(e) => setForm({ ...form, fecha: e.target.value })}
          />
        </div>
        <button
          type="submit"
          disabled={guardando}
          className="bg-brava-red text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {guardando ? 'Guardando…' : 'Agregar venta'}
        </button>
      </form>

      {error && <p className="text-sm text-red-700 mb-3">{error}</p>}

      <div className="bg-white border border-brava-blush rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-brava-reddark/50 uppercase tracking-label border-b border-brava-blush">
              <th className="px-4 py-2.5 font-medium">Fecha</th>
              <th className="px-4 py-2.5 font-medium">Producto</th>
              <th className="px-4 py-2.5 font-medium">Cant.</th>
              <th className="px-4 py-2.5 font-medium">Medio</th>
              <th className="px-4 py-2.5 font-medium text-right">Bruto</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((v) => (
              <tr key={v.id} className="border-b border-brava-blush/60 last:border-0">
                <td className="px-4 py-2.5">{v.fecha}</td>
                <td className="px-4 py-2.5">
                  {v.productos?.origen} {v.productos?.formato}
                </td>
                <td className="px-4 py-2.5">{v.cantidad}</td>
                <td className="px-4 py-2.5 capitalize">{v.medio_pago}</td>
                <td className="px-4 py-2.5 text-right">
                  {formatoCLP(v.monto_bruto_unitario * v.cantidad)}
                </td>
              </tr>
            ))}
            {ventas.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-brava-reddark/50">
                  Todavía no hay ventas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
