import { useState } from 'react'
import Sidebar from './Sidebar'
import Icon from '../ui/Icon'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-obsidian">

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-obsidian/80 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`
          fixed top-0 left-0 h-full z-30 transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:z-auto lg:h-auto lg:flex-shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-3 px-4 py-3 border-b border-cream/[0.07] bg-navy lg:hidden shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-cream/[0.06] text-slate hover:text-cream transition-colors"
            aria-label="Open menu"
          >
            <Icon name="menu" size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-teal to-teal-light rounded-md flex items-center justify-center">
              <Icon name="activity" size={12} className="text-white" />
            </div>
            <span className="font-serif text-base font-bold text-cream">
              Medic<span className="text-teal-light">AI</span>
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
