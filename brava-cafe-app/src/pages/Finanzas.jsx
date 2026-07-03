import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { calcularCosteo, calcularIvaVenta, formatoCLP } from '../lib/costing'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function StatMini({ label, value }) {
  return (
    <div>
      <p className="text-[11px] text-brava-reddark/50">{label}</p>
      <p className="text-sm font-medium text-brava-reddark">{value}</p>
    </div>
  )
}

export default function Finanzas() {
  const [ventas, setVentas] = useState([])
  const [supuestos, setSupuestos] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mesAbierto, setMesAbierto] = useState(null)

  useEffect(() => {
    async function cargar() {
      setLoading(true)
      const [{ data: vts, error: errV }, { data: sup, error: errS }] = await Promise.all([
        supabase
          .from('ventas')
          .select('*, productos(nombre, formato, precio_venta_bruto, origenes(nombre, precio_neto_kg))')
          .order('fecha', { ascending: false }),
        supabase.from('supuestos').select('*').eq('id', 1).single(),
      ])
      if (errV || errS) setError(errV?.message || errS?.message)
      setVentas(vts || [])
      setSupuestos(sup || null)
      setLoading(false)
    }
    cargar()
  }, [])

  const filas = useMemo(() => {
    if (!supuestos) return []
    return ventas
      .filter((v) => v.productos && v.productos.origenes)
      .map((v) => {
        const bruto = v.monto_bruto_unitario * v.cantidad
        const { neto, iva } = calcularIvaVenta(bruto, supuestos.iva_pct)
        const comision = v.medio_pago === 'efectivo' ? 0 : bruto * supuestos.comision_tuu_pct
        const costeoUnit = calcularCosteo(
          {
            formato: v.productos.formato,
            precio_venta_bruto: v.monto_bruto_unitario,
            origenes: v.productos.origenes,
          },
          supuestos,
          'propio'
        )
        const costoDirectoTotal = costeoUnit.costoDirecto * v.cantidad
        const ingresoFinal = neto - comision - costoDirectoTotal
        return { ...v, bruto, neto, iva, comision, costoDirectoTotal, ingresoFinal }
      })
  }, [ventas, supuestos])

  const porMes = useMemo(() => {
    const map = {}
    for (const f of filas) {
      const key = f.fecha.slice(0, 7) // YYYY-MM
      if (!map[key]) {
        map[key] = { bruto: 0, neto: 0, iva: 0, comision: 0, costo: 0, final: 0, ventas: [] }
      }
      map[key].bruto += f.bruto
      map[key].neto += f.neto
      map[key].iva += f.iva
      map[key].comision += f.comision
      map[key].costo += f.costoDirectoTotal
      map[key].final += f.ingresoFinal
      map[key].ventas.push(f)
    }
    return map
  }, [filas])

  const mesesOrdenados = Object.keys(porMes).sort().reverse()
  const anioMasReciente = mesesOrdenados[0]?.slice(0, 4) ?? String(new Date().getFullYear())

  if (loading) return <p className="text-sm text-brava-reddark/60 px-1">Cargando finanzas…</p>
  if (error) return <p className="text-sm text-red-700 px-1">No se pudo cargar: {error}</p>

  return (
    <div>
      {mesesOrdenados.length === 0 && (
        <p className="text-sm text-brava-reddark/50 px-1">
          Todavía no hay ventas registradas — agrega una en la pestaña Ventas y va a aparecer acá.
        </p>
      )}

      <div className="space-y-2 mb-8">
        {mesesOrdenados.map((mesKey) => {
          const d = porMes[mesKey]
          const [anio, mesNum] = mesKey.split('-')
          const nombreMes = MESES[parseInt(mesNum, 10) - 1]
          const abierto = mesAbierto === mesKey

          return (
            <div key={mesKey} className="bg-white border border-brava-blush rounded-xl overflow-hidden">
              <button
                onClick={() => setMesAbierto(abierto ? null : mesKey)}
                className="w-full flex justify-between items-center px-4 py-3 text-left"
              >
                <span className="font-medium text-sm text-brava-reddark">
                  {nombreMes} {anio}
                </span>
                <div className="flex gap-5 text-sm">
                  <span className="text-brava-reddark/60">{formatoCLP(d.bruto)} bruto</span>
                  <span className="text-green-700 font-medium">{formatoCLP(d.final)} final</span>
                </div>
              </button>

              {abierto && (
                <div className="border-t border-brava-blush px-4 py-3">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                    <StatMini label="Ingreso bruto" value={formatoCLP(d.bruto)} />
                    <StatMini label="Ingreso líquido" value={formatoCLP(d.neto)} />
                    <StatMini label="IVA recaudado" value={formatoCLP(d.iva)} />
                    <StatMini label="Comisión TUU" value={formatoCLP(d.comision)} />
                    <StatMini label="Costo directo" value={formatoCLP(d.costo)} />
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-brava-reddark/50 uppercase tracking-label border-b border-brava-blush">
                          <th className="py-2 pr-3 font-medium">Fecha</th>
                          <th className="py-2 pr-3 font-medium">Producto</th>
                          <th className="py-2 pr-3 font-medium">Cant.</th>
                          <th className="py-2 pr-3 font-medium text-right">Bruto</th>
                          <th className="py-2 pr-3 font-medium text-right">Costo</th>
                          <th className="py-2 pr-3 font-medium text-right">Ingreso final</th>
                        </tr>
                      </thead>
                      <tbody>
                        {d.ventas.map((v) => (
                          <tr key={v.id} className="border-b border-brava-blush/50 last:border-0">
                            <td className="py-2 pr-3">{v.fecha}</td>
                            <td className="py-2 pr-3">
                              {v.productos.origenes.nombre} {v.productos.formato}
                            </td>
                            <td className="py-2 pr-3">{v.cantidad}</td>
                            <td className="py-2 pr-3 text-right">{formatoCLP(v.bruto)}</td>
                            <td className="py-2 pr-3 text-right">{formatoCLP(v.costoDirectoTotal)}</td>
                            <td className="py-2 pr-3 text-right font-medium">
                              {formatoCLP(v.ingresoFinal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {mesesOrdenados.length > 0 && (
        <div>
          <p className="text-xs tracking-label text-brava-reddark/50 uppercase mb-2 px-1">
            Resumen {anioMasReciente}
          </p>
          <div className="bg-white border border-brava-blush rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-brava-reddark/50 uppercase tracking-label border-b border-brava-blush">
                  <th className="px-4 py-2.5 font-medium">Mes</th>
                  <th className="px-4 py-2.5 font-medium text-right">Bruto</th>
                  <th className="px-4 py-2.5 font-medium text-right">Costo directo</th>
                  <th className="px-4 py-2.5 font-medium text-right">Ingreso final</th>
                </tr>
              </thead>
              <tbody>
                {MESES.map((nombreMes, idx) => {
                  const key = `${anioMasReciente}-${String(idx + 1).padStart(2, '0')}`
                  const d = porMes[key]
                  if (!d) return null
                  return (
                    <tr key={key} className="border-b border-brava-blush/50 last:border-0">
                      <td className="px-4 py-2">{nombreMes}</td>
                      <td className="px-4 py-2 text-right">{formatoCLP(d.bruto)}</td>
                      <td className="px-4 py-2 text-right">{formatoCLP(d.costo)}</td>
                      <td className="px-4 py-2 text-right font-medium">{formatoCLP(d.final)}</td>
                    </tr>
                  )
                })}
                <tr className="bg-brava-cream font-medium">
                  <td className="px-4 py-2.5">Total {anioMasReciente}</td>
                  <td className="px-4 py-2.5 text-right">
                    {formatoCLP(
                      Object.entries(porMes)
                        .filter(([k]) => k.startsWith(anioMasReciente))
                        .reduce((s, [, d]) => s + d.bruto, 0)
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {formatoCLP(
                      Object.entries(porMes)
                        .filter(([k]) => k.startsWith(anioMasReciente))
                        .reduce((s, [, d]) => s + d.costo, 0)
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {formatoCLP(
                      Object.entries(porMes)
                        .filter(([k]) => k.startsWith(anioMasReciente))
                        .reduce((s, [, d]) => s + d.final, 0)
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
