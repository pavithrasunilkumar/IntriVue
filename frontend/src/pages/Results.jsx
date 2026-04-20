import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api, { AI_URL } from '../utils/api'
import Navbar from '../components/Navbar'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip
} from 'recharts'
import {
  CheckCircle2, AlertTriangle, RefreshCw, BarChart3,
  Download, ChevronRight, Trophy, Star, TrendingUp
} from 'lucide-react'

/* ── Animated score ring ──────────────────────────────── */
function ScoreRing({ score, label, color, delay = 0 }) {
  const r    = 32
  const circ = 2 * Math.PI * r
  const [val, setVal] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setVal(score), delay + 300)
    return () => clearTimeout(t)
  }, [score, delay])

  const grade = score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : score >= 55 ? 'Fair' : 'Needs Work'

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 76 76">
          <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5.5"/>
          <circle cx="38" cy="38" r={r} fill="none" stroke={color} strokeWidth="5.5"
            strokeDasharray={`${circ} ${circ}`}
            strokeDashoffset={circ - (val / 100) * circ}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)' }}/>
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-mono font-bold text-lg text-text">
          {score}
        </span>
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-dim">{label}</p>
        <p className="text-xs text-muted">{grade}</p>
      </div>
    </div>
  )
}

/* ── Dark recharts tooltip ───────────────────────────── */
function DarkTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl p-3 border border-border-hi text-xs shadow-glass">
      <p className="text-dim font-semibold mb-1.5">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-mono leading-5">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

/* ── Skeleton loader ──────────────────────────────────── */
function Skel({ h = 'h-28', cls = '' }) {
  return <div className={`skeleton rounded-2xl ${h} ${cls}`}/>
}

export default function Results() {
  const { id } = useParams()
  const [data,      setData]  = useState(null)
  const [loading,   setLoad]  = useState(true)
  const [dlLoading, setDl]    = useState(false)
  const [dlError,   setDlErr] = useState('')

  useEffect(() => {
    api.get(`/results/${id}`)
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoad(false))
  }, [id])

  /* ── Fixed PDF download ─────────────────────────── */
  const downloadReport = async () => {
    if (!data) return
    setDl(true); setDlErr('')
    try {
      const answered = (data.questions || []).filter(q => q.answer)
      const payload  = {
        candidate_name:       data.userId?.name || 'Candidate',
        domain:               data.domain,
        overall_score:        data.overallScore       || 0,
        accuracy_score:       data.accuracyScore      || 0,
        confidence_score:     data.confidenceScore    || 0,
        technical_score:      data.technicalScore     || 0,
        communication_score:  data.communicationScore || 0,
        strengths:  data.strengths  || [],
        weaknesses: data.weaknesses || [],
        skill_gaps: data.skillGaps  || [],
        questions:  answered.map(q => ({
          question: q.question,
          answer:   q.answer,
          scores:   q.scores || {}
        }))
      }

      // Call AI service directly — returns a blob
      const res = await fetch(`${AI_URL}/generate-report`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'PDF generation failed' }))
        throw new Error(err.error || 'PDF generation failed')
      }

      const blob     = await res.blob()
      const url      = URL.createObjectURL(blob)
      const a        = document.createElement('a')
      a.href         = url
      a.download     = `IntriVue_Report_${data.domain.replace(/\s/g, '_')}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('PDF error:', e)
      setDlErr(e.message || 'Download failed — ensure AI service is running on :8000')
    } finally { setDl(false) }
  }

  /* ── Skeleton ──────────────────────────────────── */
  if (loading) return (
    <div className="min-h-screen bg-bg">
      <Navbar/>
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 space-y-5">
        <Skel h="h-40"/>
        <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i=><Skel key={i} h="h-36"/>)}</div>
        <div className="grid grid-cols-2 gap-4">{[1,2].map(i=><Skel key={i} h="h-60"/>)}</div>
        <Skel h="h-44"/>
      </div>
    </div>
  )

  if (!data) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <p className="text-sub">Results not found.</p>
    </div>
  )

  const overall = data.overallScore || 0
  const grade   = overall >= 85 ? { label: 'Excellent', col: '#22c55e' }
    : overall >= 70 ? { label: 'Good',       col: '#f5a623' }
    : overall >= 55 ? { label: 'Fair',        col: '#f59e0b' }
    : { label: 'Needs Work', col: '#ef4444' }

  const rings = [
    { label: 'Accuracy',      value: data.accuracyScore      || 0, color: '#6366f1' },
    { label: 'Technical',     value: data.technicalScore     || 0, color: '#a78bfa' },
    { label: 'Communication', value: data.communicationScore || 0, color: '#06b6d4' },
    { label: 'Confidence',    value: data.confidenceScore    || 0, color: '#f5a623' },
  ]

  const radarData = rings.map(r => ({ metric: r.label, value: r.value }))

  const barData = (data.questions || []).filter(q => q.answer).map((q, i) => ({
    name:          `Q${i+1}`,
    Accuracy:      q.scores?.accuracy      || 0,
    Technical:     q.scores?.technical     || 0,
    Communication: q.scores?.communication || 0,
    Confidence:    q.scores?.confidence    || 0,
  }))

  const BAR_COLORS = ['#6366f1','#a78bfa','#06b6d4','#f5a623']

  return (
    <div className="min-h-screen bg-bg">
      <Navbar/>
      <div className="absolute inset-0 bg-hero-glow opacity-60 pointer-events-none"/>

      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 relative z-10">

        {/* ── Header ─────────────────────────────── */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs font-semibold text-success border border-success/20 mb-4">
            <CheckCircle2 size={12}/> Interview Complete
          </div>
          <h1 className="text-5xl font-bold text-text mb-2">Your Results</h1>
          <p className="text-sub">
            {data.domain} · {new Date(data.completedAt || data.createdAt).toLocaleDateString('en-US',
              { month:'long', day:'numeric', year:'numeric' })}
          </p>
        </motion.div>

        {/* ── Overall hero card ──────────────────── */}
        <motion.div initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}} transition={{delay:0.1}}
          className="glass rounded-3xl p-10 mb-6 text-center relative overflow-hidden border border-border-hi">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse 70% 80% at 50% 50%, ${grade.col}18 0%, transparent 70%)` }}/>
          <Trophy size={30} className="mx-auto mb-3" style={{ color: grade.col }}/>
          <p className="text-sub text-sm font-mono uppercase tracking-widest mb-2">Overall Performance Score</p>
          <div className="font-mono font-extrabold mb-3 leading-none"
            style={{ fontSize: 96, color: grade.col }}>
            {overall}
          </div>
          <span className="inline-block px-5 py-1.5 rounded-full text-sm font-bold"
            style={{ background: `${grade.col}22`, color: grade.col, border: `1px solid ${grade.col}44` }}>
            {grade.label}
          </span>
        </motion.div>

        {/* ── Score rings ─────────────────────────── */}
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.15}}
          className="glass rounded-2xl p-7 mb-5">
          <h2 className="text-xs font-semibold text-sub uppercase tracking-wider mb-6">Dimension Scores</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {rings.map(({ label, value, color }, i) => (
              <ScoreRing key={label} score={value} label={label} color={color} delay={i * 120}/>
            ))}
          </div>
        </motion.div>

        {/* ── Charts ──────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

          {/* Radar */}
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.2}}
            className="glass rounded-2xl p-6">
            <h3 className="text-xs font-semibold text-sub uppercase tracking-wider mb-4">Performance Radar</h3>
            <ResponsiveContainer width="100%" height={230}>
              <RadarChart data={radarData} margin={{top:10,right:24,bottom:10,left:24}}>
                <PolarGrid stroke="rgba(255,255,255,0.05)"/>
                <PolarAngleAxis dataKey="metric" tick={{ fontSize:11, fill:'#6b7280', fontFamily:'Inter' }}/>
                <Radar dataKey="value" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.2} strokeWidth={2}/>
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Bar */}
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.25}}
            className="glass rounded-2xl p-6">
            <h3 className="text-xs font-semibold text-sub uppercase tracking-wider mb-4">Per-Question Breakdown</h3>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={barData} barSize={7} barGap={1} barCategoryGap="28%">
                <XAxis dataKey="name" tick={{fontSize:11,fill:'#6b7280'}} axisLine={false} tickLine={false}/>
                <YAxis domain={[0,100]} tick={{fontSize:10,fill:'#6b7280'}} axisLine={false} tickLine={false}/>
                <Tooltip content={<DarkTip/>} cursor={{fill:'rgba(255,255,255,0.02)'}}/>
                {['Accuracy','Technical','Communication','Confidence'].map((k,i) => (
                  <Bar key={k} dataKey={k} fill={BAR_COLORS[i]} radius={[3,3,0,0]}/>
                ))}
              </BarChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {['Accuracy','Technical','Communication','Confidence'].map((k,i) => (
                <span key={k} className="flex items-center gap-1.5 text-xs text-sub">
                  <span className="w-3 h-2 rounded" style={{background:BAR_COLORS[i]}}/>{k}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Strengths & Weaknesses ─────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.3}}
            className="rounded-2xl p-6 border border-success/15 bg-success/5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-success mb-4">
              <CheckCircle2 size={15}/> Strengths
            </h3>
            {data.strengths?.length > 0 ? (
              <ul className="space-y-2.5">
                {data.strengths.map((s,i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-dim">
                    <Star size={12} className="text-success mt-0.5 flex-shrink-0"/>{s}
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-sub">Complete more sessions to surface patterns.</p>}
          </motion.div>

          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.35}}
            className="rounded-2xl p-6 border border-warn/15 bg-warn/5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-warn mb-4">
              <AlertTriangle size={15}/> Areas to Improve
            </h3>
            {data.weaknesses?.length > 0 ? (
              <ul className="space-y-2.5">
                {data.weaknesses.map((w,i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-dim">
                    <ChevronRight size={12} className="text-warn mt-0.5 flex-shrink-0"/>{w}
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-sub">No major weaknesses detected.</p>}
          </motion.div>
        </div>

        {/* ── Skill Gaps ─────────────────────────── */}
        {(data.skillGaps?.length > 0) && (
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.4}}
            className="glass rounded-2xl p-6 mb-5 border border-gold/10">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gold mb-3">
              <TrendingUp size={15}/> Skill Gap Analysis
            </h3>
            <p className="text-xs text-sub mb-3">Skills required by the JD not found in your resume:</p>
            <div className="flex flex-wrap gap-2">
              {data.skillGaps.map(g => (
                <span key={g} className="px-3 py-1 rounded-lg text-xs font-semibold bg-gold/10 text-gold border border-gold/20 capitalize">
                  {g}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Q&A Review ─────────────────────────── */}
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.45}} className="mb-8">
          <h3 className="text-xs font-semibold text-sub uppercase tracking-wider mb-4">Answer Review</h3>
          <div className="space-y-3">
            {(data.questions||[]).filter(q=>q.answer).map((q,i) => (
              <div key={i} className="glass rounded-2xl p-5">
                <div className="flex items-start gap-3 mb-3">
                  <span className="font-mono text-xs font-bold text-muted mt-0.5 flex-shrink-0">Q{i+1}</span>
                  <p className="text-dim text-sm font-medium leading-relaxed flex-1">{q.question}</p>
                  <div className="flex gap-3 flex-shrink-0">
                    {[['A',q.scores?.accuracy,'#6366f1'],['T',q.scores?.technical,'#a78bfa'],
                      ['C',q.scores?.communication,'#06b6d4'],['K',q.scores?.confidence,'#f5a623']].map(([l,v,c])=>(
                      <div key={l} className="text-center">
                        <p className="font-mono text-sm font-bold" style={{color:c}}>{v||'—'}</p>
                        <p className="text-muted" style={{fontSize:9}}>{l}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-sub text-sm leading-relaxed border-t border-border pt-3 pl-6">{q.answer}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Download error ─────────────────────── */}
        {dlError && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}}
            className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm text-center">
            ⚠️ {dlError}
          </motion.div>
        )}

        {/* ── Action buttons ─────────────────────── */}
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5}}
          className="flex flex-col sm:flex-row gap-3 justify-center">

          <button onClick={downloadReport} disabled={dlLoading}
            className="btn-gold flex items-center justify-center gap-2 px-8 py-3.5">
            {dlLoading
              ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/>Generating PDF…</>
              : <><Download size={16}/>Download PDF Report</>}
          </button>

          <Link to="/select-domain"
            className="btn-violet flex items-center justify-center gap-2 px-8 py-3.5">
            <RefreshCw size={16}/> Practice Again
          </Link>

          <Link to="/dashboard"
            className="btn-ghost flex items-center justify-center gap-2 px-8 py-3.5">
            <BarChart3 size={16}/> Dashboard
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
