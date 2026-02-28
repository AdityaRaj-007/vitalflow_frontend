import { useNavigate } from 'react-router-dom'
import Header from '../../components/layout/Header'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import MetricCard from '../../components/shared/MetricCard'

const UPCOMING = [
  { doctor: 'Dr. Sarah Chen',  specialty: 'Cardiology',       date: 'Feb 28, 2026', time: '10:30 AM', status: 'confirmed' },
  { doctor: 'Dr. Marcus Webb', specialty: 'General Practice', date: 'Mar 5, 2026',  time: '2:00 PM',  status: 'pending'   },
]

const VITALS = [
  { label: 'Blood Pressure', value: '118/76', unit: 'mmHg' },
  { label: 'Heart Rate',     value: '72',     unit: 'bpm'  },
  { label: 'Blood Glucose',  value: '94',     unit: 'mg/dL'},
]

const QUICK_ACTIONS = [
  { icon: 'mic',    label: 'Voice Chat',     desc: 'Chat with AI assistant', color: 'teal',  page: '/booking'   },
  { icon: 'upload', label: 'Upload Docs',    desc: 'Add records',            color: 'amber', page: '/documents' },
  { icon: 'heart',  label: 'Med History',   desc: 'View records',           color: 'rose',  page: '/history'   },
  { icon: 'search', label: 'Find Doctor',   desc: 'Search providers',       color: 'sage',  page: '/'          },
]

const COLOR_CLASSES = {
  teal:  { bg: 'bg-teal/10',  hover: 'hover:bg-teal/20',  border: 'border-teal/25',  icon: 'bg-teal/25',  text: 'text-teal-light' },
  amber: { bg: 'bg-amber/10', hover: 'hover:bg-amber/20', border: 'border-amber/25', icon: 'bg-amber/25', text: 'text-amber'      },
  rose:  { bg: 'bg-rose/10',  hover: 'hover:bg-rose/20',  border: 'border-rose/25',  icon: 'bg-rose/25',  text: 'text-rose'       },
  sage:  { bg: 'bg-sage/10',  hover: 'hover:bg-sage/20',  border: 'border-sage/25',  icon: 'bg-sage/25',  text: 'text-[#6BAF9F]'  },
}

export default function PatientHome() {
  const navigate = useNavigate()

  return (
    <div className="animate-fade-in">
      <Header
        title="Good morning, James."
        subtitle="Here's your health overview for today — Feb 25."
        actions={<Button variant="ghost" icon="bell">Alerts</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-5">
        <MetricCard label="Upcoming Visits"  value="2"  sub="Next: Feb 28"         icon="calendar"  color="teal"  />
        <MetricCard label="Documents"        value="14" sub="3 pending"             icon="file"      color="amber" />
        <MetricCard label="Active Meds"      value="3"  sub="Refills current"       icon="heart"     color="sage"  />
        <MetricCard label="Health Score"     value="87" sub="↑ 4 pts this month"   icon="star"      color="teal"  trend={5} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mb-4 md:mb-5">

        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm sm:text-[15px] font-semibold text-cream">Upcoming Appointments</h3>
            <Button variant="ghost" onClick={() => navigate('/booking')}>+ New</Button>
          </div>
          {UPCOMING.map((appt, i) => (
            <div
              key={i}
              className={`flex gap-3 py-3.5 ${i < UPCOMING.length - 1 ? 'border-b border-cream/[0.08]' : ''}`}
            >
              <div className="w-10 h-10 bg-teal/20 rounded-xl flex items-center justify-center shrink-0">
                <Icon name="stethoscope" size={16} className="text-teal-light" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-cream truncate">{appt.doctor}</p>
                <p className="text-xs text-slate">{appt.specialty}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <Badge variant={appt.status === 'confirmed' ? 'teal' : 'amber'}>{appt.status}</Badge>
                  <span className="text-[11px] text-slate">{appt.date} · {appt.time}</span>
                </div>
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <h3 className="text-sm sm:text-[15px] font-semibold text-cream mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2.5">
            {QUICK_ACTIONS.map(action => {
              const c = COLOR_CLASSES[action.color]
              return (
                <div
                  key={action.label}
                  onClick={() => navigate(action.page)}
                  className={`p-3 sm:p-4 ${c.bg} ${c.hover} border ${c.border} rounded-xl cursor-pointer transition-colors duration-200`}
                >
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 ${c.icon} rounded-lg flex items-center justify-center mb-2`}>
                    <Icon name={action.icon} size={14} className={c.text} />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-cream leading-tight">{action.label}</p>
                  <p className="text-[10px] sm:text-[11px] text-slate mt-0.5 hidden sm:block">{action.desc}</p>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-sm sm:text-[15px] font-semibold text-cream mb-4">Latest Vitals</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {VITALS.map((v, i) => (
            <div key={i} className="bg-cream/[0.04] rounded-xl p-4 flex sm:flex-col items-center sm:text-center gap-4 sm:gap-0">
              <div className="sm:mb-2 sm:mt-0 flex-1 sm:flex-none text-left sm:text-center">
                <p className="text-xs text-slate uppercase tracking-wide sm:mb-2">{v.label}</p>
                <p className="font-serif text-2xl sm:text-3xl font-semibold text-cream">{v.value}</p>
                <p className="text-[11px] text-slate sm:mb-2">{v.unit}</p>
              </div>
              <Badge variant="sage">normal</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
