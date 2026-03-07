import { useEffect, useState } from 'react'
import Header from '../../components/layout/Header'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import { useAuth } from '../../context/AuthContext'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const STATUS_VARIANT = { managed: 'teal', monitoring: 'amber', resolved: 'sage' }
const TYPE_VARIANT = { lab: 'teal', imaging: 'sage', visit: 'amber', prescription: 'rose' }

export default function MedicalHistory() {
  const { auth } = useAuth()
  const [tab, setTab] = useState('conditions')
  const [conditions, setConditions] = useState([])
  const [medications, setMedications] = useState([])
  const [timeline, setTimeline] = useState([])

  useEffect(() => {
    if (!auth?.id) return
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/${auth.id}/history`)
        if (!res.ok) throw new Error('Failed to load medical history')
        const data = await res.json()
        if (cancelled) return
        setConditions(data.conditions || [])
        setMedications(data.medications || [])
        setTimeline(data.timeline || [])
      } catch (e) {
        console.error(e)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [auth?.id])

  return (
    <div className="animate-fade-in">
      <Header
        title="Medical History"
        subtitle="Your complete health record in one place"
        actions={<Button variant="ghost" icon="download">Export</Button>}
      />

      <div className="flex gap-1 bg-cream/[0.05] rounded-xl p-1 mb-5 overflow-x-auto">
        {['conditions', 'medications', 'timeline'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`tab-pill whitespace-nowrap flex-shrink-0 ${tab === t ? 'active' : ''}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'conditions' && (
        <div className="flex flex-col gap-3 animate-fade-in">
          {conditions.length === 0 && (
            <p className="text-sm text-slate">No condition history recorded yet.</p>
          )}
          {conditions.map((c, i) => (
            <Card key={i} className="!py-4 !px-4 sm:!px-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 bg-teal/12 rounded-xl flex items-center justify-center shrink-0">
                    <Icon name="heart" size={17} className="text-teal-light" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm sm:text-[15px] font-medium text-cream truncate">{c.name}</p>
                    <p className="text-xs text-slate">
                      {c.since ? `Since ${c.since}` : 'Date not available'} · {c.doctor}
                    </p>
                  </div>
                </div>
                <Badge variant={STATUS_VARIANT[c.status]}>{c.status}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'medications' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-fade-in">
          {medications.length === 0 && (
            <p className="text-sm text-slate col-span-full">No structured medications extracted from reports yet.</p>
          )}
          {medications.map((m, i) => (
            <Card key={i}>
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-amber/12 rounded-xl flex items-center justify-center mb-3">
                <Icon name="clipboard" size={16} className="text-amber" />
              </div>
              <p className="text-sm sm:text-[15px] font-medium text-cream mb-1">{m.name}</p>
              <p className="text-xs text-slate mb-4">{m.freq} {m.start && `· Started ${m.start}`}</p>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate">Refill: {m.refill}</span>
                <Badge variant="amber">active</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'timeline' && (
        <div className="relative pl-7 sm:pl-8 animate-fade-in">
          <div className="absolute left-2 sm:left-2.5 top-0 bottom-0 w-0.5 bg-teal/30" />
          {timeline.length === 0 && (
            <p className="text-sm text-slate mt-2">No events in your medical history yet.</p>
          )}
          {timeline.map((item, i) => (
            <div key={i} className="relative mb-5 sm:mb-6">
              <div className="absolute -left-[21px] sm:-left-[23px] top-3 w-3 h-3 rounded-full bg-teal-light
                              ring-2 ring-teal/40 ring-offset-2 ring-offset-obsidian" />
              <Card className="!p-3.5 sm:!p-4">
                <p className="text-[11px] text-slate mb-1.5">
                  {item.date ? new Date(item.date).toLocaleDateString() : 'Unknown date'}
                </p>
                <p className="text-sm text-cream leading-snug">{item.event}</p>
                <div className="mt-2">
                  <Badge variant={TYPE_VARIANT[item.type] || 'sage'}>
                    {item.type}
                  </Badge>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
