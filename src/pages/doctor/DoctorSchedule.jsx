import { useState } from 'react'
import Header from '../../components/layout/Header'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'

const HOURS = ['8:00', '9:00', '10:00', '11:00', '12:00', '1:00', '2:00', '3:00', '4:00']

const APPOINTMENTS = [
  { name: 'James Park',   time: '9:00',  duration: 2, type: 'Follow-up',     status: 'confirmed', color: '#0B6E6E' },
  { name: 'Maria Santos', time: '11:00', duration: 1, type: 'New Patient',    status: 'confirmed', color: '#F5A623' },
  { name: 'Robert Kim',   time: '2:00',  duration: 2, type: 'Consultation',   status: 'confirmed', color: '#4A7C6F' },
  { name: 'Priya Mehta',  time: '4:00',  duration: 1, type: 'Results Review', status: 'pending',   color: '#C75E5E' },
]

export default function DoctorSchedule() {
  const [view, setView] = useState('queue') // mobile: 'queue' | 'grid'

  return (
    <div className="animate-fade-in">
      <Header
        title="Today's Schedule"
        subtitle="Wednesday, February 25, 2026"
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" icon="filter">Filter</Button>
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
          <Card className="!p-0 overflow-hidden overflow-x-auto">
            <div className="flex min-w-[360px]">
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
                  <Badge variant="teal">{APPOINTMENTS.length} appts</Badge>
                </div>
                {HOURS.map(h => (
                  <div key={h} className="h-14 sm:h-16 border-b border-cream/[0.04]" />
                ))}
                {APPOINTMENTS.map((appt, idx) => {
                  const hourIdx = HOURS.indexOf(appt.time)
                  if (hourIdx === -1) return null
                  const cellH = window.innerWidth < 640 ? 56 : 64
                  return (
                    <div
                      key={idx}
                      className="absolute left-1.5 right-1.5 sm:left-2 sm:right-2 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 cursor-pointer transition-opacity hover:opacity-90"
                      style={{
                        top:    `${48 + hourIdx * 64 + 4}px`,
                        height: `${appt.duration * 64 - 8}px`,
                        background: `${appt.color}22`,
                        border: `1px solid ${appt.color}44`,
                        borderLeftWidth: '3px',
                        borderLeftColor: appt.color,
                      }}
                    >
                      <p className="text-xs sm:text-sm font-semibold text-cream leading-tight truncate">{appt.name}</p>
                      <p className="text-[10px] sm:text-[11px] text-slate">{appt.type} · {appt.time}</p>
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
          <Card>
            <h3 className="text-sm sm:text-[15px] font-semibold text-cream mb-4 sm:mb-5">Patient Queue</h3>
            {APPOINTMENTS.map((appt, i) => (
              <div key={i} className={`py-3.5 ${i < APPOINTMENTS.length - 1 ? 'border-b border-cream/[0.08]' : ''}`}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-medium text-cream">{appt.name}</span>
                  <span className="text-xs text-slate">{appt.time}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={appt.status === 'confirmed' ? 'teal' : 'amber'}>{appt.status}</Badge>
                  <Badge variant="sage">{appt.type}</Badge>
                </div>
              </div>
            ))}
            <Button icon="eye" className="w-full justify-center mt-4 sm:mt-5">View All Patients</Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
