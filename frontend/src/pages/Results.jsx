import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../utils/api'
import Navbar from '../components/Navbar'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts'
import {
  TrendingUp, AlertTriangle, CheckCircle2, RefreshCw,
  BarChart3, Download, ChevronRight, Trophy, Star
} from 'lucide-react'

/* ── Animated score ring ─────────────────────────────── */
function ScoreRing({ score, label, color, delay = 0 }) {
  const r    = 36
  const circ = 2 * Math.PI * r
  const [anim, setAnim] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setAnim(score), delay + 200)
    return () => clearTimeout(t)
  }, [score, delay])

  const offset = circ - (anim / 100) * circ
  const grade  = score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : score >= 55 ? 'Fair' : 'Needs Work'

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 84 84">
          <circle cx="42" cy="42" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
          <circle cx="42" cy="42" r={r} fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={`${circ} ${circ}`}
            strokeDashoffset={circ - (anim / 100) * circ}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)' }} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-mono font-bold text-lg text-text">{score}</span>
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-text-dim">{label}</p>
        <p className="text-xs text-muted">{grade}</p>
      </div>
    </div>
  )
}

/* ── Dark recharts tooltip ───────────────────────────── */
function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl p-3 border border-border-bright text-xs shadow-glass">
      <p className="text-text-dim font-semibold mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-mono">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

/* ── Skeleton loader ─────────────────────────────────── */
function Skeleton({ h = 'h-24', className = '' }) {
  return <div className={`skeleton rounded-2xl ${h} ${className}`} />
}

export default function Results() {
  const { id } = useParams()
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [downloading, setDown]  = useState(false)

  useEffect(() => {
    api.get(`/results/${id}`)
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const downloadReport = async () => {
    if (!data) return
    setDown(true)
    try {
      const answered = (data.questions || []).filter(q => q.answer)
      const res = await api.post(
        `${import.meta.env.VITE_AI_URL || 'http://localhost:8000'}/generate-report`,
        {
          candidate_name:    data.userId?.name || 'Candidate',
          domain:            data.domain,
          overall_score:     data.overallScore,
          accuracy_score:    data.accuracyScore,
          confidence_score:  data.confidenceScore,
          technical_score:   data.technicalScore,
          communication_score: data.communicationScore,
          strengths:         data.strengths  || [],
          weaknesses:        data.weaknesses || [],
          skill_gaps:        data.skillGaps  || [],
          questions:         answered.map(q => ({
            question: q.question,
            answer:   q.answer,
            scores:   q.scores
          }))
        },
        { responseType: 'blob' }
      )
      const url  = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href  = url
      link.download = `intrivue-report-${data.domain.replace(/\s/g,'-')}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch(e) {
      console.error('PDF error:', e)
      alert('PDF generation failed — ensure AI service is running.')
    } finally { setDown(false) }
  }

  /* ── Loading skeleton ───────────────────────────────── */
  if (loading) return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 space-y-5">
        <Skeleton h="h-32" />
        <div className="grid grid-cols-3 gap-4"><Skeleton /><Skeleton /><Skeleton /></div>
        <div className="grid grid-cols-2 gap-4"><Skeleton h="h-56" /><Skeleton h="h-56" /></div>
        <Skeleton h="h-40" />
      </div>
    </div>
  )

  if (!data) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <p className="text-muted">Results not found.</p>
    </div>
  )

  const overall = data.overallScore || 0
  const grade   = overall >= 85 ? { label: 'Excellent', color: '#22c55e' }
    : overall >= 70 ? { label: 'Good',       color: '#f5a623' }
    : overall >= 55 ? { label: 'Fair',        color: '#f59e0b' }
    : { label: 'Needs Work', color: '#ef4444' }

  const radarData = [
    { metric: 'Accuracy',      value: data.accuracyScore      || 0 },
    { metric: 'Technical',     value: data.technicalScore     || 0 },
    { metric: 'Communication', value: data.communicationScore || 0 },
    { metric: 'Confidence',    value: data.confidenceScore    || 0 },
  ]

  const barData = (data.questions || []).filter(q => q.answer).map((q, i) => ({
    name:          `Q${i + 1}`,
    Accuracy:      q.scores?.accuracy      || 0,
    Technical:     q.scores?.technical     || 0,
    Communication: q.scores?.communication || 0,
    Confidence:    q.scores?.confidence    || 0,
  }))

  const scoreRings = [
    { label: 'Accuracy',      value: data.accuracyScore      || 0, color: '#6366f1' },
    { label: 'Technical',     value: data.technicalScore     || 0, color: '#a78bfa' },
    { label: 'Communication', value: data.communicationScore || 0, color: '#22d3ee' },
    { label: 'Confidence',    value: data.confidenceScore    || 0, color: '#f5a623' },
  ]

  const barColors = ['#6366f1','#a78bfa','#22d3ee','#f5a623']

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="absolute inset-0 bg-hero-mesh pointer-events-none" />
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 relative z-10">

        {/* ── Header ─────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs font-medium text-success border border-success/20 mb-4">
            <CheckCircle2 size={12} /> Interview Complete
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-text mb-2">Your Results</h1>
          <p className="text-muted">
            {data.domain} ·{' '}
            {new Date(data.completedAt || data.createdAt).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric'
            })}
          </p>
        </motion.div>

        {/* ── Overall hero ───────────────────────────────── */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          className="glass rounded-3xl p-8 mb-6 text-center relative overflow-hidden border border-border-bright">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse 60% 80% at 50% 50%, ${grade.color}18 0%, transparent 70%)` }} />
          <Trophy size={28} className="mx-auto mb-3" style={{ color: grade.color }} />
          <p className="text-muted text-sm mb-2 font-mono uppercase tracking-wider">Overall Performance</p>
          <div className="font-mono font-bold mb-2"
            style={{ fontSize: 88, lineHeight: 1, color: grade.color }}>
            {overall}
          </div>
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-bold"
            style={{ background: `${grade.color}22`, color: grade.color }}>
            {grade.label}
          </span>
        </motion.div>

        {/* ── Score rings ─────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass rounded-2xl p-6 mb-5">
          <h2 className="text-sm font-semibold text-text-dim uppercase tracking-wider mb-5">Score Breakdown</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {scoreRings.map(({ label, value, color }, i) => (
              <ScoreRing key={label} score={value} label={label} color={color} delay={i * 150} />
            ))}
          </div>
        </motion.div>

        {/* ── Charts ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

          {/* Radar */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-text-dim uppercase tracking-wider mb-4">Performance Radar</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="metric"
                  tick={{ fontSize: 11, fill: '#6b7280', fontFamily: 'Inter' }} />
                <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.18} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Bar chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-text-dim uppercase tracking-wider mb-4">Per-Question Scores</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} barSize={6} barGap={1} barCategoryGap="30%">
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                {['Accuracy','Technical','Communication','Confidence'].map((key, i) => (
                  <Bar key={key} dataKey={key} fill={barColors[i]} radius={[3,3,0,0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {['Accuracy','Technical','Communication','Confidence'].map((k, i) => (
                <span key={k} className="flex items-center gap-1.5 text-xs text-muted">
                  <span className="w-3 h-2 rounded" style={{ background: barColors[i] }} />{k}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Strengths & Weaknesses ──────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="rounded-2xl p-6 border border-success/20 bg-success/5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-success mb-4">
              <CheckCircle2 size={15} /> Strengths
            </h3>
            {data.strengths?.length > 0 ? (
              <ul className="space-y-2">
                {data.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-dim">
                    <Star size={12} className="text-success mt-0.5 flex-shrink-0" />{s}
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-muted">Complete more sessions to surface patterns.</p>}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="rounded-2xl p-6 border border-warn/20 bg-warn/5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-warn mb-4">
              <AlertTriangle size={15} /> Areas to Improve
            </h3>
            {data.weaknesses?.length > 0 ? (
              <ul className="space-y-2">
                {data.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-dim">
                    <ChevronRight size={12} className="text-warn mt-0.5 flex-shrink-0" />{w}
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-muted">No significant weaknesses detected.</p>}
          </motion.div>
        </div>

        {/* ── Skill Gaps ──────────────────────────────────── */}
        {data.skillGaps?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6 mb-5 border border-gold/10">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gold mb-3">
              <TrendingUp size={15} /> Skill Gap Analysis
            </h3>
            <p className="text-xs text-muted mb-3">Skills required by the job not present in your resume:</p>
            <div className="flex flex-wrap gap-2">
              {data.skillGaps.map(g => (
                <span key={g} className="px-3 py-1 rounded-lg text-xs font-medium bg-gold/10 text-gold border border-gold/20 capitalize">
                  {g}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Q&A Review ──────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="mb-8">
          <h3 className="text-sm font-semibold text-text-dim uppercase tracking-wider mb-4">Answer Review</h3>
          <div className="space-y-3">
            {(data.questions || []).filter(q => q.answer).map((q, i) => {
              const m = { resume:'text-blue-400', job:'text-accent', skill_gap:'text-gold' }[q.type] || 'text-muted'
              return (
                <div key={i} className="glass rounded-2xl p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="font-mono text-xs font-bold text-muted mt-0.5 flex-shrink-0">Q{i+1}</span>
                    <p className="text-text-dim text-sm font-medium leading-relaxed flex-1">{q.question}</p>
                    <div className="flex gap-2 flex-shrink-0">
                      {[
                        ['A', q.scores?.accuracy,      '#6366f1'],
                        ['T', q.scores?.technical,     '#a78bfa'],
                        ['C', q.scores?.communication, '#22d3ee'],
                        ['K', q.scores?.confidence,    '#f5a623'],
                      ].map(([lbl, val, col]) => (
                        <div key={lbl} className="text-center">
                          <p className="font-mono text-xs font-bold" style={{ color: col }}>{val || '—'}</p>
                          <p className="text-xs text-muted" style={{ fontSize: 9 }}>{lbl}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-muted text-sm leading-relaxed border-t border-border pt-3 pl-6">
                    {q.answer}
                  </p>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* ── Actions ─────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={downloadReport} disabled={downloading}
            className="btn-gold flex items-center justify-center gap-2 px-8 py-3.5">
            {downloading
              ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/>
              : <Download size={16}/>}
            Download PDF Report
          </button>
          <Link to="/select-domain" className="btn-primary flex items-center justify-center gap-2 px-8 py-3.5">
            <RefreshCw size={16}/> Practice Again
          </Link>
          <Link to="/dashboard" className="btn-ghost flex items-center justify-center gap-2 px-8 py-3.5">
            <BarChart3 size={16}/> Dashboard
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
