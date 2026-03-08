import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/layout/Header'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import MetricCard from '../../components/shared/MetricCard'
import { useAuth } from '../../context/AuthContext'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const VITALS = [
  { label: 'Blood Pressure', value: '118/76', unit: 'mmHg' },
  { label: 'Heart Rate', value: '72', unit: 'bpm' },
  { label: 'Blood Glucose', value: '94', unit: 'mg/dL' },
]

const QUICK_ACTIONS = [
  { icon: 'phone', label: 'Book Appointment', desc: "Book an doctor's appointment", color: 'teal', page: '/booking' },  
  { icon: 'upload', label: 'Upload Docs', desc: 'Add records', color: 'amber', page: '/documents' },
  { icon: 'heart', label: 'Med History', desc: 'View records', color: 'rose', page: '/history' },
  { icon: 'mic', label: 'Voice Chat', desc: 'Chat with AI assistant', color: 'teal', page: '/chat' },
  
]

const COLOR_CLASSES = {
  teal: { bg: 'bg-teal/10', hover: 'hover:bg-teal/20', border: 'border-teal/25', icon: 'bg-teal/25', text: 'text-teal-light' },
  amber: { bg: 'bg-amber/10', hover: 'hover:bg-amber/20', border: 'border-amber/25', icon: 'bg-amber/25', text: 'text-amber' },
  rose: { bg: 'bg-rose/10', hover: 'hover:bg-rose/20', border: 'border-rose/25', icon: 'bg-rose/25', text: 'text-rose' },
  sage: { bg: 'bg-sage/10', hover: 'hover:bg-sage/20', border: 'border-sage/25', icon: 'bg-sage/25', text: 'text-[#6BAF9F]' },
}

export default function PatientHome() {
  const { auth } = useAuth()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [filterMode, setFilterMode] = useState('today') // 'today' | 'tomorrow' | 'custom'
  const [customDate, setCustomDate] = useState('');
  const [userDocuments, setUserDocuments] = useState([])

  const filteredAppointments = appointments.filter(appt => {
    if (!appt.dateObj) return false

    const apptDateStr = appt.dateObj.toDateString()

    const todayStr = new Date().toDateString()

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toDateString()

    if (filterMode === 'today') {
      return apptDateStr === todayStr
    }

    if (filterMode === 'tomorrow') {
      return apptDateStr === tomorrowStr
    }

    if (filterMode === 'custom' && customDate) {
      const customStr = new Date(customDate).toDateString()
      return apptDateStr === customStr
    }

    return true
  })


  useEffect(() => {
    if (!auth?.id) return
    let cancelled = false
    const loadAppointments = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/${auth.id}/appointments`)
        if (!res.ok) throw new Error('Failed to load appointments')
        const data = await res.json()
        if (cancelled) return
        // const mapped = (data || []).map((a, idx) => {
        //   const d = a.date ? new Date(a.date) : null
        //   const dateLabel = d
        //     ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
        //     : ''
        //   const timeLabel = d
        //     ? d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        //     : ''
        //   return {
        //     id: a._id || idx,
        //     doctor: a.doctorOrClinic || 'Doctor',
        //     specialty: a.location || 'Visit',
        //     date: dateLabel,
        //     time: timeLabel,
        //     status: 'confirmed',
        //     callSummary: a.call_summary,
        //     documents: a.related_documents || [],
        //     historySummary: a.history_summary,
        //   }
        // })
        // Use appointment date/time (when patient asked to book) for display; fallback to booking date
        const mapped = (data || [])
          .map((a, idx) => {
            const raw = a.appointmentDateTime ?? a.date
            const d = raw ? new Date(raw) : null

            return {
              id: a._id || idx,
              doctor: a.doctorOrClinic || 'Doctor',
              specialty: a.location || 'Visit',
              dateObj: d, // keep real Date for sorting/filtering
              date: d
                ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                : '',
              time: d
                ? d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                : '',
              status: a.status || 'pending',
              callSummary: a.call_summary,
              documents: a.related_documents || [],
              historySummary: a.history_summary,
            }
          })
          .sort((a, b) => {
            if (!a.dateObj) return 1
            if (!b.dateObj) return -1
            return a.dateObj - b.dateObj
          })
          console.log(mapped)
        setAppointments(mapped)
      } catch (e) {
        console.error(e)
      }
    }
    loadAppointments()
    const fetchUserDocuments = async () => {
      const response = await fetch(`${API_BASE_URL}/users/${auth.id}/documents`)
      const data = await response.json()
      setUserDocuments(data)
    }
    fetchUserDocuments()
    return () => {
      cancelled = true
    }
  }, [auth?.id])

  const todayDate = new Date().toDateString();

  return (
    <div className="animate-fade-in">
      <Header
        title={`Good morning, ${auth?.name || 'there'}.`}
        subtitle={`Here's your health overview for today ${todayDate.split(' ')[1]} ${todayDate.split(' ')[2]}.`}
        actions={<Button variant="ghost" icon="bell">Alerts</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-5">
        <MetricCard
          label="Upcoming Visits"
          value={appointments.length.toString()}
          sub={appointments[0]?.date ? `Next: ${appointments[0].date}` : 'No visits yet'}
          icon="calendar"
          color="teal"
        />
        <MetricCard label="Documents" value={userDocuments.length.toString()} icon="file" color="amber" />
        <MetricCard label="Active Meds" value="3" sub="Refills current" icon="heart" color="sage" />
        <MetricCard label="Health Score" value="87" sub="↑ 4 pts this month" icon="star" color="teal" trend={5} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mb-4 md:mb-5">

        <Card className="flex flex-col max-h-[420px] overflow-hidden">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2 shrink-0">
            <h3 className="text-sm sm:text-[15px] font-semibold text-cream">
              Upcoming Appointments
            </h3>

            <div className="flex items-center gap-2">
              <select
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value)}
                className="
        bg-teal/10
        border border-teal/40
        text-cream
        text-sm
        rounded-lg
        px-3 py-1.5
        focus:outline-none
        focus:ring-2
        focus:ring-teal
        focus:border-teal
        hover:bg-teal/20
        transition-colors
      "
              >
                <option value="today" className="bg-navy text-cream">Today</option>
                <option value="tomorrow" className="bg-navy text-cream">Tomorrow</option>
                <option value="custom" className="bg-navy text-cream">Custom</option>
              </select>

              {filterMode === 'custom' && (
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="
          bg-teal/10
          border border-teal/40
          text-cream
          text-sm
          rounded-lg
          px-3 py-1.5
          focus:outline-none
          focus:ring-2
          focus:ring-teal
          transition-colors
        "
                />
              )}

              <Button variant="ghost" onClick={() => navigate('/booking')}>
                + New
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto -mx-4 px-4">
            {filteredAppointments.map((appt, i) => (
              <div
                key={appt.id ?? i}
                className={`flex gap-3 py-3.5 ${i < filteredAppointments.length - 1 ? 'border-b border-cream/[0.08]' : ''}`}
              >
                <div className="w-10 h-10 bg-teal/20 rounded-xl flex items-center justify-center shrink-0">
                  <Icon name="stethoscope" size={16} className="text-teal-light" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-cream truncate">{appt.doctor}</p>
                  <p className="text-xs text-slate">{appt.specialty}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <Badge
                      variant={
                        appt.status === 'confirmed'
                          ? 'teal'
                          : appt.status === 'rejected'
                          ? 'rose'
                          : 'amber'
                      }
                    >
                      {appt.status}
                    </Badge>
                    <span className="text-[11px] text-slate">{appt.date} · {appt.time}</span>
                  </div>
                  {appt.callSummary && (
                    <p className="text-xs text-cream-dk mt-1.5 line-clamp-2">
                      {appt.callSummary}
                    </p>
                  )}
                  {appt.documents && appt.documents.length > 0 && (
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-[11px] text-slate">Documents:</span>

                      {[...new Set(appt.documents)].map((docUrl, docIdx) => (
                        <button
                          key={docIdx}
                          onClick={() => window.open(docUrl, "_blank", "noopener,noreferrer")}
                          className="w-7 h-7 bg-amber/20 hover:bg-amber/30 rounded-lg flex items-center justify-center transition-colors"
                          title="Open document"
                        >
                          <Icon name="file" size={14} className="text-amber" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

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
