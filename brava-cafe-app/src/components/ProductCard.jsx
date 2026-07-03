import { calcularCosteo, formatoCLP, formatoPct } from '../lib/costing'

export default function ProductCard({ producto, supuestos, stock }) {
  const origen = producto.origenes
  const costeo = calcularCosteo(producto, supuestos, 'propio')
  const stockBajo = stock !== undefined && stock <= 4

  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: origen.color_bg }}>
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium text-sm" style={{ color: origen.color_text }}>
            {origen.nombre} {producto.formato}
          </p>
          <p className="text-xs opacity-70" style={{ color: origen.color_text }}>
            Single origin
          </p>
        </div>
        <span
          className="text-[11px] font-medium px-2 py-1 rounded-full text-white"
          style={{ backgroundColor: origen.color_badge }}
        >
          {formatoPct(costeo.margenPct)} margen
        </span>
      </div>

      <div className="flex items-baseline gap-1.5 mt-3.5">
        <span className="text-xl font-medium" style={{ color: origen.color_text }}>
          {formatoCLP(producto.precio_venta_bruto)}
        </span>
        <span className="text-xs opacity-70" style={{ color: origen.color_text }}>
          IVA incluido
        </span>
      </div>

      {stock !== undefined && (
        <div className="flex items-center gap-1.5 mt-2.5">
          <span
            className={`w-2 h-2 rounded-full ${stockBajo ? 'bg-amber-600' : 'bg-green-700'}`}
          />
          <span className="text-xs opacity-80" style={{ color: origen.color_text }}>
            {stock} bolsas en stock{stockBajo ? ' — stock bajo' : ''}
          </span>
        </div>
      )}

      <details className="mt-3">
        <summary
          className="text-xs opacity-70 cursor-pointer"
          style={{ color: origen.color_text }}
        >
          Ver desglose de costo
        </summary>
        <div
          className="text-xs opacity-90 mt-2 space-y-1"
          style={{ color: origen.color_text }}
        >
          <div className="flex justify-between">
            <span>Café verde</span>
            <span>{formatoCLP(costeo.costoCafe)}</span>
          </div>
          <div className="flex justify-between">
            <span>Empaque</span>
            <span>{formatoCLP(costeo.costoEmpaque)}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Costo directo</span>
            <span>{formatoCLP(costeo.costoDirecto)}</span>
          </div>
          <div className="flex justify-between">
            <span>Comisión TUU</span>
            <span>{formatoCLP(costeo.comisionTuu)}</span>
          </div>
          <div className="flex justify-between font-medium pt-1 border-t border-black/10">
            <span>Margen final</span>
            <span>
              {formatoCLP(costeo.margenFinal)} ({formatoPct(costeo.margenFinalPct)})
            </span>
          </div>
        </div>
      </details>
    </div>
  )
}
