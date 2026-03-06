import { useEffect, useState, useMemo } from 'react'
import Header from '../../components/layout/Header'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'

// Displayable hour slots for the day view
const HOURS = [
  '8:00', '9:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00',
  '16:00', '17:00', '18:00', '19:00', '20:00',
]
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const PATIENT_ID = 1

export default function DoctorSchedule() {
  const [view, setView] = useState('queue') // mobile: 'queue' | 'grid'
  const [appointments, setAppointments] = useState([])
  const [filterMode, setFilterMode] = useState('today')   // 'today' | 'tomorrow' | 'custom'
  const [customDate, setCustomDate] = useState('');

  const filteredAppointments = useMemo(() => {
    if (!appointments.length) return []

    const todayStr = new Date().toDateString()

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toDateString()

    return appointments.filter(appt => {
      if (!appt.rawDate) return false

      const apptDateStr = new Date(appt.rawDate).toDateString()

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
  }, [appointments, filterMode, customDate])

  useEffect(() => {
    let cancelled = false
    const fetchAppointments = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/${PATIENT_ID}/appointments`)
        if (!res.ok) throw new Error('Failed to load appointments')
        const data = await res.json()
        if (cancelled) return
        // Use appointment date/time (when patient asked to book) for display; fallback to booking date
        const mapped = (data || []).map((a, idx) => {
          const raw = a.appointmentDateTime ?? a.date
          const d = raw ? new Date(raw) : null

          return {
            id: a._id || idx,
            name: 'James Park',
            time: d
              ? d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
              : '',
            dateLabel: d
              ? d.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
              : '',
            duration: 1,
            type: a.doctorOrClinic || 'Consultation',
            status: a.status || 'pending',
            color: '#0B6E6E',
            callSummary: a.call_summary,
            documents: a.related_documents || [],
            historySummary: a.history_summary,
            rawDate: raw,
            hourIndex: d ? HOURS.findIndex(h => Number(h.split(':')[0]) === d.getHours()) : -1,
          }
        })
        const sorted = mapped.sort((a, b) => {
          if (!a.rawDate) return 1
          if (!b.rawDate) return -1

          const dateA = new Date(a.rawDate)
          const dateB = new Date(b.rawDate)

          return dateA - dateB
        })

        setAppointments(sorted)
      } catch (e) {
        console.error(e)
      }
    }
    fetchAppointments()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="animate-fade-in">
      <Header
        title="Today's Schedule"
        subtitle="Wednesday, February 25, 2026"
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
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="custom">Custom</option>
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
            <Button icon="plus">Add</Button>
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
                  <span className="text-xs sm:text-sm font-medium text-cream">Dr. Sarah Chen</span>
                  <Badge variant="teal">{filteredAppointments.length} appts</Badge>
                </div>
                {HOURS.map(h => (
                  <div key={h} className="h-14 sm:h-16 border-b border-cream/[0.04]" />
                ))}
                {filteredAppointments.map((appt, idx) => {
                  const hourIdx = appt.hourIndex
                  if (hourIdx == null || hourIdx < 0) return null
                  const cellH = window.innerWidth < 640 ? 56 : 64
                  return (
                    <div
                      key={idx}
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
              {filteredAppointments.map((appt, i) => (
                <div key={appt.id ?? i} className={`py-3.5 ${i < filteredAppointments.length - 1 ? 'border-b border-cream/[0.08]' : ''}`}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-medium text-cream">{appt.name}</span>
                    <span className="text-xs text-slate">
                      {appt.dateLabel} · {appt.time}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
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
                    <Badge variant="sage">{appt.type}</Badge>
                    {appt.status === 'pending' && (
                      <div className="flex gap-1 ml-auto">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await fetch(`${API_BASE_URL}/users/${PATIENT_ID}/appointments/${appt.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: 'confirmed' }),
                              })
                              setAppointments(prev =>
                                prev.map(a =>
                                  a.id === appt.id ? { ...a, status: 'confirmed' } : a,
                                ),
                              )
                            } catch (err) {
                              console.error('Failed to confirm appointment', err)
                            }
                          }}
                          className="text-[11px] px-2 py-1 rounded-full bg-teal/20 text-teal-light hover:bg-teal/30 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await fetch(`${API_BASE_URL}/users/${PATIENT_ID}/appointments/${appt.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: 'rejected' }),
                              })
                              setAppointments(prev =>
                                prev.map(a =>
                                  a.id === appt.id ? { ...a, status: 'rejected' } : a,
                                ),
                              )
                            } catch (err) {
                              console.error('Failed to reject appointment', err)
                            }
                          }}
                          className="text-[11px] px-2 py-1 rounded-full bg-rose/20 text-rose hover:bg-rose/30 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                  {appt.callSummary && (
                    <p className="text-xs text-cream-dk mt-1.5 line-clamp-2">
                      {appt.callSummary}
                    </p>
                  )}
                  {appt.documents && appt.documents.length > 0 && (
                    <div className="mt-1 space-y-1">
                      <p className="text-[11px] text-slate">
                        Linked documents:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {appt.documents.slice(0, 3).map((url, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                            className="text-[11px] px-2 py-1 rounded-full border border-teal/40 text-teal-light hover:bg-teal/10 transition-colors"
                          >
                            View doc {idx + 1}
                          </button>
                        ))}
                        {appt.documents.length > 3 && (
                          <span className="text-[11px] text-slate">
                            +{appt.documents.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* <Button icon="eye" className="w-full justify-center mt-4 sm:mt-5">View All Patients</Button> */}
          </Card>
        </div>
      </div>
    </div>
  )
}
