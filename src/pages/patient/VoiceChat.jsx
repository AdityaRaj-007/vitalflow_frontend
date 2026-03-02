import { useState, useRef, useEffect } from 'react'
import ChatHeader from '../../components/chat/ChatHeader'
import Messages from '../../components/chat/Messages'
import ChatInput from '../../components/chat/ChatInput'
import Badge from '../../components/ui/Badge'
import Icon from '../../components/ui/Icon'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const USER_ID = 1

const SUGGESTED_QUESTIONS = [
  'What do my latest lab results mean?',
  'When is my next appointment?',
  'Are my medications up to date?',
  'What about my blood pressure?',
]

const HEALTH_CONTEXT = [
  { icon: 'heart', label: 'HbA1c', value: '6.8%' },
  { icon: 'activity', label: 'Blood Pressure', value: '118/76 mmHg' },
  { icon: 'clipboard', label: 'Active Meds', value: '3 medications' },
  { icon: 'calendar', label: 'Next Appt', value: 'Feb 28 · 10:30 AM' },
]

let _id = 0
const uid = () => ++_id

const historyToMessages = (history) => [
  {
    id: uid(),
    sender: 'bot',
    text: "Hi! I'm your MedicAI health assistant. I have access to your medical records, upcoming appointments, and lab results. Ask me anything — by voice or text.",
    time: new Date(),
    read: false,
  },
  ...history
    .filter((turn) => {
      const text = turn.parts?.[0]?.text ?? ''
      return !text.startsWith('[SYSTEM:')
    })
    .map((turn) => ({
      id: uid(),
      sender: turn.role === 'user' ? 'user' : 'bot',
      type: 'text',
      text: turn.parts?.[0]?.text ?? '',
      time: new Date(),
      read: true,
    })),
]


export default function VoiceChat() {
  const [messages, setMessages] = useState([
    {
      id: uid(),
      sender: 'bot',
      text: "Hi! I'm your MedicAI health assistant 👋  I have access to your medical records, upcoming appointments, and lab results. Ask me anything — by voice or text.",
      time: new Date(),
      read: false,
    },
  ])

  const [input, setInput] = useState('')
  const [recording, setRecording] = useState(false)
  const [isProcessing, setProcessing] = useState(false)
  const [audioURL, setAudioURL] = useState(null)
  const [audioPlaying, setAudioPlaying] = useState(null)
  const [showContext, setShowContext] = useState(false)

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const sessionIdRef = useRef(crypto.randomUUID())   // stable per session
  const currentAudioRef = useRef(null)                  // currently playing TTS audio
  const recordedBlobRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isProcessing])

  const markAllRead = () =>
    setMessages(prev => prev.map(m => ({ ...m, read: true })))

  const startRecording = async () => {
    if (isProcessing) return

    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current = null
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        recordedBlobRef.current = blob
        setAudioURL(URL.createObjectURL(blob))
      }

      mediaRecorder.start()
      setRecording(true)
    } catch (err) {
      console.error('Microphone access denied:', err)
      addBotMessage('Microphone access was denied. Please allow mic permissions and try again.')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  const handleSendAudio = () => {
    if (!recordedBlobRef.current) return

    const voiceMsg = {
      id: uid(),
      sender: 'user',
      type: 'audio',
      audioURL: audioURL,
      text: null,
      time: new Date(),
      read: false,
    }
    setMessages(prev => [...prev, voiceMsg])
    setAudioURL(null)

    sendToServer(recordedBlobRef.current)
    recordedBlobRef.current = null
  }

  const handleCancelAudio = () => {
    setAudioURL(null)
    recordedBlobRef.current = null
  }

  const handleSendText = (text) => {
    if (!text?.trim() || isProcessing) return

    const userMsg = {
      id: uid(),
      sender: 'user',
      type: 'text',
      text: text.trim(),
      time: new Date(),
      read: false,
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')

    sendTextToServer(text.trim())
  }

  const sendToServer = async (audioBlob) => {
    setProcessing(true)

    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.webm')
    formData.append('sessionId', sessionIdRef.current)
    formData.append('userId', String(USER_ID))

    try {
      const res = await fetch(API_BASE_URL + '/talk', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)

      const { audio, history } = await res.json()

      if (history && Array.isArray(history)) {
        setMessages(historyToMessages(history))
      }

      if (audio) playBotAudio(audio)

    } catch (err) {
      console.error('Talk request failed:', err)
      addBotMessage('Sorry, something went wrong. Please try again.')
    } finally {
      setProcessing(false)
      markAllRead()
    }
  }

  const sendTextToServer = async (text) => {
    setProcessing(true)

    const formData = new FormData()
    formData.append('text', text)
    formData.append('sessionId', sessionIdRef.current)
    formData.append('userId', String(USER_ID))

    try {
      const res = await fetch(API_BASE_URL + '/talk', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)

      const { audio, history } = await res.json()

      if (history && Array.isArray(history)) {
        setMessages(historyToMessages(history))
      } else {
        addBotMessage('I received your message. (Backend reply goes here.)')
      }

      if (audio) playBotAudio(audio)

    } catch (err) {
      console.error('Talk request failed:', err)
      addBotMessage('Sorry, I couldn\'t reach the server. Check your connection.')
    } finally {
      setProcessing(false)
      markAllRead()
    }
  }

  const addBotMessage = (text) =>
    setMessages(prev => [...prev, { id: uid(), sender: 'bot', type: 'text', text, time: new Date(), read: false }])

  const playBotAudio = (base64) => {
    const audioEl = new Audio(`data:audio/wav;base64,${base64}`)
    currentAudioRef.current = audioEl
    audioEl.onended = () => { currentAudioRef.current = null }
    audioEl.play().catch(console.error)
  }

  const handlePlayAudio = (id) => {
    setAudioPlaying(prev => (prev === id ? null : id))
    setTimeout(() => setAudioPlaying(null), 3000)
  }

  const status = recording ? 'recording' : isProcessing ? 'processing' : 'idle'

  const sendSuggestion = (q) => {
    if (!isProcessing && !recording) handleSendText(q)
  }

  return (
    <div className="animate-fade-in flex flex-col" style={{ height: 'calc(100vh - 112px)' }}>

      <div className="flex flex-wrap justify-between items-center gap-3 mb-4 shrink-0">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-cream tracking-tight">
            Voice Chat
          </h1>
          <p className="text-slate text-xs sm:text-sm mt-0.5">
            AI health assistant
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="teal">● Live</Badge>
          <button
            onClick={() => setShowContext(v => !v)}
            className="btn-ghost xl:hidden !px-2.5 !py-2"
            aria-label="Health context"
          >
            <Icon name="user" size={15} />
          </button>
        </div>
      </div>

      {showContext && (
        <div className="xl:hidden mb-3 animate-fade-in shrink-0">
          <div className="card-glass p-4">
            <div className="flex justify-between items-center mb-3">
              <p className="section-label !mb-0">Health Context</p>
              <button onClick={() => setShowContext(false)} className="text-slate hover:text-cream">
                <Icon name="x" size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2.5 mb-3">
              {HEALTH_CONTEXT.map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-cream/[0.06] rounded-md flex items-center justify-center shrink-0">
                    <Icon name={item.icon} size={12} className="text-slate" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-slate uppercase tracking-wide mb-0.5">{item.label}</p>
                    <p className="text-[11px] text-cream font-medium truncate">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 pt-3 border-t border-cream/[0.08]">
              {SUGGESTED_QUESTIONS.slice(0, 2).map((q, i) => (
                <button
                  key={i}
                  onClick={() => { sendSuggestion(q); setShowContext(false) }}
                  disabled={isProcessing || recording}
                  className="text-xs text-cream-dk px-2.5 py-1.5 bg-cream/[0.04] border border-cream/[0.08]
                             rounded-full hover:bg-teal/10 hover:border-teal/30 transition-all
                             disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4 flex-1 min-h-0">

        <div
          className="flex-1 flex flex-col min-h-0 rounded-2xl overflow-hidden border border-teal/20"
          style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.4)' }}
        >
          <ChatHeader status={status} />

          {/* {!recording && !audioURL && (
            <div
              className="flex gap-2 px-3 py-2 overflow-x-auto shrink-0"
              style={{ background: '#0A0F1E', borderBottom: '1px solid rgba(14,139,139,0.1)' }}
            >
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendSuggestion(q)}
                  disabled={isProcessing || recording}
                  className="flex-shrink-0 text-[11px] text-teal-light px-3 py-1.5 rounded-full border border-teal/30
                             bg-teal/10 hover:bg-teal/20 transition-colors whitespace-nowrap
                             disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {q}
                </button>
              ))}
            </div>
          )} */}

          <Messages
            messages={messages}
            isTyping={isProcessing}
            audioPlaying={audioPlaying}
            onPlayAudio={handlePlayAudio}
            bottomRef={bottomRef}
          />

          <ChatInput
            input={input}
            setInput={setInput}
            onSendText={handleSendText}
            recording={recording}
            isProcessing={isProcessing}
            audioURL={audioURL}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onSendAudio={handleSendAudio}
            onCancelAudio={handleCancelAudio}
          />
        </div>

        <div className="hidden xl:flex w-60 flex-col gap-4 shrink-0">

          <div className="card-glass p-4">
            <p className="section-label mb-3">Health Context</p>
            <div className="flex flex-col gap-2.5">
              {HEALTH_CONTEXT.map(item => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-cream/[0.06] rounded-lg flex items-center justify-center shrink-0">
                    <Icon name={item.icon} size={13} className="text-slate" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate uppercase tracking-wide mb-0.5">{item.label}</p>
                    <p className="text-xs text-cream font-medium truncate">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-glass p-4">
            <p className="section-label mb-3">Suggested</p>
            <div className="flex flex-col gap-1.5">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendSuggestion(q)}
                  disabled={isProcessing || recording}
                  className="text-left text-xs text-cream-dk px-3 py-2.5 bg-cream/[0.04] border border-cream/[0.08]
                             rounded-xl transition-all hover:bg-teal/10 hover:border-teal/30 hover:text-cream
                             disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="card-glass p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="section-label !mb-0">Session</p>
              <span className="badge badge-teal">Encrypted</span>
            </div>
            <p className="text-[11px] text-slate leading-relaxed">
              Secured with AES-256 encryption. AI responses should not replace professional medical advice.
            </p>
            <div className="mt-3 pt-3 border-t border-cream/[0.08]">
              <p className="text-[10px] text-slate/60 font-mono truncate">
                session: {sessionIdRef.current.slice(0, 16)}…
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
