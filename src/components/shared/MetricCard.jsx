import Card from '../ui/Card'
import Icon from '../ui/Icon'

const COLOR_MAP = {
  teal:  { bg: 'bg-teal/20',  text: 'text-teal-light', glow: 'bg-teal/10'  },
  amber: { bg: 'bg-amber/15', text: 'text-amber',       glow: 'bg-amber/10' },
  sage:  { bg: 'bg-sage/15',  text: 'text-[#6BAF9F]',   glow: 'bg-sage/10'  },
  rose:  { bg: 'bg-rose/15',  text: 'text-rose',        glow: 'bg-rose/10'  },
}

export default function MetricCard({ label, value, sub, icon, color = 'teal', trend }) {
  const c = COLOR_MAP[color] || COLOR_MAP.teal
  return (
    <Card className="relative overflow-hidden !p-4 sm:!p-6">
      <div className={`absolute -top-3 -right-3 w-16 h-16 sm:w-20 sm:h-20 ${c.glow} rounded-full blur-xl`} />

      <div className="flex justify-between items-start relative z-10">
        <div className="min-w-0 flex-1">
          <p className="section-label truncate">{label}</p>
          <p className="font-serif text-3xl sm:text-4xl font-semibold text-cream leading-none">{value}</p>
          {sub && <p className="text-[11px] sm:text-xs text-slate mt-1.5 leading-snug">{sub}</p>}
          {trend !== undefined && (
            <p className={`text-[10px] sm:text-[11px] mt-1 ${trend > 0 ? 'text-[#6BAF9F]' : 'text-rose'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% this week
            </p>
          )}
        </div>
        <div className={`p-2 sm:p-2.5 ${c.bg} rounded-lg sm:rounded-xl ${c.text} shrink-0 ml-2`}>
          <Icon name={icon} size={16} className="sm:hidden" />
          <Icon name={icon} size={20} className="hidden sm:block" />
        </div>
      </div>
    </Card>
  )
}
