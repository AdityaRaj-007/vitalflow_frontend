import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Icon from '../../components/ui/Icon'

export default function AuthPage() {
  const { login } = useAuth()
  const [mode, setMode]       = useState('login')
  const [role, setRole]       = useState('patient')
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => { setLoading(false); login(role) }, 1200)
  }

  const features = [
    { icon: 'mic',    text: 'Book appointments with your voice' },
    { icon: 'shield', text: 'End-to-end encrypted health records' },
    { icon: 'star',   text: 'AI-generated Golden Record summaries' },
  ]

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-obsidian overflow-hidden relative">

      <div className="absolute top-[10%] left-[5%] w-72 h-72 lg:w-96 lg:h-96 bg-teal/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-56 h-56 lg:w-72 lg:h-72 bg-amber/[0.07] rounded-full blur-3xl pointer-events-none" />

      <div className="hidden lg:flex flex-1 flex-col justify-center px-12 xl:px-20 bg-gradient-to-br from-navy/95 to-obsidian border-r border-cream/[0.06]">
        <div className="max-w-xl">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-gradient-to-br from-teal to-teal-light rounded-xl flex items-center justify-center">
              <Icon name="activity" size={20} className="text-white" />
            </div>
            <span className="font-serif text-2xl font-bold text-cream">
              Medic<span className="text-teal-light">AI</span>
            </span>
          </div>
          <h2 className="font-serif text-4xl xl:text-5xl font-bold text-cream leading-[1.15] mb-5">
            Intelligent<br />Healthcare,<br />
            <span className="text-teal-light">Reimagined.</span>
          </h2>
          <p className="text-slate text-[15px] leading-relaxed mb-10">
            Voice-enabled appointment booking, AI-powered document review, and
            unified medical records — all in one secure platform.
          </p>
          <ul className="flex flex-col gap-4">
            {features.map(f => (
              <li key={f.text} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-teal/15 rounded-lg flex items-center justify-center shrink-0">
                  <Icon name={f.icon} size={15} className="text-teal-light" />
                </div>
                <span className="text-cream-dk text-sm">{f.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-5 sm:p-8 lg:p-10 min-h-screen lg:min-h-0">

        <div className="flex items-center gap-2.5 mb-8 lg:hidden">
          <div className="w-9 h-9 bg-gradient-to-br from-teal to-teal-light rounded-xl flex items-center justify-center">
            <Icon name="activity" size={18} className="text-white" />
          </div>
          <span className="font-serif text-xl font-bold text-cream">
            Medic<span className="text-teal-light">AI</span>
          </span>
        </div>

        <div className="w-full max-w-sm animate-fade-up">
          <div className="card-glass p-6 sm:p-10">

            <div className="flex bg-cream/[0.06] rounded-xl p-1 mb-6">
              {['patient', 'doctor'].map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium font-sans capitalize transition-all duration-200
                    ${role === r
                      ? 'bg-gradient-to-br from-teal to-teal-light text-white'
                      : 'text-slate bg-transparent'}`}
                >
                  {r === 'doctor' ? '🩺 ' : '👤 '}{r}
                </button>
              ))}
            </div>

            <h3 className="font-serif text-xl sm:text-2xl text-cream font-semibold mb-1">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h3>
            <p className="text-slate text-[13px] mb-5">
              {mode === 'login'
                ? 'Sign in to your MedicAI account'
                : 'Get started with MedicAI today'}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {mode === 'register' && (
                <div>
                  <label className="form-label">Full Name</label>
                  <input className="form-input" type="text" placeholder="James Park" />
                </div>
              )}
              <div>
                <label className="form-label">Email Address</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPass(e.target.value)}
                />
              </div>

              {mode === 'login' && (
                <p className="text-right text-[12px] text-teal-light cursor-pointer hover:underline">
                  Forgot password?
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3.5 mt-1"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin-slow" />
                    Signing in…
                  </>
                ) : (mode === 'login' ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <p className="text-center text-[13px] text-slate mt-5">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <span
                className="text-teal-light font-medium cursor-pointer hover:underline"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
