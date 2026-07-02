import { calcularCosteo, formatoCLP, formatoPct } from '../lib/costing'

const ORIGEN_STYLES = {
  Colombia: {
    bg: 'bg-brava-blush',
    text: 'text-brava-reddark',
    badge: 'bg-brava-red text-white',
  },
  Honduras: {
    bg: 'bg-honduras-sage',
    text: 'text-honduras-greendark',
    badge: 'bg-honduras-green text-white',
  },
}

export default function ProductCard({ producto, supuestos, stock }) {
  const style = ORIGEN_STYLES[producto.origen] ?? ORIGEN_STYLES.Colombia
  const costeo = calcularCosteo(producto, supuestos, 'propio')
  const stockBajo = stock !== undefined && stock <= 4

  return (
    <div className={`${style.bg} rounded-xl p-4`}>
      <div className="flex justify-between items-start">
        <div>
          <p className={`font-medium text-sm ${style.text}`}>
            {producto.origen} {producto.formato}
          </p>
          <p className={`text-xs ${style.text} opacity-70`}>Single origin</p>
        </div>
        <span className={`text-[11px] font-medium px-2 py-1 rounded-full ${style.badge}`}>
          {formatoPct(costeo.margenPct)} margen
        </span>
      </div>

      <div className="flex items-baseline gap-1.5 mt-3.5">
        <span className={`text-xl font-medium ${style.text}`}>
          {formatoCLP(producto.precio_venta_bruto)}
        </span>
        <span className={`text-xs ${style.text} opacity-70`}>IVA incluido</span>
      </div>

      {stock !== undefined && (
        <div className="flex items-center gap-1.5 mt-2.5">
          <span
            className={`w-2 h-2 rounded-full ${stockBajo ? 'bg-amber-600' : 'bg-green-700'}`}
          />
          <span className={`text-xs ${style.text} opacity-80`}>
            {stock} {producto.formato === '250g' ? 'bolsas' : 'bolsas'} en stock
            {stockBajo ? ' — stock bajo' : ''}
          </span>
        </div>
      )}

      <details className="mt-3">
        <summary className={`text-xs ${style.text} opacity-70 cursor-pointer`}>
          Ver desglose de costo
        </summary>
        <div className={`text-xs ${style.text} opacity-90 mt-2 space-y-1`}>
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
