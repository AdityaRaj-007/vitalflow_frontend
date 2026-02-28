import { useState } from 'react'
import Header from '../../components/layout/Header'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Icon from '../../components/ui/Icon'

const PATIENTS = ['James Park', 'Maria Santos', 'Robert Kim']

const RECORD = {
  summary: '58-year-old male with well-managed Type 2 Diabetes and Stage 1 Hypertension. Recent HbA1c at 6.8% (improved from 7.2%). BP trending down with Lisinopril. No new concerns in latest labs.',
  riskFlags:    ['Moderate CV risk — annual stress test recommended', 'Upcoming colonoscopy overdue (last: 2022)'],
  medications:  ['Metformin 500mg BID', 'Lisinopril 10mg QD', 'Vitamin D3 2000IU QD'],
  recentEvents: ['Blood Panel Jan 2026 — HbA1c 6.8%', 'ECG Dec 2025 — Normal sinus rhythm', 'Annual Physical Oct 2025'],
  allergies:    ['Penicillin (anaphylaxis)', 'Sulfonamides (rash)'],
}

export default function GoldenRecord() {
  const [selected, setSelected] = useState(0)
  const [showList, setShowList] = useState(false)

  return (
    <div className="animate-fade-in">
      <Header title="Golden Record" subtitle="AI-synthesized patient brief — for clinical review only" />

      <div className="flex gap-2 mb-4 lg:hidden overflow-x-auto pb-1">
        {PATIENTS.map((p, i) => (
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
          {PATIENTS.map((p, i) => (
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
                  <h3 className="font-serif text-lg sm:text-xl text-cream">{PATIENTS[selected]}</h3>
                  <Badge variant="teal">M · 58 yrs</Badge>
                  <Badge variant="sage">P-20391</Badge>
                </div>
                <p className="text-xs text-slate">Last seen: Feb 28, 2026 · Dr. Sarah Chen</p>
              </div>
              <Badge variant="amber">⚠ 2 risk flags</Badge>
            </div>
            <div className="bg-teal/[0.08] border-l-[3px] border-teal rounded-xl px-4 py-3.5">
              <div className="flex items-center gap-1.5 mb-2">
                <Icon name="star" size={12} className="text-teal-light" />
                <span className="text-[11px] text-teal-light uppercase tracking-wide">AI Summary</span>
              </div>
              <p className="text-sm text-cream-dk leading-relaxed">{RECORD.summary}</p>
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-cream mb-3">
                <Icon name="alert" size={14} className="text-amber" /> Risk Flags
              </h4>
              {RECORD.riskFlags.map((f, i) => (
                <div key={i} className="text-sm text-cream-dk px-3 py-2.5 bg-amber/[0.08] border border-amber/20 rounded-xl mb-2 leading-snug">{f}</div>
              ))}
            </Card>

            <Card>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-cream mb-3">
                <Icon name="clipboard" size={14} className="text-teal-light" /> Medications
              </h4>
              {RECORD.medications.map((m, i) => (
                <p key={i} className={`text-sm text-cream-dk py-2 ${i < RECORD.medications.length - 1 ? 'border-b border-cream/[0.08]' : ''}`}>· {m}</p>
              ))}
            </Card>

            <Card>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-cream mb-3">
                <Icon name="activity" size={14} className="text-teal-light" /> Recent Events
              </h4>
              {RECORD.recentEvents.map((r, i) => (
                <p key={i} className={`text-sm text-cream-dk py-2 ${i < RECORD.recentEvents.length - 1 ? 'border-b border-cream/[0.08]' : ''}`}>{r}</p>
              ))}
            </Card>

            <Card>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-cream mb-3">
                <Icon name="alert" size={14} className="text-rose" /> Allergies
              </h4>
              {RECORD.allergies.map((a, i) => (
                <div key={i} className="text-sm text-cream-dk px-3 py-2.5 bg-rose/[0.08] border border-rose/20 rounded-xl mb-2">⚠ {a}</div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
