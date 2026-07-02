const TABS = [
  { id: 'productos', label: 'Productos', disabled: false },
  { id: 'ventas', label: 'Ventas', disabled: false },
  { id: 'inventario', label: 'Inventario', disabled: true },
  { id: 'finanzas', label: 'Finanzas', disabled: true },
]

export default function NavBar({ active, onChange }) {
  return (
    <header className="border-b border-brava-blush bg-brava-cream sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-5 pt-5 pb-3">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h1 className="font-display text-2xl text-brava-red leading-none">BRAVA</h1>
            <p className="text-[11px] tracking-label text-brava-reddark/70 uppercase mt-1">
              Todo comienza antes
            </p>
          </div>
        </div>
        <nav className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && onChange(tab.id)}
              className={[
                'px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
                active === tab.id
                  ? 'bg-white text-brava-reddark border border-b-0 border-brava-blush'
                  : tab.disabled
                  ? 'text-brava-reddark/30 cursor-not-allowed'
                  : 'text-brava-reddark/60 hover:text-brava-reddark',
              ].join(' ')}
            >
              {tab.label}
              {tab.disabled && (
                <span className="ml-1.5 text-[10px] align-middle">(pronto)</span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
