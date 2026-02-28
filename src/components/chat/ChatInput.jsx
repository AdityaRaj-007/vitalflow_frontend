import { useRef } from 'react'
import Icon from '../ui/Icon'

export default function ChatInput({
  input,
  setInput,
  onSendText,
  recording,
  isProcessing,
  audioURL,
  onStartRecording,
  onStopRecording,
  onSendAudio,
  onCancelAudio,
}) {
  const inputRef = useRef(null)

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSendText(input)
    }
  }

  if (recording || audioURL) {
    return (
      <div
        className="flex items-center gap-3 px-4 py-3 shrink-0"
        style={{ background: '#0D1B3E', borderTop: '1px solid rgba(14,139,139,0.18)' }}
      >
        {recording ? (
          <>
            <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-full"
              style={{ background: 'rgba(199,94,94,0.12)', border: '1px solid rgba(199,94,94,0.3)' }}>
              <span className="w-2.5 h-2.5 rounded-full bg-rose animate-pulse shrink-0" />
              <span className="text-rose text-sm font-medium">Recording…</span>
              <div className="flex items-end gap-0.5 flex-1">
                {Array.from({ length: 22 }, (_, i) => (
                  <span
                    key={i}
                    className="w-0.5 bg-rose/60 rounded-sm wave-bar"
                    style={{ animationDelay: `${i * 0.055}s` }}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={onStopRecording}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-rose text-white shrink-0
                         shadow-[0_0_20px_rgba(199,94,94,0.4)] hover:opacity-90 transition-opacity"
              aria-label="Stop recording"
            >
              <span className="w-3.5 h-3.5 rounded-sm bg-white" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onCancelAudio}
              className="w-9 h-9 rounded-full flex items-center justify-center text-rose
                         bg-rose/15 hover:bg-rose/25 transition-colors shrink-0"
              aria-label="Cancel"
            >
              <Icon name="x" size={16} />
            </button>

            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-full"
              style={{ background: 'rgba(11,110,110,0.12)', border: '1px solid rgba(11,110,110,0.25)' }}>
              <Icon name="mic" size={14} className="text-teal-light shrink-0" />
              <audio controls src={audioURL} className="flex-1 h-7"
                style={{ filter: 'invert(1) hue-rotate(175deg) brightness(0.85)', minWidth: 0 }} />
            </div>

            <button
              onClick={onSendAudio}
              disabled={isProcessing}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0
                         disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{ background: 'linear-gradient(135deg, #0B6E6E, #0E8B8B)' }}
              aria-label="Send voice message"
            >
              {isProcessing ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin-slow" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </>
        )}
      </div>
    )
  }

  const hasText   = input.trim().length > 0
  const disabled  = isProcessing

  return (
    <div
      className="flex items-center gap-2 px-3 py-2.5 shrink-0"
      style={{ background: '#0D1B3E', borderTop: '1px solid rgba(14,139,139,0.15)' }}
    >
      <button
        onClick={disabled ? undefined : onStartRecording}
        disabled={disabled}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0
          ${disabled
            ? 'text-slate/40 cursor-not-allowed'
            : 'text-slate hover:text-teal-light hover:bg-teal/10'}`}
        aria-label="Record voice message"
      >
        <Icon name="mic" size={18} />
      </button>

      <input
        ref={inputRef}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={isProcessing ? 'AI is responding…' : 'Message MedicAI…'}
        className="flex-1 rounded-full px-4 py-2 text-sm outline-none transition-all disabled:opacity-50"
        style={{
          background:   'rgba(247,243,236,0.08)',
          border:       '1px solid rgba(247,243,236,0.12)',
          color:        '#F7F3EC',
          fontFamily:   "'DM Sans', sans-serif",
        }}
      />

      <button
        onClick={() => hasText && onSendText(input)}
        disabled={!hasText || disabled}
        className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0
                   transition-all disabled:cursor-not-allowed"
        style={{
          background: hasText && !disabled
            ? 'linear-gradient(135deg, #0B6E6E, #0E8B8B)'
            : 'rgba(11,110,110,0.25)',
        }}
        aria-label="Send message"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  )
}
