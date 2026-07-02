import { useState } from 'react'
import NavBar from './components/NavBar'
import Productos from './pages/Productos'
import Ventas from './pages/Ventas'
import ProximamentePage from './pages/ProximamentePage'

export default function App() {
  const [tab, setTab] = useState('productos')

  return (
    <div className="min-h-screen bg-brava-cream">
      <NavBar active={tab} onChange={setTab} />
      <main className="max-w-5xl mx-auto px-5 py-6">
        {tab === 'productos' && <Productos />}
        {tab === 'ventas' && <Ventas />}
        {tab === 'inventario' && <ProximamentePage nombre="Inventario" />}
        {tab === 'finanzas' && <ProximamentePage nombre="Finanzas" />}
      </main>
    </div>
  )
}
