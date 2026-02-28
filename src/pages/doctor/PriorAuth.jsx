import { useState } from 'react'
import Header from '../../components/layout/Header'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import MetricCard from '../../components/shared/MetricCard'

const REQUESTS = [
  { patient: 'James Park',   drug: 'Entresto 24/26mg',  insurer: 'BlueCross', status: 'approved', date: 'Feb 20', urgency: 'routine' },
  { patient: 'Maria Santos', drug: 'Ozempic 1mg Pen',   insurer: 'Aetna',     status: 'pending',  date: 'Feb 23', urgency: 'routine' },
  { patient: 'Robert Kim',   drug: 'Dupixent 300mg',    insurer: 'United',    status: 'denied',   date: 'Feb 18', urgency: 'urgent'  },
  { patient: 'Priya Mehta',  drug: 'Humira 40mg',       insurer: 'Cigna',     status: 'pending',  date: 'Feb 24', urgency: 'urgent'  },
  { patient: 'Tom Wilson',   drug: 'Keytruda 200mg',    insurer: 'BlueCross', status: 'approved', date: 'Feb 15', urgency: 'urgent'  },
]

const STATUS_VARIANT  = { approved: 'teal', pending: 'amber', denied: 'rose' }
const URGENCY_VARIANT = { urgent: 'rose', routine: 'teal' }
const FILTER_TABS     = ['all', 'approved', 'pending', 'denied']

export default function PriorAuth() {
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? REQUESTS : REQUESTS.filter(r => r.status === filter)
  const counts   = {
    approved: REQUESTS.filter(r => r.status === 'approved').length,
    pending:  REQUESTS.filter(r => r.status === 'pending').length,
    denied:   REQUESTS.filter(r => r.status === 'denied').length,
  }

  return (
    <div className="animate-fade-in">
      <Header
        title="Prior Authorization"
        subtitle="Track and manage insurance pre-auth requests"
        actions={<Button icon="plus">New</Button>}
      />

      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-5">
        <MetricCard label="Approved" value={counts.approved} icon="check" color="teal"  />
        <MetricCard label="Pending"  value={counts.pending}  icon="clock" color="amber" />
        <MetricCard label="Denied"   value={counts.denied}   icon="x"     color="rose"  />
      </div>

      <div className="flex gap-1 bg-cream/[0.05] rounded-xl p-1 mb-4 sm:mb-5 overflow-x-auto">
        {FILTER_TABS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`tab-pill whitespace-nowrap flex-shrink-0 ${filter === f ? 'active' : ''}`}
          >
            {f}{f !== 'all' && ` (${counts[f] ?? 0})`}
          </button>
        ))}
      </div>

      <Card className="!p-0 overflow-hidden hidden md:block">
        <div className="grid grid-cols-[1.2fr_1.5fr_1fr_0.8fr_0.9fr_0.9fr_80px] gap-4 px-5 py-3 bg-cream/[0.04] border-b border-cream/[0.08]">
          {['Patient', 'Medication', 'Insurer', 'Date', 'Urgency', 'Status', ''].map(h => (
            <span key={h} className="table-header-cell">{h}</span>
          ))}
        </div>
        {filtered.map((r, i) => (
          <div
            key={i}
            className="grid grid-cols-[1.2fr_1.5fr_1fr_0.8fr_0.9fr_0.9fr_80px] gap-4 px-5 items-center table-row-hover py-3.5"
          >
            <span className="text-sm font-medium text-cream">{r.patient}</span>
            <span className="text-sm text-cream-dk truncate">{r.drug}</span>
            <span className="text-sm text-slate">{r.insurer}</span>
            <span className="text-xs text-slate">{r.date}</span>
            <Badge variant={URGENCY_VARIANT[r.urgency]}>{r.urgency}</Badge>
            <Badge variant={STATUS_VARIANT[r.status]}>{r.status}</Badge>
            <div className="flex items-center gap-1.5">
              <button className="btn-ghost !p-1.5"><Icon name="eye" size={14} /></button>
              {r.status === 'denied' && <button className="btn-ghost !p-1.5 !text-amber"><Icon name="alert" size={14} /></button>}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-slate text-sm">No {filter} requests found.</div>
        )}
      </Card>

      <div className="flex flex-col gap-3 md:hidden">
        {filtered.map((r, i) => (
          <Card key={i} className="!p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm font-semibold text-cream mb-0.5">{r.patient}</p>
                <p className="text-xs text-cream-dk">{r.drug}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <Badge variant={STATUS_VARIANT[r.status]}>{r.status}</Badge>
                <Badge variant={URGENCY_VARIANT[r.urgency]}>{r.urgency}</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2.5 border-t border-cream/[0.08]">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate">{r.insurer}</span>
                <span className="text-xs text-slate">{r.date}</span>
              </div>
              <div className="flex gap-1">
                <button className="btn-ghost !p-1.5"><Icon name="eye" size={14} /></button>
                {r.status === 'denied' && <button className="btn-ghost !p-1.5 !text-amber"><Icon name="alert" size={14} /></button>}
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card className="py-12 text-center text-slate text-sm">No {filter} requests found.</Card>
        )}
      </div>
    </div>
  )
}
