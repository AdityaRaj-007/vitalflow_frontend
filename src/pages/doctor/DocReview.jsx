import { useState } from 'react'
import Header from '../../components/layout/Header'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'

const DOCS = [
  { name: 'Blood Panel — James Park',  date: 'Jan 15, 2026', patient: 'James Park',  type: 'Lab Results', status: 'pending'  },
  { name: 'MRI Report — Maria Santos', date: 'Jan 10, 2026', patient: 'Maria Santos', type: 'Imaging',     status: 'pending'  },
  { name: 'ECG — Robert Kim',          date: 'Feb 1, 2026',  patient: 'Robert Kim',   type: 'Cardiology',  status: 'reviewed' },
]

const FINDINGS = [
  { label: 'HbA1c',           value: '6.8%',      flag: 'normal',     prev: '7.2%'      },
  { label: 'LDL Cholesterol', value: '112 mg/dL',  flag: 'borderline', prev: '105 mg/dL' },
  { label: 'Fasting Glucose', value: '94 mg/dL',   flag: 'normal',     prev: '98 mg/dL'  },
  { label: 'eGFR',            value: '82 mL/min',  flag: 'normal',     prev: '85 mL/min' },
]

export default function DocReview() {
  const [selected, setSelected] = useState(0)
  const [notes, setNotes]       = useState('')
  const [showQueue, setShowQueue] = useState(false)

  return (
    <div className="animate-fade-in">
      <Header
        title="Document Review"
        subtitle="Review and annotate uploaded patient documents"
        actions={
          <button
            onClick={() => setShowQueue(v => !v)}
            className="btn-ghost md:hidden !px-2.5"
          >
            <Icon name="menu" size={16} />
            <span className="text-xs ml-1">Queue</span>
          </button>
        }
      />

      {showQueue && (
        <Card className="!p-0 overflow-hidden mb-4 md:hidden animate-fade-in">
          <div className="px-5 py-3.5 border-b border-cream/[0.08] flex justify-between items-center">
            <p className="text-sm font-medium text-cream">Queue ({DOCS.filter(d => d.status === 'pending').length} pending)</p>
            <button onClick={() => setShowQueue(false)} className="text-slate"><Icon name="x" size={14} /></button>
          </div>
          {DOCS.map((d, i) => (
            <button
              key={i}
              onClick={() => { setSelected(i); setShowQueue(false) }}
              className={`w-full text-left px-5 py-3.5 border-b border-cream/[0.06] transition-colors
                ${selected === i ? 'bg-teal/10 border-l-2 border-l-teal' : 'hover:bg-cream/[0.03] border-l-2 border-l-transparent'}`}
            >
              <p className={`text-sm mb-1 text-cream ${selected === i ? 'font-medium' : ''}`}>{d.name}</p>
              <p className="text-[11px] text-slate mb-1.5">{d.patient} · {d.date}</p>
              <Badge variant={d.status === 'pending' ? 'amber' : 'teal'}>{d.status}</Badge>
            </button>
          ))}
        </Card>
      )}

      <div className="flex flex-col md:grid md:grid-cols-[240px_1fr] gap-5">

        <Card className="hidden md:block !p-0 overflow-hidden self-start">
          <div className="px-5 py-4 border-b border-cream/[0.08]">
            <p className="text-sm font-medium text-cream">Queue ({DOCS.filter(d => d.status === 'pending').length} pending)</p>
          </div>
          {DOCS.map((d, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`w-full text-left px-5 py-4 border-b border-cream/[0.06] transition-colors
                ${selected === i ? 'bg-teal/10 border-l-2 border-l-teal' : 'hover:bg-cream/[0.03] border-l-2 border-l-transparent'}`}
            >
              <p className={`text-sm mb-1 text-cream ${selected === i ? 'font-medium' : ''}`}>{d.name}</p>
              <p className="text-[11px] text-slate mb-1.5">{d.patient} · {d.date}</p>
              <Badge variant={d.status === 'pending' ? 'amber' : 'teal'}>{d.status}</Badge>
            </button>
          ))}
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="!p-0 overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 border-b border-cream/[0.08]">
              <span className="text-sm font-medium text-cream flex-1 truncate">{DOCS[selected].name}</span>
              <Button variant="ghost" icon="download">Export</Button>
              <Button icon="check">Mark Reviewed</Button>
            </div>

            <div className="bg-cream/[0.02] p-4 sm:p-8 overflow-x-auto">
              <div className="bg-cream/[0.04] rounded-xl p-4 sm:p-6 font-mono min-w-[400px]">
                <p className="section-label font-sans mb-4">LABORATORY REPORT — {DOCS[selected].patient}</p>
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  {['Test Name', 'Value', 'Previous', 'Flag'].map(h => (
                    <p key={h} className="table-header-cell text-[10px] sm:text-[11px]">{h}</p>
                  ))}
                  {FINDINGS.map((f, i) => (
                    <>
                      <p key={`${i}a`} className="text-xs sm:text-sm text-cream-dk font-sans py-1">{f.label}</p>
                      <p key={`${i}b`} className={`text-xs sm:text-sm font-semibold font-sans py-1 ${f.flag === 'normal' ? 'text-teal-light' : 'text-amber'}`}>{f.value}</p>
                      <p key={`${i}c`} className="text-[11px] sm:text-xs text-slate font-sans py-1">{f.prev}</p>
                      <div key={`${i}d`} className="py-1"><Badge variant={f.flag === 'normal' ? 'teal' : 'amber'}>{f.flag}</Badge></div>
                    </>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h4 className="text-sm font-semibold text-cream mb-3">Clinical Notes</h4>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="form-input resize-none h-20 sm:h-24 mb-3"
              placeholder="Add your clinical annotations and observations…"
            />
            <div className="flex flex-wrap gap-3">
              <Button icon="check">Save & Approve</Button>
              <Button variant="secondary">Flag for Review</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
