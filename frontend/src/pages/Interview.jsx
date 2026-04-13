import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../utils/api'
import Navbar from '../components/Navbar'
import {
  Camera, Mic, MicOff, Play, ChevronRight,
  CheckCircle, AlertTriangle, Square, Clock
} from 'lucide-react'

const QUESTION_TIME = 60  // 1 minute per question
const TOTAL_QUESTIONS = 8

const TYPE_META = {
  resume:    { label: 'Resume-Based',      color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/20' },
  job:       { label: 'Job Requirement',   color: 'text-accent',     bg: 'bg-accent/10',     border: 'border-accent/20'  },
  skill_gap: { label: 'Skill Gap',         color: 'text-gold',       bg: 'bg-gold/10',       border: 'border-gold/20'    },
}

/* ── Circular countdown timer ───────────────────────────── */
function TimerRing({ seconds, total }) {
  const r   = 22
  const circ = 2 * Math.PI * r
  const pct  = seconds / total
  const col  = seconds > 30 ? '#6366f1' : seconds > 15 ? '#f5a623' : '#ef4444'

  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <circle cx="26" cy="26" r={r} fill="none" stroke={col} strokeWidth="3"
          strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s linear, stroke 0.3s' }} />
      </svg>
      <span className="font-mono text-sm font-bold relative z-10" style={{ color: col }}>
        {String(Math.floor(seconds / 60)).padStart(2,'0')}:{String(seconds % 60).padStart(2,'0')}
      </span>
    </div>
  )
}

/* ── Progress bar ───────────────────────────────────────── */
function ProgressBar({ current, total }) {
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-muted mb-1.5 font-mono">
        <span>Question {current + 1} / {total}</span>
        <span>{Math.round((current / total) * 100)}% complete</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-accent to-gold rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(current / total) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }} />
      </div>
    </div>
  )
}

/* ── Timer bar (horizontal) at top of question card ─────── */
function TimerBar({ seconds, total }) {
  const pct = (seconds / total) * 100
  const col = seconds > 30 ? '#6366f1' : seconds > 15 ? '#f5a623' : '#ef4444'
  return (
    <div className="h-0.5 bg-white/5 rounded-full overflow-hidden w-full">
      <motion.div className="h-full rounded-full"
        style={{ backgroundColor: col, width: `${pct}%`, transition: 'width 1s linear, background-color 0.3s' }} />
    </div>
  )
}

export default function Interview() {
  const { id }          = useParams()
  const location        = useLocation()
  const navigate        = useNavigate()

  const [data, setData]         = useState(location.state || null)
  const [qIdx, setQIdx]         = useState(0)
  const [answer, setAnswer]     = useState('')
  const [timeLeft, setTime]     = useState(QUESTION_TIME)
  const [started, setStarted]   = useState(false)
  const [recording, setRec]     = useState(false)
  const [submitting, setSub]    = useState(false)
  const [lastScores, setScores] = useState(null)
  const [camOk, setCamOk]       = useState(false)
  const [faceWarn, setFaceWarn] = useState(false)

  const videoRef = useRef()
  const streamRef = useRef()
  const timerRef  = useRef()
  const recRef    = useRef()

  /* Load data if not from state */
  useEffect(() => {
    if (!data) api.get(`/interview/${id}`).then(r => setData(r.data)).catch(console.error)
  }, [id])

  /* Webcam */
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
        setCamOk(true)
      })
      .catch(() => setCamOk(false))
    return () => streamRef.current?.getTracks().forEach(t => t.stop())
  }, [])

  /* Timer */
  useEffect(() => {
    if (!started) return
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTime(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleNext(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [started, qIdx])

  /* Speech recognition */
  const startRec = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    const r = new SR()
    r.continuous = true
    r.interimResults = true
    r.onresult = e => {
      const t = Array.from(e.results).map(x => x[0].transcript).join(' ')
      setAnswer(t)
    }
    r.onerror = () => {}
    r.start()
    recRef.current = r
    setRec(true)
  }
  const stopRec = () => { recRef.current?.stop(); setRec(false) }

  /* Next / Submit */
  const handleNext = useCallback(async () => {
    if (submitting) return
    clearInterval(timerRef.current)
    stopRec()
    setSub(true)

    const questions = data?.questions || []
    try {
      const res = await api.post(`/interview/${id}/answer`, {
        questionIndex: qIdx,
        answerText: answer.trim() || '(No answer provided)'
      })
      setScores(res.data.scores)
    } catch {
      setScores({ accuracy: 50, technical: 50, communication: 50, confidence: 50, overall: 50 })
    }

    if (qIdx + 1 >= questions.length) {
      await api.post(`/interview/${id}/complete`).catch(() => {})
      streamRef.current?.getTracks().forEach(t => t.stop())
      navigate(`/results/${id}`)
      return
    }

    await new Promise(r => setTimeout(r, 800))  // brief pause to show score
    setQIdx(i => i + 1)
    setAnswer('')
    setTime(QUESTION_TIME)
    setStarted(false)
    setScores(null)
    setSub(false)
  }, [qIdx, answer, id, data, submitting, navigate])

  /* ── Early states ──────────────────────────────────────── */
  if (!data) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-muted text-sm font-mono">Loading interview…</p>
      </div>
    </div>
  )

  const questions = data.questions || []
  const q = questions[qIdx]
  const meta = TYPE_META[q?.type] || TYPE_META.job
  const isLast = qIdx + 1 >= questions.length

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pt-20 pb-10">

        {/* Progress */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4 mb-6">
          <ProgressBar current={qIdx} total={questions.length} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Main panel ──────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Question card */}
            <AnimatePresence mode="wait">
              <motion.div key={qIdx}
                initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3 }}
                className="glass rounded-2xl overflow-hidden">
                {started && <TimerBar seconds={timeLeft} total={QUESTION_TIME} />}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${meta.bg} ${meta.color} ${meta.border}`}>
                      {meta.label}
                    </span>
                    {started && <TimerRing seconds={timeLeft} total={QUESTION_TIME} />}
                    {!started && (
                      <span className="flex items-center gap-1.5 text-xs text-muted">
                        <Clock size={12} /> 60s to answer
                      </span>
                    )}
                  </div>
                  <p className="text-text text-lg font-medium leading-relaxed">{q?.question}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Answer panel */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-text">Your Answer</label>
                <div className="flex items-center gap-2">
                  {recording && (
                    <span className="flex items-center gap-1.5 text-xs text-danger">
                      <span className="w-2 h-2 rounded-full bg-danger animate-pulse" /> Recording
                    </span>
                  )}
                  <button onClick={recording ? stopRec : startRec}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                      ${recording
                        ? 'bg-danger/10 text-danger border-danger/20 hover:bg-danger/20'
                        : 'bg-white/5 text-muted border-border hover:border-border-bright hover:text-text'}`}>
                    {recording ? <><MicOff size={12} /> Stop voice</> : <><Mic size={12} /> Voice input</>}
                  </button>
                </div>
              </div>
              <textarea
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder={started
                  ? 'Type or speak your answer… Be specific, use examples, mention technologies or experiences.'
                  : 'Click "Start answering" below to begin the 60-second timer, then answer here.'}
                rows={7}
                disabled={!started}
                className="w-full bg-transparent border-none outline-none text-text-dim text-sm leading-relaxed resize-none placeholder:text-muted/40 disabled:opacity-50"
              />
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-border text-xs text-muted">
                <span className="font-mono">{answer.split(/\s+/).filter(Boolean).length} words</span>
                <span>Aim for 80+ words with a concrete example</span>
              </div>
            </div>

            {/* Score flash (after submitting prev Q) */}
            <AnimatePresence>
              {lastScores && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="glass rounded-xl p-4 border border-border-bright">
                  <p className="text-xs text-muted mb-2 font-semibold uppercase tracking-wide">Last answer scored</p>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      ['Accuracy',     lastScores.accuracy,      'text-blue-400'],
                      ['Technical',    lastScores.technical,     'text-purple-400'],
                      ['Communication',lastScores.communication, 'text-cyan-400'],
                      ['Confidence',   lastScores.confidence,    'text-gold'],
                      ['Overall',      lastScores.overall,       'text-success'],
                    ].map(([lbl, val, col]) => (
                      <div key={lbl} className="text-center">
                        <p className={`font-mono font-bold text-lg ${col}`}>{val}</p>
                        <p className="text-xs text-muted leading-tight">{lbl}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controls */}
            <div className="flex gap-3">
              {!started ? (
                <motion.button
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setStarted(true)}
                  className="btn-gold flex-1 flex items-center justify-center gap-2 py-4 text-base animate-pulse-gold">
                  <Play size={18} /> Start Answering
                </motion.button>
              ) : (
                <>
                  <button onClick={stopRec}
                    className="btn-ghost flex items-center justify-center gap-2 px-5">
                    <Square size={16} /> Stop
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    onClick={handleNext} disabled={submitting}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 py-3.5">
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : isLast ? (
                      <><CheckCircle size={18} /> Finish Interview</>
                    ) : (
                      <><ChevronRight size={18} /> Next Question</>
                    )}
                  </motion.button>
                </>
              )}
            </div>

            {/* Face warning */}
            <AnimatePresence>
              {faceWarn && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-warn/10 border border-warn/20 text-warn text-sm">
                  <AlertTriangle size={15} /> Keep your face visible in the camera
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Sidebar ─────────────────────────────────── */}
          <div className="space-y-4">

            {/* Webcam */}
            <div className="rounded-2xl overflow-hidden bg-black aspect-[4/3] relative border border-border">
              {camOk ? (
                <>
                  <video ref={videoRef} autoPlay muted playsInline
                    className="w-full h-full object-cover" />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-full">
                    <Camera size={10} className="text-white" />
                    <span className="text-white text-xs font-medium">Live</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <Camera size={24} className="text-muted" />
                  <p className="text-xs text-muted">Camera unavailable</p>
                </div>
              )}
            </div>

            {/* Question list */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Questions</h3>
              <div className="space-y-1.5">
                {questions.map((question, i) => {
                  const m = TYPE_META[question.type] || TYPE_META.job
                  const isDone    = i < qIdx
                  const isCurrent = i === qIdx
                  return (
                    <div key={i}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl text-xs transition-colors
                        ${isCurrent ? 'bg-accent/10 border border-accent/20' : isDone ? 'opacity-50' : 'opacity-40'}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 font-mono font-bold text-xs
                        ${isDone    ? 'bg-success/20 text-success'
                        : isCurrent ? 'bg-accent text-white'
                                    : 'bg-white/5 text-muted'}`}>
                        {isDone ? '✓' : i + 1}
                      </div>
                      <span className="truncate text-text-dim">{question.question.substring(0, 42)}…</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Tips */}
            <div className="glass rounded-2xl p-5 border border-gold/10">
              <h3 className="text-xs font-semibold text-gold uppercase tracking-wider mb-3">💡 Tips</h3>
              <ul className="space-y-2 text-xs text-muted leading-relaxed">
                <li>• Use the STAR method: Situation, Task, Action, Result</li>
                <li>• Name specific tools, technologies, or metrics</li>
                <li>• Speak clearly — voice input is active</li>
                <li>• 80+ words per answer scores higher</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
