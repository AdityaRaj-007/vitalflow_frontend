import Icon from '../ui/Icon'

export default function ChatHeader({ status = 'idle' }) {
  const statusLabel = {
    idle:       'online',
    recording:  '🎙 recording…',
    processing: 'processing…',
  }[status]

  const statusColor = {
    idle:       'text-teal-light',
    recording:  'text-rose',
    processing: 'text-amber',
  }[status]

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 shrink-0"
      style={{
        background:   '#0D1B3E',
        borderBottom: '1px solid rgba(14,139,139,0.2)',
      }}
    >

      <div className="relative shrink-0">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal to-teal-light flex items-center justify-center">
          <Icon name="activity" size={17} className="text-white" />
        </div>
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#53d769] border-2 border-[#0D1B3E]" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white leading-tight">VitalFlow Assistant</p>
        <p className={`text-[11px] leading-tight transition-colors duration-300 ${statusColor}`}>
          {statusLabel}
        </p>
      </div>

      <div className="flex items-center gap-0.5">
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate hover:text-cream hover:bg-cream/[0.08] transition-all"
          aria-label="Search"
        >
          <Icon name="search" size={15} />
        </button>
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate hover:text-cream hover:bg-cream/[0.08] transition-all"
          aria-label="More options"
        >
          <Icon name="menu" size={15} />
        </button>
      </div>
    </div>
  )
}
