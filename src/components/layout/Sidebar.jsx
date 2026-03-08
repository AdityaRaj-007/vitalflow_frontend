import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Icon from '../ui/Icon'

const PATIENT_LINKS = [
  { path: '/',           icon: 'home',    label: 'Dashboard' },
  { path: '/booking',    icon: 'phone',   label: 'Book Appointment' },
  { path: '/documents',  icon: 'upload',  label: 'Documents' },
  { path: '/insurance',  icon: 'shield',  label: 'Insurance & Bills' },
  { path: '/history',    icon: 'heart',   label: 'Medical History' },
]

const DOCTOR_LINKS = [
  { path: '/',          icon: 'calendar',  label: 'Schedule' },
  { path: '/golden',    icon: 'star',      label: 'Golden Record' },
  { path: '/docreview', icon: 'clipboard', label: 'Doc Review' },
  { path: '/priorauth', icon: 'shield',    label: 'Prior Auth' },
]

export default function Sidebar({ onClose }) {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const links = auth?.role === 'doctor' ? DOCTOR_LINKS : PATIENT_LINKS
  const initials = auth?.name?.split(' ').map(n => n[0]).join('') || '??'

  const handleNav = (path) => {
    navigate(path)
    onClose?.()
  }

  return (
    <aside className="w-64 h-screen bg-navy border-r border-cream/[0.07] flex flex-col px-4 py-6 overflow-hidden">

      <div className="flex items-center justify-between px-2 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-teal to-teal-light rounded-lg flex items-center justify-center shrink-0">
            <Icon name="activity" size={16} className="text-white" />
          </div>
          <div>
            <p className="font-serif text-base font-bold text-cream leading-none">
              Vital<span className="text-teal-light">Flow</span>
            </p>
            <p className="text-[10px] text-slate uppercase tracking-widest mt-0.5 capitalize">
              {auth?.role}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg bg-cream/[0.06] text-slate hover:text-cream transition-colors"
          aria-label="Close menu"
        >
          <Icon name="x" size={14} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto">
        <p className="section-label px-3.5 mb-2">Navigation</p>
        {links.map(link => {
          const active = pathname === link.path
          return (
            <button
              key={link.path}
              onClick={() => handleNav(link.path)}
              className={`nav-link w-full mb-0.5 ${active ? 'active' : ''}`}
            >
              <Icon
                name={link.icon}
                size={16}
                className={active ? 'text-teal-light' : 'text-slate'}
              />
              {link.label}
            </button>
          )
        })}
      </nav>

      <div>
        <hr className="border-cream/[0.08] my-4" />
        <div className="flex items-center gap-2.5 px-3.5 mb-1">
          <div className="w-8 h-8 bg-gradient-to-br from-sage to-teal rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-cream font-medium truncate">{auth?.name}</p>
            <p className="text-[11px] text-slate truncate">{auth?.id}</p>
          </div>
        </div>
        <button
          onClick={() => { logout(); onClose?.() }}
          className="nav-link w-full text-slate"
        >
          <Icon name="logout" size={16} className="text-slate" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
