import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function AjusteStock({ onAplicar, sufijo }) {
  const [valor, setValor] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function aplicar(signo) {
    const n = Number(valor)
    if (!n) return
    setEnviando(true)
    await onAplicar(signo * n)
    setEnviando(false)
    setValor('')
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        min="0"
        step="any"
        placeholder="cantidad"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        className="w-24 border border-brava-blush rounded-lg px-2 py-1 text-xs"
      />
      <span className="text-[11px] text-brava-reddark/40">{sufijo}</span>
      <button
        disabled={enviando}
        onClick={() => aplicar(1)}
        className="text-xs bg-green-700 text-white px-2.5 py-1 rounded-lg disabled:opacity-50"
      >
        + Agregar
      </button>
      <button
        disabled={enviando}
        onClick={() => aplicar(-1)}
        className="text-xs bg-brava-reddark/70 text-white px-2.5 py-1 rounded-lg disabled:opacity-50"
      >
        − Descontar
      </button>
    </div>
  )
}

function FilaStock({ nombreEl, colorDot, stock, umbral, unidad, onAplicar }) {
  const bajo = stock <= umbral
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-brava-blush/50 last:border-0">
      <div className="flex items-center gap-2 min-w-[160px]">
        {colorDot && (
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colorDot }} />
        )}
        <span className="text-sm text-brava-reddark">{nombreEl}</span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`text-sm font-medium ${bajo ? 'text-amber-700' : 'text-brava-reddark'}`}
        >
          {stock} {unidad}
        </span>
        {bajo && (
          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
            stock bajo
          </span>
        )}
      </div>
      <AjusteStock onAplicar={onAplicar} sufijo={unidad} />
    </div>
  )
}

export default function Inventario() {
  const [grano, setGrano] = useState([])
  const [tostado, setTostado] = useState([])
  const [insumos, setInsumos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [nuevoInsumo, setNuevoInsumo] = useState({ nombre: '', stock: '', umbral_alerta: '' })

  async function cargarTodo() {
    setLoading(true)
    const [{ data: g, error: eG }, { data: t, error: eT }, { data: i, error: eI }] =
      await Promise.all([
        supabase.from('inventario_grano').select('*, origenes(nombre, color_badge)').order('id'),
        supabase
          .from('inventario_tostado')
          .select('*, productos(nombre, formato, origenes(nombre, color_badge))')
          .order('id'),
        supabase.from('inventario_insumos').select('*').order('nombre'),
      ])
    if (eG || eT || eI) setError(eG?.message || eT?.message || eI?.message)
    setGrano(g || [])
    setTostado(t || [])
    setInsumos(i || [])
    setLoading(false)
  }

  useEffect(() => {
    cargarTodo()
  }, [])

  async function ajustarGrano(row, delta) {
    await supabase
      .from('inventario_grano')
      .update({ stock_kg: Math.max(0, row.stock_kg + delta), updated_at: new Date().toISOString() })
      .eq('id', row.id)
    cargarTodo()
  }

  async function ajustarTostado(row, delta) {
    await supabase
      .from('inventario_tostado')
      .update({
        stock_bolsas: Math.max(0, row.stock_bolsas + delta),
        updated_at: new Date().toISOString(),
      })
      .eq('id', row.id)
    cargarTodo()
  }

  async function ajustarInsumo(row, delta) {
    await supabase
      .from('inventario_insumos')
      .update({ stock: Math.max(0, row.stock + delta), updated_at: new Date().toISOString() })
      .eq('id', row.id)
    cargarTodo()
  }

  async function agregarInsumo(e) {
    e.preventDefault()
    if (!nuevoInsumo.nombre) return
    await supabase.from('inventario_insumos').insert({
      nombre: nuevoInsumo.nombre,
      stock: Number(nuevoInsumo.stock) || 0,
      umbral_alerta: Number(nuevoInsumo.umbral_alerta) || 20,
    })
    setNuevoInsumo({ nombre: '', stock: '', umbral_alerta: '' })
    cargarTodo()
  }

  if (loading) return <p className="text-sm text-brava-reddark/60 px-1">Cargando inventario…</p>
  if (error) return <p className="text-sm text-red-700 px-1">No se pudo cargar: {error}</p>

  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs tracking-label text-brava-reddark/50 uppercase mb-2 px-1">
          Café verde (sin tostar)
        </p>
        <div className="bg-white border border-brava-blush rounded-xl px-4">
          {grano.map((row) => (
            <FilaStock
              key={row.id}
              nombreEl={row.origenes?.nombre}
              colorDot={row.origenes?.color_badge}
              stock={row.stock_kg}
              umbral={row.umbral_alerta_kg}
              unidad="kg"
              onAplicar={(delta) => ajustarGrano(row, delta)}
            />
          ))}
        </div>
      </section>

      <section>
        <p className="text-xs tracking-label text-brava-reddark/50 uppercase mb-2 px-1">
          Café tostado y empacado (listo para vender)
        </p>
        <div className="bg-white border border-brava-blush rounded-xl px-4">
          {tostado.map((row) => (
            <FilaStock
              key={row.id}
              nombreEl={`${row.productos?.origenes?.nombre} ${row.productos?.formato}`}
              colorDot={row.productos?.origenes?.color_badge}
              stock={row.stock_bolsas}
              umbral={row.umbral_alerta_bolsas}
              unidad="bolsas"
              onAplicar={(delta) => ajustarTostado(row, delta)}
            />
          ))}
        </div>
        <p className="text-[11px] text-brava-reddark/40 mt-1.5 px-1">
          Este stock baja solo cada vez que registras una venta en la pestaña Ventas.
        </p>
      </section>

      <section>
        <p className="text-xs tracking-label text-brava-reddark/50 uppercase mb-2 px-1">
          Insumos (bolsas vacías, etiquetas, etc.)
        </p>
        <div className="bg-white border border-brava-blush rounded-xl px-4">
          {insumos.map((row) => (
            <FilaStock
              key={row.id}
              nombreEl={row.nombre}
              stock={row.stock}
              umbral={row.umbral_alerta}
              unidad="unidades"
              onAplicar={(delta) => ajustarInsumo(row, delta)}
            />
          ))}
          {insumos.length === 0 && (
            <p className="text-sm text-brava-reddark/40 py-4">
              Todavía no hay insumos agregados — súmalos abajo.
            </p>
          )}
        </div>

        <form
          onSubmit={agregarInsumo}
          className="bg-white border border-brava-blush rounded-xl p-4 mt-3 flex flex-wrap gap-3 items-end"
        >
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs text-brava-reddark/60 mb-1">Nombre del insumo</label>
            <input
              type="text"
              placeholder="ej: Bolsas con válvula 250g"
              value={nuevoInsumo.nombre}
              onChange={(e) => setNuevoInsumo({ ...nuevoInsumo, nombre: e.target.value })}
              className="w-full border border-brava-blush rounded-lg px-2.5 py-2 text-sm"
            />
          </div>
          <div className="w-28">
            <label className="block text-xs text-brava-reddark/60 mb-1">Stock inicial</label>
            <input
              type="number"
              min="0"
              value={nuevoInsumo.stock}
              onChange={(e) => setNuevoInsumo({ ...nuevoInsumo, stock: e.target.value })}
              className="w-full border border-brava-blush rounded-lg px-2.5 py-2 text-sm"
            />
          </div>
          <div className="w-28">
            <label className="block text-xs text-brava-reddark/60 mb-1">Alerta bajo</label>
            <input
              type="number"
              min="0"
              value={nuevoInsumo.umbral_alerta}
              onChange={(e) => setNuevoInsumo({ ...nuevoInsumo, umbral_alerta: e.target.value })}
              className="w-full border border-brava-blush rounded-lg px-2.5 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="bg-brava-red text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            Agregar insumo
          </button>
        </form>
      </section>
    </div>
  )
}
