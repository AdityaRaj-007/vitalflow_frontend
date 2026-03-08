import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useVoiceAssistant,
  useRoomContext,
  useChat,
} from "@livekit/components-react";
import { RoomEvent } from "livekit-client";
import "@livekit/components-styles";
import Icon from '../../components/ui/Icon'

/* ─── Call timer ──────────────────────────────────────────────────────── */
function useCallTimer(running) {
  const [secs, setSecs] = useState(0)
  useEffect(() => {
    if (!running) { setSecs(0); return }
    const id = setInterval(() => setSecs(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [running])
  const mm = String(Math.floor(secs / 60)).padStart(2, '0')
  const ss = String(secs % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

/* ─── Waveform ────────────────────────────────────────────────────────── */
function WaveForm({ active, bars = 28 }) {
  return (
    <div className="flex items-center justify-center gap-0.5" style={{ height: 40 }}>
      {Array.from({ length: bars }, (_, i) => (
        <div
          key={i}
          className="rounded-full flex-shrink-0"
          style={{
            width: 3,
            background: '#0E8B8B',
            opacity: active ? 0.9 : 0.25,
            height: active ? undefined : 4,
            animation: active
              ? `aiWave ${0.6 + (i % 5) * 0.12}s ease-in-out ${i * 0.04}s infinite alternate`
              : 'none',
          }}
        />
      ))}
    </div>
  )
}

/* ─── Pulse rings ─────────────────────────────────────────────────────── */
function PulseRings({ speaking }) {
  if (!speaking) return null
  return (
    <>
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className="absolute inset-0 rounded-full border border-teal/40"
          style={{
            animation: `meetPulse 2s ease-out ${i * 0.5}s infinite`,
            transform: `scale(${1 + i * 0.15})`,
          }}
        />
      ))}
    </>
  )
}

/* ─── Control button ──────────────────────────────────────────────────── */
function CtrlBtn({ icon, label, onClick, danger = false, active = false, size = 'md' }) {
  const s = size === 'lg' ? { btn: 64, icon: 24 } : { btn: 52, icon: 20 }
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 group" aria-label={label}>
      <div
        className="rounded-full flex items-center justify-center transition-all duration-200"
        style={{
          width: s.btn, height: s.btn,
          background: danger
            ? 'linear-gradient(135deg,#c0392b,#e74c3c)'
            : active ? 'rgba(14,139,139,0.35)' : 'rgba(255,255,255,0.1)',
          border: danger ? 'none' : `1.5px solid ${active ? 'rgba(14,139,139,0.6)' : 'rgba(255,255,255,0.15)'}`,
          boxShadow: danger ? '0 4px 20px rgba(231,76,60,0.4)' : 'none',
        }}
      >
        <Icon
          name={icon} size={s.icon}
          className={danger ? 'text-white' : active ? 'text-teal-light' : 'text-white/80 group-hover:text-white'}
        />
      </div>
      <span className="text-[11px] text-white/50 group-hover:text-white/80 transition-colors">{label}</span>
    </button>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   PRE-CALL LANDING
═══════════════════════════════════════════════════════════════════════ */
function PreCallScreen({ onStartCall }) {
  const FEATURES = [
    { icon: 'calendar', label: 'Book appointments instantly'      },
    { icon: 'users',    label: 'Connects you to the right doctor' },
  ]

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 animate-fade-in">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-teal/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-amber/4 blur-3xl" />
      </div>

      <div className="relative mb-10">
        <div className="absolute -inset-8 rounded-full border border-teal/10 animate-spin" style={{ animationDuration: '20s' }} />
        <div className="absolute -inset-5 rounded-full border border-teal/15 animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }} />
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full flex items-center justify-center"
             style={{ background: 'linear-gradient(135deg,#0B6E6E 0%,#0E8B8B 60%,#1aa5a5 100%)',
                      boxShadow: '0 0 60px rgba(11,110,110,0.45),0 0 120px rgba(11,110,110,0.2)' }}>
          <Icon name="mic" size={52} className="text-white" />
        </div>
      </div>

      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-cream text-center mb-2">
        VitalFlow Voice Agent
      </h1>
      <p className="text-slate text-sm sm:text-base text-center max-w-md leading-relaxed mb-10">
        Speak naturally to book your appointment. Our AI will find the right
        specialist, check availability, and confirm your slot all in one call.
      </p>

      <div className="grid grid-cols-2 gap-2.5 mb-12 w-full max-w-sm">
        {FEATURES.map(f => (
          <div key={f.label}
               className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
               style={{ background: 'rgba(11,110,110,0.08)', border: '1px solid rgba(14,139,139,0.2)' }}>
            <Icon name={f.icon} size={15} className="text-teal-light shrink-0" />
            <span className="text-xs text-cream/70 leading-tight">{f.label}</span>
          </div>
        ))}
      </div>

      <button onClick={onStartCall} className="relative group" aria-label="Start call">
        <span className="absolute inset-0 rounded-full bg-teal/30 animate-ping" style={{ animationDuration: '2s' }} />
        <span className="absolute -inset-3 rounded-full bg-teal/15 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
        <div className="relative flex items-center gap-3 px-8 py-4 rounded-full text-white font-semibold text-base
                        transition-all duration-300 group-hover:scale-105 group-hover:shadow-glow"
             style={{ background: 'linear-gradient(135deg,#0B6E6E,#0E8B8B)', boxShadow: '0 8px 32px rgba(11,110,110,0.5)' }}>
          <Icon name="phone" size={20} className="text-white" />
          Start Call to Book
        </div>
      </button>
      <p className="mt-6 text-xs text-slate/60 text-center">Tap the button above and speak no typing needed</p>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   DOCTOR CARD
═══════════════════════════════════════════════════════════════════════ */
function DoctorCard({ doc, onSelect }) {
  const time = new Date(doc.availableAt);
  const formattedTime = time.toLocaleString("en-US",{timeZone: "IST"});
  return (
    <div
      onClick={() => onSelect(doc)}
      className="border border-[#dadce0] rounded-xl p-3 cursor-pointer flex-shrink-0
                 transition-all duration-200 hover:bg-[#f1f3f4] hover:shadow-md hover:-translate-y-0.5
                 active:bg-[#e8f0fe]"
    >
      <h3 className="text-sm font-semibold text-[#202124] mb-0.5">{doc.name}</h3>
      <p className="text-xs text-[#5f6368] font-medium mb-0.5">{doc.speciality}</p>
      <p className="text-xs text-[#188038] font-bold">{formattedTime}</p>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   DOCTOR RESULTS
   Self-contained — owns doctors state, uses LiveKit hooks directly.

   Mobile layout strategy:
   ┌─────────────────────┐  ← fixed inset-0 (call screen)
   │   Call area         │  ← flex-1, gets paddingBottom = sheet height
   │   (avatar, timer)   │     so controls stay above the sheet
   │   [Mute][End][More] │
   ├─────────────────────┤  ← absolute bottom-0 sheet (z-30)
   │ Available Doctors   │  ← height: min(60vh, 480px), min 260px
   │ [card] [card] ...   │  ← overflow-y-auto + min-h-0 = real scroll
   └─────────────────────┘

   Desktop: side panel in flex-row beside the call area (unchanged).
═══════════════════════════════════════════════════════════════════════ */
function DoctorResults({ onDoctorsChange }) {
  const room = useRoomContext()
  const { send } = useChat()
  const [doctors, setDoctors] = useState([])

  // Tell InCallScreen whether the sheet is open so it can apply paddingBottom
  useEffect(() => {
    onDoctorsChange?.(doctors.length > 0)
  }, [doctors.length]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!room) return
    const handleData = (payload, _p, _k, topic) => {
      if (topic !== 'doctor-results') return
      try {
        const data = JSON.parse(new TextDecoder().decode(payload))
        if (data.type === 'DOCTOR_RESULTS') setDoctors(data.payload.doctors)
      } catch (err) {
        console.error('Invalid data received:', err)
      }
    }
    room.on(RoomEvent.DataReceived, handleData)
    return () => room.off(RoomEvent.DataReceived, handleData)
  }, [room])

  const handleSelect = async (doc) => {
    await send(`Please book my appointment with ${doc.name} (ID: ${doc.id}) at ${doc.availableAt} (Location: ${doc.location}).`)
    setDoctors([])
  }

  if (!doctors.length) return null

  /* Sheet height — same value used for paddingBottom in InCallScreen */
  const SHEET_H = 'min(60vh, 480px)'

  return (
    <>
      {/* ══ MOBILE: absolute sheet ══
          absolute (not fixed) so it stays within the fixed call container.
          Does NOT participate in flex layout → call area is never squished.
          paddingBottom on the call area (via onDoctorsChange) pushes
          avatar + controls up so they remain fully visible.               */}
      <div
        className="md:hidden absolute bottom-0 left-0 right-0 flex flex-col
                   rounded-t-3xl px-4 pt-4 bg-white animate-fade-up"
        style={{
          height:    SHEET_H,
          minHeight: 260,
          boxShadow: '0 -10px 40px rgba(0,0,0,0.35)',
          zIndex:    30,
        }}
      >
        {/* Drag handle */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3 flex-shrink-0" />

        <h2 className="text-lg font-bold text-[#202124] mb-3 flex-shrink-0">
          Available Doctors
        </h2>

        {/* flex-1 + min-h-0 → the list gets a real bounded height and scrolls.
            Without min-h-0 the browser lets it grow past the sheet boundary. */}
        <div
          className="flex flex-col gap-2.5 overflow-y-auto flex-1 min-h-0"
          style={{ paddingBottom: 20 }}
        >
          {doctors.map(doc => (
            <DoctorCard key={doc.id} doc={doc} onSelect={handleSelect} />
          ))}
        </div>
      </div>

      {/* ══ DESKTOP: side panel in flex-row flow ══ */}
      <div
        className="hidden md:flex flex-col flex-shrink-0 bg-white
                   md:w-[400px] md:h-[calc(100vh-40px)]
                   md:rounded-2xl md:my-5 md:mr-5
                   md:border md:border-gray-200 md:shadow-2xl
                   md:p-6 animate-fade-in"
      >
        <h2 className="text-xl font-bold text-[#202124] mb-5 flex-shrink-0">
          Available Doctors
        </h2>
        <div
          className="flex flex-col gap-3 overflow-y-auto flex-1 min-h-0 pr-1"
          style={{ paddingBottom: 8 }}
        >
          {doctors.map(doc => (
            <DoctorCard key={doc.id} doc={doc} onSelect={handleSelect} />
          ))}
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   IN-CALL SCREEN  (must be inside <LiveKitRoom>)
═══════════════════════════════════════════════════════════════════════ */
function InCallScreen({ onEndCall, onOpenChat }) {
  const [muted,       setMuted]      = useState(false)
  const [aiSpeaking,  setAiSpeak]    = useState(false)
  const [showMenu,    setShowMenu]   = useState(false)
  const [agentStatus, setStatus]     = useState('Connecting…')
  const [hasDoctors,  setHasDoctors] = useState(false)
  const timer = useCallTimer(true)
  const { state } = useVoiceAssistant()

  useEffect(() => {
    setStatus(state + '…')
    setAiSpeak(state === 'speaking')
  }, [state])

  const menuItems = [
    { icon: 'message-square', label: 'Open Chat', action: onOpenChat, highlight: true },
  ]

  /* Match this value to SHEET_H in DoctorResults */
  const mobilePadding = hasDoctors ? 'min(60vh, 480px)' : '0px'

  return (
    /* flex-col on mobile, flex-row on desktop */
    <div className="fixed inset-0 z-50 flex flex-col md:flex-row" style={{ background: '#0a0a0f' }}>

      {/* ── Call area ── */}
      <div
        className="relative flex-1 flex flex-col"
        style={{
          paddingBottom: mobilePadding,
          transition: 'padding-bottom 0.35s ease',
        }}
      >
        <RoomAudioRenderer />

        {/* Ambient gradient */}
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%,rgba(11,110,110,0.12) 0%,transparent 60%)' }} />

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-teal-light animate-pulse" />
            <span className="text-sm font-medium text-white/80">VitalFlow Voice Agent</span>
          </div>
          <span className="text-sm text-white/50 font-mono tracking-widest">{timer}</span>
        </div>

        {/* Center: avatar + waveform */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 relative z-10 px-4">
          <span className="text-xs text-teal-light uppercase tracking-widest font-medium">
            {agentStatus}
          </span>

          <div className="relative flex items-center justify-center">
            <PulseRings speaking={aiSpeaking} />
            <div className="absolute w-52 h-52 rounded-full"
                 style={{
                   background: aiSpeaking
                     ? 'radial-gradient(circle,rgba(14,139,139,0.25) 0%,transparent 70%)'
                     : 'radial-gradient(circle,rgba(14,139,139,0.08) 0%,transparent 70%)',
                   transition: 'background 0.6s ease',
                 }} />
            <div
              className="relative w-32 h-32 sm:w-44 sm:h-44 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg,#0B6E6E 0%,#0E8B8B 60%,#1aa5a5 100%)',
                boxShadow: aiSpeaking
                  ? '0 0 50px rgba(14,139,139,0.6),0 0 100px rgba(14,139,139,0.25)'
                  : '0 0 20px rgba(14,139,139,0.2)',
                transition: 'box-shadow 0.5s ease',
              }}
            >
              <span className="text-3xl sm:text-4xl font-medium text-white">VF</span>
            </div>
          </div>

          <div style={{ width: 220 }}>
            <WaveForm active={aiSpeaking} />
          </div>
        </div>

        {/* Bottom controls */}
        <div className="relative z-10 pb-6 sm:pb-10">
          {showMenu && (
            <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-56
                            rounded-2xl overflow-hidden animate-fade-up"
                 style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)',
                          boxShadow: '0 -8px 40px rgba(0,0,0,0.6)', zIndex: 50 }}>
              {menuItems.map(item => (
                <button
                  key={item.label}
                  onClick={() => { item.action(); setShowMenu(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/5"
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center
                    ${item.highlight ? 'bg-teal/25 text-teal-light' : 'bg-white/8 text-white/60'}`}>
                    <Icon name={item.icon} size={16} />
                  </div>
                  <span className={`text-sm font-medium ${item.highlight ? 'text-teal-light' : 'text-white/70'}`}>
                    {item.label}
                  </span>
                  {item.highlight && (
                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-teal/20 text-teal-light border border-teal/30">
                      New
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-center gap-5 sm:gap-8">
            <CtrlBtn
              icon={muted ? 'mic-off' : 'mic'}
              label={muted ? 'Unmute' : 'Mute'}
              active={muted}
              onClick={() => setMuted(v => !v)}
            />
            <CtrlBtn icon="phone-off" label="End Call" danger size="lg" onClick={onEndCall} />
            <div className="relative">
              <CtrlBtn
                icon="more-vertical"
                label="More"
                active={showMenu}
                onClick={() => setShowMenu(v => !v)}
              />
              {!showMenu && (
                <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-teal-light border-2 border-[#0a0a0f]" />
              )}
            </div>
          </div>
        </div>

        {showMenu && <div className="fixed inset-0 z-0" onClick={() => setShowMenu(false)} />}
      </div>

      {/* DoctorResults: renders nothing until data arrives.
          onDoctorsChange keeps hasDoctors in sync for paddingBottom. */}
      <DoctorResults onDoctorsChange={setHasDoctors} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════════════════ */
export default function VoiceAgent() {
  const { auth } = useAuth()
  const [inCall,            setInCall]            = useState(false)
  const [connectionDetails, setConnectionDetails] = useState(null)
  const navigate = useNavigate()

  const handleStartCall = async () => {
    setInCall(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/get-token/${auth?.id ?? ''}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()
      setConnectionDetails(data)
    } catch (err) {
      console.error('Failed to fetch connection details:', err)
    }
  }

  return (
    <>
      <style>{`
        @keyframes aiWave   { from { height:4px } to { height:36px } }
        @keyframes meetPulse { 0% { transform:scale(1); opacity:.6 } 100% { transform:scale(1.8); opacity:0 } }
      `}</style>

      {inCall && connectionDetails ? (
        <LiveKitRoom
          serverUrl={connectionDetails.url}
          token={connectionDetails.token}
          connect={true}
          audio={true}
          video={false}
          onDisconnected={() => { setConnectionDetails(null); setInCall(false) }}
          className="lk-theme"
        >
          <InCallScreen
            onEndCall={() => setInCall(false)}
            onOpenChat={() => navigate('/chat')}
          />
        </LiveKitRoom>
      ) : (
        <div className="flex flex-col min-h-[calc(100vh-140px)]">
          <PreCallScreen onStartCall={handleStartCall} />
        </div>
      )}
    </>
  )
}