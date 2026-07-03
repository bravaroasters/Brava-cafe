import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error: errLogin } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (errLogin) setError('Correo o contraseña incorrectos.')
  }

  return (
    <div className="min-h-screen bg-brava-cream flex items-center justify-center px-5">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white border border-brava-blush rounded-xl p-6"
      >
        <h1 className="font-display text-2xl text-brava-red mb-1">BRAVA</h1>
        <p className="text-[11px] tracking-label text-brava-reddark/60 uppercase mb-6">
          Todo comienza antes
        </p>

        <label className="block text-xs text-brava-reddark/60 mb-1">Correo</label>
        <input
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-brava-blush rounded-lg px-3 py-2 text-sm mb-3"
        />

        <label className="block text-xs text-brava-reddark/60 mb-1">Contraseña</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-brava-blush rounded-lg px-3 py-2 text-sm mb-4"
        />

        {error && <p className="text-sm text-red-700 mb-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brava-red text-white text-sm font-medium py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
