import { useEffect, useState } from 'react'
import Header from '../../components/layout/Header'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Icon from '../../components/ui/Icon'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const PATIENT_ID = 1

export default function GoldenRecord() {
  const [selected, setSelected] = useState(0)
  const [record, setRecord] = useState({
    patientName: 'Patient',
    summary: 'Loading patient summary…',
    riskFlags: [],
    medications: [],
    recentEvents: [],
    allergies: [],
    documentTypes: [],
  })

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/${PATIENT_ID}/golden-record`)
        if (!res.ok) throw new Error('Failed to load golden record')
        const data = await res.json()
        if (cancelled) return
        setRecord({
          patientName: data.patientName || 'Patient',
          summary: data.summary || 'No synthesized history available yet.',
          riskFlags: data.riskFlags || [],
          medications: data.medications || [],
          recentEvents: data.recentEvents || [],
          allergies: data.allergies || [],
          documentTypes: data.documentTypes || [],
        })
      } catch (e) {
        console.error(e)
        if (!cancelled) {
          setRecord(prev => ({
            ...prev,
            summary: 'Unable to load patient summary.',
          }))
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="animate-fade-in">
      <Header title="Golden Record" subtitle="AI-synthesized patient brief — for clinical review only" />

      <div className="flex gap-2 mb-4 lg:hidden overflow-x-auto pb-1">
        {[record.patientName].map((p, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm whitespace-nowrap transition-all flex-shrink-0
              ${selected === i
                ? 'bg-teal/20 border-teal/40 text-teal-light font-medium'
                : 'bg-cream/[0.04] border-cream/[0.1] text-slate hover:text-cream'}`}
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal/60 to-amber/40 flex items-center justify-center text-[10px] font-semibold text-cream shrink-0">
              {p.split(' ').map(n => n[0]).join('')}
            </div>
            {p}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-[180px_1fr] gap-5">

        <Card className="hidden lg:block !p-4 self-start">
          <p className="section-label mb-3">Patients Today</p>
          {[record.patientName].map((p, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`nav-link w-full mb-0.5 ${selected === i ? 'active' : ''}`}
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal/60 to-amber/40 flex items-center justify-center text-[11px] font-semibold text-cream shrink-0">
                {p.split(' ').map(n => n[0]).join('')}
              </div>
              {p}
            </button>
          ))}
        </Card>

        <div className="flex flex-col gap-4">

          <Card>
            <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-serif text-lg sm:text-xl text-cream">{record.patientName}</h3>
                </div>
              </div>
              {record.riskFlags.length > 0 && (
                <Badge variant="amber">⚠ {record.riskFlags.length} risk flags</Badge>
              )}
            </div>
            <div className="bg-teal/[0.08] border-l-[3px] border-teal rounded-xl px-4 py-3.5">
              <div className="flex items-center gap-1.5 mb-2">
                <Icon name="star" size={12} className="text-teal-light" />
                <span className="text-[11px] text-teal-light uppercase tracking-wide">AI Summary</span>
              </div>
              <p className="text-sm text-cream-dk leading-relaxed whitespace-pre-line">{record.summary}</p>
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-cream mb-3">
                <Icon name="alert" size={14} className="text-amber" /> Risk Flags
              </h4>
              {record.riskFlags.length === 0 && (
                <p className="text-sm text-slate">No explicit risk flags documented.</p>
              )}
              {record.riskFlags.map((f, i) => (
                <div key={i} className="text-sm text-cream-dk px-3 py-2.5 bg-amber/[0.08] border border-amber/20 rounded-xl mb-2 leading-snug">{f}</div>
              ))}
            </Card>

            <Card>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-cream mb-3">
                <Icon name="clipboard" size={14} className="text-teal-light" /> Medications
              </h4>
              {record.medications.length === 0 && (
                <p className="text-sm text-slate">No active medication list available.</p>
              )}
              {record.medications.map((m, i) => (
                <p key={i} className={`text-sm text-cream-dk py-2 ${i < record.medications.length - 1 ? 'border-b border-cream/[0.08]' : ''}`}>· {m}</p>
              ))}
            </Card>

            <Card>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-cream mb-3">
                <Icon name="activity" size={14} className="text-teal-light" /> Recent Events
              </h4>
              {record.recentEvents.length === 0 && (
                <p className="text-sm text-slate">No recent events recorded.</p>
              )}
              {record.recentEvents.map((r, i) => (
                <p
                  key={i}
                  className={`text-sm text-cream-dk py-2 ${i < record.recentEvents.length - 1 ? 'border-b border-cream/[0.08]' : ''}`}
                >
                  {r.date ? `${new Date(r.date).toLocaleDateString()} — ` : ''}{r.description}
                </p>
              ))}
            </Card>

            <Card>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-cream mb-3">
                <Icon name="alert" size={14} className="text-rose" /> Allergies
              </h4>
              {record.allergies.length === 0 && (
                <p className="text-sm text-slate">No allergies documented in the system.</p>
              )}
              {record.allergies.map((a, i) => (
                <div key={i} className="text-sm text-cream-dk px-3 py-2.5 bg-rose/[0.08] border border-rose/20 rounded-xl mb-2">⚠ {a}</div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
