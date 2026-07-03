// Toda la lógica de costeo vive acá, en un solo lugar, para que Productos,
// Ventas y (más adelante) Finanzas usen siempre el mismo cálculo.
// Refleja 1:1 las fórmulas validadas en BRAVA_Cafe_Costeo.xlsx.

const PESO_KG = {
  '250g': 0.25,
  '1kg': 1,
}

const MERMA_POR_FORMATO = {
  '250g': 'merma_250g',
  '1kg': 'merma_1kg',
}

/**
 * Calcula el desglose de costos y margen de un producto dado los supuestos vigentes.
 * @param {object} producto - fila de productos, con el origen ya unido (join): producto.origenes.precio_neto_kg
 * @param {object} supuestos - fila de la tabla supuestos (config vigente)
 * @param {'propio'|'externo'} modoTueste
 */
export function calcularCosteo(producto, supuestos, modoTueste = 'propio') {
  const pesoTostadoKg = PESO_KG[producto.formato]
  const merma = supuestos[MERMA_POR_FORMATO[producto.formato]]
  const precioGranoKg = producto.origenes.precio_neto_kg

  const rendimiento = 1 - merma
  const granoNecesarioKg = pesoTostadoKg / rendimiento
  const costoCafe = granoNecesarioKg * precioGranoKg

  const costoTueste =
    modoTueste === 'externo'
      ? granoNecesarioKg * supuestos.costo_tueste_externo
      : pesoTostadoKg * supuestos.costo_tueste_propio

  const costoEmpaque = supuestos.costo_bolsa + supuestos.costo_etiqueta
  const costoDirecto = costoCafe + costoTueste + costoEmpaque

  const precioVentaNeto = producto.precio_venta_bruto / (1 + supuestos.iva_pct)
  const margenNeto = precioVentaNeto - costoDirecto
  const margenPct = margenNeto / precioVentaNeto

  const comisionTuu = producto.precio_venta_bruto * supuestos.comision_tuu_pct
  const margenFinal = margenNeto - comisionTuu
  const margenFinalPct = margenFinal / precioVentaNeto

  return {
    granoNecesarioKg,
    costoCafe,
    costoTueste,
    costoEmpaque,
    costoDirecto,
    precioVentaNeto,
    margenNeto,
    margenPct,
    comisionTuu,
    margenFinal,
    margenFinalPct,
  }
}

/** Calcula el IVA de una venta dado su monto bruto y la tasa vigente. */
export function calcularIvaVenta(montoBruto, ivaPct) {
  const neto = montoBruto / (1 + ivaPct)
  const iva = montoBruto - neto
  return { neto, iva }
}

export function formatoCLP(valor) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(Math.round(valor || 0))
}

export function formatoPct(valor, decimales = 1) {
  return `${(valor * 100).toFixed(decimales)}%`
}
