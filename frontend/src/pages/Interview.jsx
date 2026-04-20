import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../utils/api'
import Navbar from '../components/Navbar'
import { Video, VideoOff, Mic, MicOff, Play, Square, ChevronRight, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

const Q_TIME = 60  // seconds per question

const TYPE_META = {
  resume:    { label: 'Resume-Based',    color: '#6366f1' },
  job:       { label: 'Job Requirement', color: '#7c3aed' },
  skill_gap: { label: 'Skill Gap',       color: '#f5a623' },
}

/* ── Circular countdown ──────────────────────────────── */
function CountdownRing({ seconds, total }) {
  const r    = 24
  const circ = 2 * Math.PI * r
  const pct  = seconds / total
  const col  = seconds > 30 ? '#7c3aed' : seconds > 15 ? '#f5a623' : '#ef4444'
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 60 60">
        <circle cx="30" cy="30" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5"/>
        <circle cx="30" cy="30" r={r} fill="none" stroke={col} strokeWidth="3.5"
          strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s linear, stroke 0.4s' }}/>
      </svg>
      <span className="font-mono font-bold text-sm z-10" style={{ color: col }}>
        {String(Math.floor(seconds/60)).padStart(2,'0')}:{String(seconds%60).padStart(2,'0')}
      </span>
    </div>
  )
}

/* ── Horizontal timer bar ────────────────────────────── */
function TimerBar({ seconds, total }) {
  const pct = (seconds / total) * 100
  const col = seconds > 30 ? '#7c3aed' : seconds > 15 ? '#f5a623' : '#ef4444'
  return (
    <div className="h-[2px] bg-white/5 w-full rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-[1s] linear"
        style={{ width: `${pct}%`, background: col }}/>
    </div>
  )
}

export default function Interview() {
  const { id }       = useParams()
  const location     = useLocation()
  const navigate     = useNavigate()

  const [data, setData]         = useState(location.state || null)
  const [qIdx, setQIdx]         = useState(0)
  const [answer, setAnswer]     = useState('')
  const [timeLeft, setTime]     = useState(Q_TIME)
  const [started, setStarted]   = useState(false)
  const [recording, setRecording] = useState(false)
  const [submitting, setSub]    = useState(false)
  const [lastScores, setScores] = useState(null)
  const [camReady, setCamReady] = useState(false)
  const [voiceOn, setVoice]     = useState(false)

  const videoRef     = useRef()
  const streamRef    = useRef()
  const mediaRecRef  = useRef()   // MediaRecorder for video+audio
  const chunksRef    = useRef([])
  const timerRef     = useRef()
  const srRef        = useRef()   // SpeechRecognition

  /* ── Webcam init ─────────────────────────────────── */
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 }, audio: true })
      .then(stream => {
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
        setCamReady(true)
      })
      .catch(() => setCamReady(false))
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, [])

  /* Load data if missing */
  useEffect(() => {
    if (!data) api.get(`/interview/${id}`).then(r => setData(r.data)).catch(console.error)
  }, [id])

  /* ── Timer ───────────────────────────────────────── */
  useEffect(() => {
    if (!started) return
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTime(t => { if (t <= 1) { clearInterval(timerRef.current); handleNext(); return 0 } return t-1 })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [started, qIdx])

  /* ── Start video recording ───────────────────────── */
  const startRecording = () => {
    if (!streamRef.current || recording) return
    chunksRef.current = []
    const mr = new MediaRecorder(streamRef.current, { mimeType: 'video/webm;codecs=vp8,opus' })
    mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
    mr.start(1000)
    mediaRecRef.current = mr
    setRecording(true)
  }

  const stopRecording = () => {
    if (mediaRecRef.current?.state !== 'inactive') {
      mediaRecRef.current?.stop()
    }
    setRecording(false)
  }

  /* ── Voice input ─────────────────────────────────── */
  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    const r = new SR(); r.continuous = true; r.interimResults = true
    r.onresult = e => setAnswer(Array.from(e.results).map(x => x[0].transcript).join(' '))
    r.onerror  = () => {}
    r.start(); srRef.current = r; setVoice(true)
  }
  const stopVoice = () => { srRef.current?.stop(); setVoice(false) }

  /* ── Handle Start button ─────────────────────────── */
  const handleStart = () => {
    setStarted(true)
    startRecording()
    startVoice()
  }

  /* ── Handle Stop / manual stop ───────────────────── */
  const handleStop = () => {
    stopRecording()
    stopVoice()
    clearInterval(timerRef.current)
    // Don't advance — let user review & click Next
  }

  /* ── Next question / finish ──────────────────────── */
  const handleNext = useCallback(async () => {
    if (submitting) return
    clearInterval(timerRef.current)
    stopRecording(); stopVoice()
    setSub(true)

    const questions = data?.questions || []
    try {
      const r = await api.post(`/interview/${id}/answer`, {
        questionIndex: qIdx,
        answerText:    answer.trim() || '(No answer provided)'
      })
      setScores(r.data.scores)
    } catch { setScores({ accuracy:50, technical:50, communication:50, confidence:50, overall:50 }) }

    if (qIdx + 1 >= questions.length) {
      await api.post(`/interview/${id}/complete`).catch(() => {})
      streamRef.current?.getTracks().forEach(t => t.stop())
      navigate(`/results/${id}`)
      return
    }

    await new Promise(r => setTimeout(r, 1200))
    setQIdx(i => i+1)
    setAnswer(''); setTime(Q_TIME); setStarted(false); setScores(null); setSub(false); setRecording(false)
  }, [qIdx, answer, id, data, submitting, navigate])

  /* ── Guard ───────────────────────────────────────── */
  if (!data) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-violet border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  const questions = data.questions || []
  const q    = questions[qIdx]
  const meta = TYPE_META[q?.type] || TYPE_META.job
  const isLast = qIdx + 1 >= questions.length

  return (
    <div className="min-h-screen bg-bg">
      <Navbar/>
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-10">

        {/* Progress */}
        <div className="pt-4 mb-5">
          <div className="flex justify-between text-xs font-mono text-sub mb-1.5">
            <span>Question {qIdx+1} / {questions.length}</span>
            <span>{Math.round((qIdx/questions.length)*100)}% complete</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-violet to-indigo"
              animate={{ width: `${(qIdx/questions.length)*100}%` }} transition={{ duration: 0.5 }}/>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Main panel ─────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Question card */}
            <AnimatePresence mode="wait">
              <motion.div key={qIdx} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}
                transition={{duration:0.25}} className="glass rounded-2xl overflow-hidden">
                {started && <TimerBar seconds={timeLeft} total={Q_TIME}/>}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-lg text-xs font-semibold"
                      style={{ background: `${meta.color}18`, color: meta.color, border: `1px solid ${meta.color}30` }}>
                      {meta.label}
                    </span>
                    {started ? (
                      <CountdownRing seconds={timeLeft} total={Q_TIME}/>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs text-sub">
                        <Clock size={12}/> 60 seconds
                      </span>
                    )}
                  </div>
                  <p className="text-text text-lg font-medium leading-relaxed">{q?.question}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Answer textarea */}
            <div className="glass rounded-2xl p-5 flex-1">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-text">Your Answer</span>
                <div className="flex items-center gap-2">
                  {voiceOn && (
                    <span className="flex items-center gap-1.5 text-xs text-danger">
                      <span className="w-2 h-2 rounded-full bg-danger animate-pulse"/> Listening
                    </span>
                  )}
                  <button onClick={voiceOn ? stopVoice : startVoice}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                      ${voiceOn ? 'bg-danger/10 text-danger border-danger/20' : 'bg-white/5 text-sub border-border hover:border-border-hi hover:text-text'}`}>
                    {voiceOn ? <><MicOff size={12}/>Stop voice</> : <><Mic size={12}/>Voice input</>}
                  </button>
                </div>
              </div>
              <textarea value={answer} onChange={e=>setAnswer(e.target.value)}
                placeholder={started ? 'Type or speak your answer… Use STAR method: Situation, Task, Action, Result.' : 'Press "Start" below to begin the 60-second timer, then answer here.'}
                rows={7} disabled={!started}
                className="w-full bg-transparent outline-none text-dim text-sm leading-relaxed resize-none placeholder:text-muted/40 disabled:opacity-40"/>
              <div className="flex justify-between mt-3 pt-3 border-t border-border text-xs text-sub">
                <span className="font-mono">{answer.split(/\s+/).filter(Boolean).length} words</span>
                <span>Aim for 80+ words with specific examples</span>
              </div>
            </div>

            {/* Score flash */}
            <AnimatePresence>
              {lastScores && (
                <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                  className="glass rounded-xl p-4 border border-border-hi">
                  <p className="text-xs font-semibold text-sub uppercase tracking-wider mb-2">Previous answer scored</p>
                  <div className="grid grid-cols-5 gap-2">
                    {[['Acc.',lastScores.accuracy,'#6366f1'],['Tech.',lastScores.technical,'#a78bfa'],
                      ['Comm.',lastScores.communication,'#06b6d4'],['Conf.',lastScores.confidence,'#f5a623'],
                      ['Overall',lastScores.overall,'#22c55e']].map(([l,v,c])=>(
                      <div key={l} className="text-center">
                        <p className="font-mono font-bold text-lg" style={{color:c}}>{v}</p>
                        <p className="text-xs text-muted leading-tight">{l}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controls */}
            <div className="flex gap-3">
              {!started ? (
                <motion.button whileHover={{scale:1.01}} whileTap={{scale:0.98}}
                  onClick={handleStart}
                  className="btn-gold flex-1 flex items-center justify-center gap-2 py-4 text-base animate-pulse-violet"
                  style={{ animationName: 'pulseV' }}>
                  <Play size={18}/> Start Answering
                </motion.button>
              ) : (
                <>
                  <button onClick={handleStop}
                    className="btn-ghost flex items-center justify-center gap-2 px-5 py-3.5">
                    <Square size={15}/> Stop
                  </button>
                  <motion.button whileHover={{scale:1.01}} whileTap={{scale:0.98}}
                    onClick={handleNext} disabled={submitting}
                    className="btn-violet flex-1 flex items-center justify-center gap-2 py-3.5">
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                    ) : isLast ? (
                      <><CheckCircle size={18}/> Finish Interview</>
                    ) : (
                      <><ChevronRight size={18}/> Next Question</>
                    )}
                  </motion.button>
                </>
              )}
            </div>
          </div>

          {/* ── Sidebar ────────────────────────────── */}
          <div className="flex flex-col gap-4">

            {/* Webcam — main visual element */}
            <div className="rounded-2xl overflow-hidden bg-black relative border border-border" style={{aspectRatio:'4/3'}}>
              {camReady ? (
                <>
                  <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover"/>
                  {/* Recording indicator */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-full">
                    <Video size={10} className="text-white"/>
                    <span className="text-white text-xs font-semibold">Live</span>
                    <span className={`w-2 h-2 rounded-full ${recording ? 'bg-danger rec-ring' : 'bg-sub'}`}/>
                  </div>
                  {recording && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-danger/20 backdrop-blur-sm border border-danger/30 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse"/>
                      <span className="text-danger text-xs font-semibold">Recording</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <VideoOff size={24} className="text-muted"/>
                  <p className="text-xs text-sub">Camera unavailable</p>
                  <p className="text-xs text-muted text-center px-4">Allow camera access in browser settings</p>
                </div>
              )}
            </div>

            {/* Question list */}
            <div className="glass rounded-2xl p-4">
              <h3 className="text-xs font-semibold text-sub uppercase tracking-wider mb-3">Questions</h3>
              <div className="space-y-1.5">
                {questions.map((q2, i) => {
                  const done = i < qIdx; const cur = i === qIdx
                  return (
                    <div key={i} className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-all text-xs
                      ${cur ? 'bg-violet/10 border border-violet/20' : done ? 'opacity-40' : 'opacity-30'}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 font-mono font-bold text-xs
                        ${done?'bg-success/20 text-success':cur?'bg-violet text-white':'bg-white/5 text-sub'}`}>
                        {done?'✓':i+1}
                      </div>
                      <span className="truncate text-dim">{q2.question.substring(0,44)}…</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Tips */}
            <div className="glass rounded-2xl p-4 border border-gold/10">
              <h3 className="text-xs font-semibold text-gold uppercase tracking-wider mb-3">💡 Tips</h3>
              <ul className="space-y-2 text-xs text-sub leading-relaxed">
                <li>• Use STAR: Situation → Task → Action → Result</li>
                <li>• Name specific tools, metrics, outcomes</li>
                <li>• Aim for 80+ words — detail scores higher</li>
                <li>• Avoid hedging phrases like "I think maybe"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
