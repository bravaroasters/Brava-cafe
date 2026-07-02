import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import ProductCard from '../components/ProductCard'

export default function Productos() {
  const [productos, setProductos] = useState([])
  const [supuestos, setSupuestos] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function cargar() {
      setLoading(true)
      const [{ data: prod, error: errProd }, { data: sup, error: errSup }] = await Promise.all([
        supabase.from('productos').select('*').eq('activo', true).order('origen'),
        supabase.from('supuestos').select('*').eq('id', 1).single(),
      ])
      if (errProd || errSup) {
        setError(errProd?.message || errSup?.message)
      } else {
        setProductos(prod)
        setSupuestos(sup)
      }
      setLoading(false)
    }
    cargar()
  }, [])

  if (loading) return <p className="text-sm text-brava-reddark/60 px-1">Cargando productos…</p>
  if (error)
    return (
      <p className="text-sm text-red-700 px-1">
        No se pudo cargar: {error}. Revisa la conexión con Supabase.
      </p>
    )

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs tracking-label text-brava-reddark/50 uppercase">
          {productos.length} productos activos
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {productos.map((p) => (
          <ProductCard key={p.id} producto={p} supuestos={supuestos} />
        ))}
      </div>
    </div>
  )
}
