import Icon from '../ui/Icon'

const formatTime = (ts) => {
  const d = ts instanceof Date ? ts : new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function DoubleTick({ read }) {
  return (
    <svg width="16" height="11" viewBox="0 0 16 11" fill="none" className="inline-block ml-0.5 -mb-px flex-shrink-0">
      <path d="M1 5.5L4.5 9L10 2"
        stroke={read ? '#53d769' : 'rgba(255,255,255,0.5)'}
        strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 5.5L8.5 9L14 2"
        stroke={read ? '#53d769' : 'rgba(255,255,255,0.5)'}
        strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TailRight() {
  return (
    <svg
      width="8" height="13" viewBox="0 0 8 13"
      className="absolute -right-[7px] bottom-0 pointer-events-none"
      style={{ fill: '#0B6E6E' }}
    >
      <path d="M0 0 Q8 0 8 13 Q4 7 0 13 Z" />
    </svg>
  )
}
function TailLeft() {
  return (
    <svg
      width="8" height="13" viewBox="0 0 8 13"
      className="absolute -left-[7px] bottom-0 pointer-events-none"
      style={{ fill: '#122040' }}
    >
      <path d="M8 0 Q0 0 0 13 Q4 7 8 13 Z" />
    </svg>
  )
}

function DateSep({ label }) {
  return (
    <div className="flex items-center justify-center my-3">
      <span
        className="px-3 py-1 rounded-full text-[11px] font-medium text-slate tracking-wide"
        style={{ background: 'rgba(13,27,62,0.85)', border: '1px solid rgba(247,243,236,0.08)' }}
      >
        {label}
      </span>
    </div>
  )
}

function Bubble({ msg, isFirst, isLast, audioPlaying, onPlayAudio }) {
  const isUser = msg.sender === 'user'

  return (
    <div
      className={`flex items-end gap-1.5 ${isUser ? 'justify-end' : 'justify-start'}`}
      style={{ marginBottom: isLast ? 6 : 2 }}
    >
      {!isUser && (
        <div className="w-7 h-7 shrink-0 self-end mb-0.5">
          {isLast ? (
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal to-teal-light flex items-center justify-center shadow-sm">
              <Icon name="activity" size={13} className="text-white" />
            </div>
          ) : (
            <div className="w-7" />
          )}
        </div>
      )}

      <div className="relative max-w-[75%] sm:max-w-[65%]">
        {isLast && isUser  && <TailRight />}
        {isLast && !isUser && <TailLeft  />}

        <div
          className={`relative px-3 py-2 shadow-md text-sm leading-relaxed
            ${isUser
              ? isLast
                ? 'rounded-tl-2xl rounded-tr-lg rounded-bl-2xl rounded-br-sm'
                : 'rounded-2xl'
              : isLast
                ? 'rounded-tl-sm rounded-tr-2xl rounded-bl-2xl rounded-br-2xl'
                : 'rounded-2xl'}`}
          style={{
            background: isUser
              ? 'linear-gradient(135deg, #0B6E6E, #0E8B8B)'
              : '#122040',
            border: isUser ? 'none' : '1px solid rgba(14,139,139,0.2)',
            color: isUser ? '#ffffff' : '#F7F3EC',
          }}
        >
          {isFirst && !isUser && (
            <p className="text-[10px] font-semibold text-teal-light mb-0.5 uppercase tracking-wide">
              MedicAI
            </p>
          )}

          {(msg.type === 'text' || msg.text) && (
            <span style={{ paddingRight: isUser ? '60px' : '52px' }}>
              {msg.text}
            </span>
          )}

          {msg.type === 'audio' && msg.audioURL && (
            <div style={{ paddingRight: '60px' }}>
              <div className="flex items-center gap-2 my-0.5">
                <button
                  onClick={() => onPlayAudio(msg.id)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all
                    ${audioPlaying === msg.id
                      ? 'bg-white/20'
                      : 'bg-white/15 hover:bg-white/25'}`}
                >
                  {audioPlaying === msg.id
                    ? <Icon name="x"   size={13} className="text-white" />
                    : <Icon name="mic" size={13} className="text-white" />}
                </button>

                <div className="flex items-end gap-px flex-1">
                  {[4,7,5,9,6,11,7,5,8,6,10,7,5,8,6].map((h, i) => (
                    <div
                      key={i}
                      className={`w-0.5 rounded-full flex-shrink-0 transition-colors
                        ${audioPlaying === msg.id ? 'wave-bar bg-white/90' : 'bg-white/50'}`}
                      style={{
                        height: `${h}px`,
                        animationDelay: audioPlaying === msg.id ? `${i * 0.06}s` : undefined,
                      }}
                    />
                  ))}
                </div>

                <span className="text-[10px] text-white/60 shrink-0">0:03</span>
              </div>
            </div>
          )}

          <span
            className="absolute bottom-1.5 right-2 flex items-center gap-0.5 pointer-events-none select-none"
            style={{ fontSize: '10px', lineHeight: 1 }}
          >
            <span style={{ color: isUser ? 'rgba(255,255,255,0.6)' : '#8893A8' }}>
              {formatTime(msg.time || new Date())}
            </span>
            {isUser && <DoubleTick read={!!msg.read} />}
          </span>

          {!isUser && (
            <button
              onClick={() => onPlayAudio(msg.id)}
              className={`absolute bottom-1.5 right-2 flex items-center gap-0.5 text-[10px]
                px-1.5 py-0.5 rounded-full transition-all
                ${audioPlaying === msg.id
                  ? 'text-teal-light bg-teal/20'
                  : 'text-slate hover:text-teal-light'}`}
            >
              {audioPlaying === msg.id ? (
                <span className="flex gap-0.5 items-end h-2.5">
                  {[1,2,3,4].map(i => (
                    <span
                      key={i}
                      className="w-0.5 bg-teal-light rounded-sm wave-bar"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </span>
              ) : (
                <Icon name="mic" size={10} />
              )}
            </button>
          )}
        </div>
      </div>

      {isUser && <div className="w-7 shrink-0" />}
    </div>
  )
}

export function TypingBubble() {
  return (
    <div className="flex items-end gap-1.5 justify-start mb-1.5">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal to-teal-light flex items-center justify-center shrink-0 shadow-sm">
        <Icon name="activity" size={13} className="text-white" />
      </div>
      <div className="relative">
        <TailLeft />
        <div
          className="px-4 py-3 rounded-tl-sm rounded-tr-2xl rounded-bl-2xl rounded-br-2xl shadow-md flex items-center gap-1.5"
          style={{
            background: '#122040',
            border: '1px solid rgba(14,139,139,0.2)',
            minWidth: 56,
          }}
        >
          {[0, 0.25, 0.5].map((delay, i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-slate animate-bounce"
              style={{ animationDelay: `${delay}s`, animationDuration: '1s' }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

const WALLPAPER = {
  backgroundColor: '#0A0F1E',
  backgroundImage: `
    radial-gradient(circle at 15% 25%, rgba(11,110,110,0.07) 0%, transparent 50%),
    radial-gradient(circle at 85% 75%, rgba(245,166,35,0.04) 0%, transparent 50%),
    url("data:image/svg+xml,%3Csvg width='52' height='52' viewBox='0 0 52 52' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M26 0C11.64 0 0 11.64 0 26s11.64 26 26 26 26-11.64 26-26S40.36 0 26 0zm0 4c5.52 0 10.56 1.93 14.48 5.12L9.12 40.48A21.88 21.88 0 0 1 4 26C4 13.85 13.85 4 26 4zm0 44c-5.52 0-10.56-1.93-14.48-5.12L42.88 11.52A21.88 21.88 0 0 1 48 26c0 12.15-9.85 22-22 22z' fill='%238893A8' fill-opacity='0.025'/%3E%3C/svg%3E")
  `,
}

export default function Messages({ messages, isTyping, audioPlaying, onPlayAudio, bottomRef }) {
  const grouped = messages.map((msg, i, arr) => ({
    ...msg,
    isFirst: i === 0 || arr[i - 1].sender !== msg.sender,
    isLast:  i === arr.length - 1 || arr[i + 1].sender !== msg.sender,
  }))

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 min-h-0" style={WALLPAPER}>
      <DateSep label="Today" />

      {grouped.map((msg) => (
        <Bubble
          key={msg.id}
          msg={msg}
          isFirst={msg.isFirst}
          isLast={msg.isLast}
          audioPlaying={audioPlaying}
          onPlayAudio={onPlayAudio}
        />
      ))}

      {isTyping && <TypingBubble />}

      <div ref={bottomRef} />
    </div>
  )
}
