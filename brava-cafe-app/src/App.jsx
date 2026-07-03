import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import NavBar from './components/NavBar'
import Login from './pages/Login'
import Productos from './pages/Productos'
import Ventas from './pages/Ventas'
import Finanzas from './pages/Finanzas'
import ProximamentePage from './pages/ProximamentePage'

export default function App() {
  const [tab, setTab] = useState('productos')
  const [session, setSession] = useState(undefined) // undefined = cargando

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-brava-cream flex items-center justify-center">
        <p className="text-sm text-brava-reddark/50">Cargando…</p>
      </div>
    )
  }

  if (!session) {
    return <Login />
  }

  return (
    <div className="min-h-screen bg-brava-cream">
      <NavBar active={tab} onChange={setTab} onLogout={() => supabase.auth.signOut()} />
      <main className="max-w-5xl mx-auto px-5 py-6">
        {tab === 'productos' && <Productos />}
        {tab === 'ventas' && <Ventas />}
        {tab === 'inventario' && <ProximamentePage nombre="Inventario" />}
        {tab === 'finanzas' && <Finanzas />}
      </main>
    </div>
  )
}
