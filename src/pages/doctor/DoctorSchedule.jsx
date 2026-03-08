import { useEffect, useState, useMemo } from 'react'
import Header from '../../components/layout/Header'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import { useAuth } from '../../context/AuthContext'

// Displayable hour slots for the day view
const HOURS = [
  '8:00', '9:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00',
  '16:00', '17:00', '18:00', '19:00', '20:00',
]
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export default function DoctorSchedule() {
  const { auth } = useAuth()
  const [view, setView] = useState('queue')
  const [doctorId, setDoctorId] = useState(null)
  const [slots, setSlots] = useState([])
  const [filterMode, setFilterMode] = useState('today')
  const [customDate, setCustomDate] = useState('');

  const filteredSlots = useMemo(() => {
    if (!slots.length) return []
    const todayStr = new Date().toDateString()
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toDateString()
    return slots.filter(slot => {
      const d = slot.startTime ? new Date(slot.startTime) : null
      if (!d) return false
      const slotDateStr = d.toDateString()
      if (filterMode === 'today') return slotDateStr === todayStr
      if (filterMode === 'tomorrow') return slotDateStr === tomorrowStr
      if (filterMode === 'custom' && customDate) {
        return slotDateStr === new Date(customDate).toDateString()
      }
      return true
    })
  }, [slots, filterMode, customDate])

  const pendingSlots = useMemo(
    () => filteredSlots.filter(s => s.status === 'PENDING_APPROVAL'),
    [filteredSlots],
  )

  const appointmentsForGrid = useMemo(() => {
    return filteredSlots.map((s, idx) => {
      const d = s.startTime ? new Date(s.startTime) : null
      return {
        id: s._id || idx,
        name: s.patientName || '—',
        time: d ? d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '',
        dateLabel: d ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '',
        duration: 1,
        type: s.ai_summary ? s.ai_summary.slice(0, 30) + (s.ai_summary.length > 30 ? '…' : '') : 'Appointment',
        status: s.status === 'BOOKED' ? 'confirmed' : s.status === 'PENDING_APPROVAL' ? 'pending' : 'available',
        color: s.status === 'BOOKED' ? '#0B6E6E' : s.status === 'PENDING_APPROVAL' ? '#d97706' : '#6b7280',
        callSummary: s.ai_summary,
        rawDate: s.startTime,
        hourIndex: d ? HOURS.findIndex(h => Number(h.split(':')[0]) === d.getHours()) : -1,
        slotId: s._id,
        doctorId,
      }
    }).sort((a, b) => {
      if (!a.rawDate) return 1
      if (!b.rawDate) return -1
      return new Date(a.rawDate) - new Date(b.rawDate)
    })
  }, [filteredSlots, doctorId])

  useEffect(() => {
    if (auth?.role === 'doctor' && auth?.id) {
      setDoctorId(auth.id)
      return
    }
    let cancelled = false
    const resolveDoctor = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/doctors`)
        if (!res.ok) throw new Error('Failed to load doctors')
        const data = await res.json()
        if (cancelled) return
        const name = auth?.name || 'Dr. Sarah Chen'
        const doctor = (data || []).find(d => d.name && d.name.trim() === name.trim())
        if (doctor) setDoctorId(doctor._id)
        else if (data && data.length > 0) setDoctorId(data[0]._id)
      } catch (e) {
        console.error(e)
      }
    }
    resolveDoctor()
    return () => { cancelled = true }
  }, [auth?.role, auth?.id, auth?.name])

  useEffect(() => {
    if (!doctorId) return
    let cancelled = false
    const fetchSlots = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/doctors/${doctorId}/slots`)
        if (!res.ok) throw new Error('Failed to load slots')
        const data = await res.json()
        if (cancelled) return
        setSlots(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error(e)
      }
    }
    fetchSlots()
    return () => { cancelled = true }
  }, [doctorId])

  const handleApprove = async (slotId) => {
    if (!doctorId) return
    try {
      const res = await fetch(`${API_BASE_URL}/doctors/${doctorId}/slots/${slotId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error('Failed to approve')
      setSlots(prev => prev.map(s => (s._id === slotId ? { ...s, status: 'BOOKED' } : s)))
    } catch (err) {
      console.error('Failed to approve appointment', err)
    }
  }

  const handleReject = async (slotId) => {
    if (!doctorId) return
    try {
      const res = await fetch(`${API_BASE_URL}/doctors/${doctorId}/slots/${slotId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error('Failed to reject')
      setSlots(prev => prev.map(s => (s._id === slotId ? { ...s, status: 'AVAILABLE', patientName: undefined, ai_summary: undefined } : s)))
    } catch (err) {
      console.error('Failed to reject appointment', err)
    }
  }


  const date = new Date(); 
  const options = {
    weekday: 'long', 
    month: 'long',   
    day: 'numeric'
  };

// Format the date using the user's default locale
const formattedDate = date.toLocaleDateString(undefined, options);
console.log(formattedDate);
  return (
    <div className="animate-fade-in">
      <Header
        title="Today's Schedule"
        subtitle={formattedDate}
        actions={
          <div className="flex gap-2">
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
                  className="bg-cream/[0.06] border border-cream/[0.1] text-sm rounded-lg px-2 py-1"
                />
              )}
            </div>
            {/* <Button icon="plus">Add</Button> */}
          </div>
        }
      />

      <div className="flex gap-1 bg-cream/[0.05] rounded-xl p-1 mb-4 w-fit lg:hidden">
        {['queue', 'grid'].map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`tab-pill capitalize ${view === v ? 'active' : ''}`}
          >
            {v === 'queue' ? 'Patient Queue' : 'Time Grid'}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_280px] gap-5">

        <div className={`${view === 'grid' ? 'block' : 'hidden'} lg:block`}>
          <Card className="!p-0 overflow-hidden">
            <div className="flex min-w-[360px] max-h-[480px] overflow-y-auto overflow-x-auto">
              <div className="w-12 sm:w-14 shrink-0">
                <div className="h-12 border-b border-cream/[0.08]" />
                {HOURS.map(h => (
                  <div key={h} className="h-14 sm:h-16 flex items-start pt-1 px-1.5 sm:px-2">
                    <span className="text-[10px] sm:text-[11px] text-slate">{h}</span>
                  </div>
                ))}
              </div>

              <div className="flex-1 relative">
                <div className="h-12 border-b border-cream/[0.08] flex items-center px-3 sm:px-4 gap-2 sm:gap-3">
                  <span className="text-xs sm:text-sm font-medium text-cream">{auth?.name || 'Dr. Sarah Chen'}</span>
                  <Badge variant="teal">{filteredSlots.length} appts</Badge>
                </div>
                {HOURS.map(h => (
                  <div key={h} className="h-14 sm:h-16 border-b border-cream/[0.04]" />
                ))}
                {appointmentsForGrid.map((appt, idx) => {
                  const hourIdx = appt.hourIndex
                  if (hourIdx == null || hourIdx < 0) return null
                  const cellH = window.innerWidth < 640 ? 56 : 64
                  return (
                    <div
                      key={appt.id ?? idx}
                      className="absolute left-1.5 right-1.5 sm:left-2 sm:right-2 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 cursor-pointer transition-opacity hover:opacity-90"
                      style={{
                        top: `${48 + hourIdx * 64 + 4}px`,
                        height: `${appt.duration * 64 - 8}px`,
                        background: `${appt.color}22`,
                        border: `1px solid ${appt.color}44`,
                        borderLeftWidth: '3px',
                        borderLeftColor: appt.color,
                      }}
                    >
                      <p className="text-xs sm:text-sm font-semibold text-cream leading-tight truncate">{appt.name}</p>
                      <p className="text-[10px] sm:text-[11px] text-slate">
                        {appt.type} · {appt.dateLabel} · {appt.time}
                      </p>
                      {appt.duration > 1 && (
                        <div className="mt-1">
                          <Badge variant={appt.status === 'confirmed' ? 'teal' : 'amber'}>{appt.status}</Badge>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>
        </div>

        <div className={`${view === 'queue' ? 'block' : 'hidden'} lg:block`}>
          <Card className="flex flex-col max-h-[calc(100vh-220px)] over">
            <h3 className="text-sm sm:text-[15px] font-semibold text-cream mb-4 sm:mb-5">Patient Queue</h3>
            <div className="overflow-y-auto flex-1 -mx-4 px-4">
              {pendingSlots.map((appt, i) => (
                <div key={appt._id ?? i} className={`py-3.5 ${i < pendingSlots.length - 1 ? 'border-b border-cream/[0.08]' : ''}`}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-medium text-cream">{appt.patientName || 'Patient'}</span>
                    <span className="text-xs text-slate">
                      {appt.startTime
                        ? new Date(appt.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) + ' · ' +
                          new Date(appt.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                        : '—'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant="amber">pending</Badge>
                    <div className="flex gap-1 ml-auto">
                      <button
                        type="button"
                        onClick={() => handleApprove(appt._id)}
                        className="text-[11px] px-2 py-1 rounded-full bg-teal/20 text-teal-light hover:bg-teal/30 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(appt._id)}
                        className="text-[11px] px-2 py-1 rounded-full bg-rose/20 text-rose hover:bg-rose/30 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                  {appt.ai_summary && (
                    <p className="text-xs text-cream-dk mt-1.5 line-clamp-2">
                      {appt.ai_summary}
                    </p>
                  )}
                </div>
              ))}
              {pendingSlots.length === 0 && (
                <p className="text-sm text-slate py-4">No pending appointments.</p>
              )}
            </div>

            {/* <Button icon="eye" className="w-full justify-center mt-4 sm:mt-5">View All Patients</Button> */}
          </Card>
        </div>
      </div>
    </div>
  )
}
