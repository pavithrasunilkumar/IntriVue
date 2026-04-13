import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import Navbar from '../components/Navbar'
import { Plus, TrendingUp, Award, Clock, ChevronRight, BarChart3, User, Phone, Mail, FileText } from 'lucide-react'

const domainColor = {
  'Computer Science': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  'Finance':          'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  'Data Science':     'text-purple-400 bg-purple-400/10 border-purple-400/20',
  'Business':         'text-orange-400 bg-orange-400/10 border-orange-400/20',
  'Arts':             'text-pink-400 bg-pink-400/10 border-pink-400/20',
  'Marketing':        'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
}

function SkeletonCard() {
  return <div className="skeleton h-20 rounded-2xl w-full"/>
}

function ScorePill({ score }) {
  const color = score >= 80 ? 'text-success' : score >= 60 ? 'text-gold' : 'text-danger'
  return <span className={`font-mono font-bold text-lg ${color}`}>{score}<span className="text-xs text-muted">%</span></span>
}

export default function Dashboard() {
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/interview/history').then(r => setHistory(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  const completed = history.filter(i => i.status === 'completed')
  const avgScore  = completed.length ? Math.round(completed.reduce((s,i) => s + (i.overallScore||0), 0) / completed.length) : 0
  const best      = completed.length ? Math.max(...completed.map(i => i.overallScore||0)) : 0

  const stats = [
    { label: 'Total Sessions', value: history.length, icon: BarChart3, color: 'text-accent' },
    { label: 'Avg Score',      value: `${avgScore}%`,  icon: TrendingUp, color: 'text-gold' },
    { label: 'Best Score',     value: `${best}%`,       icon: Award,      color: 'text-success' },
    { label: 'Completed',      value: completed.length, icon: Clock,      color: 'text-purple-400' },
  ]

  return (
    <div className="min-h-screen bg-bg">
      <Navbar/>
      <div className="max-w-6xl mx-auto px-6 pt-20 pb-16">

        {/* Profile card */}
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.5}}
          className="glass rounded-2xl p-6 mb-6 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center flex-shrink-0 border border-accent/30">
            <User size={28} className="text-accent"/>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-text">{user?.name}</h1>
            <div className="flex flex-wrap gap-4 mt-1.5">
              <span className="flex items-center gap-1.5 text-sm text-muted"><Mail size={12}/>{user?.email}</span>
              {user?.phone && <span className="flex items-center gap-1.5 text-sm text-muted"><Phone size={12}/>{user.phone}</span>}
              {user?.resumeUrl && <span className="flex items-center gap-1.5 text-sm text-success"><FileText size={12}/>Resume on file</span>}
            </div>
          </div>
          <Link to="/select-domain" className="btn-primary flex items-center gap-2 flex-shrink-0 self-start sm:self-auto">
            <Plus size={16}/> New Interview
          </Link>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color }, i) => (
            <motion.div key={label} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay: i*0.07}}
              className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted font-medium uppercase tracking-wide">{label}</span>
                <Icon size={16} className={color}/>
              </div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </motion.div>
          ))}
        </div>

        {/* History */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text">Interview History</h2>
            {history.length > 0 && <span className="text-xs text-muted font-mono">{history.length} session{history.length !== 1 ? 's' : ''}</span>}
          </div>

          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <SkeletonCard key={i}/>)}</div>
          ) : history.length === 0 ? (
            <motion.div initial={{opacity:0}} animate={{opacity:1}}
              className="glass rounded-2xl py-20 text-center border-2 border-dashed border-border">
              <Clock size={32} className="text-muted mx-auto mb-3"/>
              <p className="font-semibold text-text mb-1">No interviews yet</p>
              <p className="text-sm text-muted mb-6">Start your first AI-powered mock interview</p>
              <Link to="/select-domain" className="btn-primary inline-flex items-center gap-2">
                <Plus size={14}/> Start now
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {history.map((item, idx) => (
                <motion.div key={item._id}
                  initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay: idx*0.05}}>
                  <Link to={item.status === 'completed' ? `/results/${item._id}` : `/interview/${item._id}`}
                    className="glass rounded-2xl p-5 flex items-center justify-between hover:border-border-bright hover:bg-white/[0.02] transition-all duration-200 group block">
                    <div className="flex items-center gap-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${domainColor[item.domain] || 'text-muted bg-muted/10 border-muted/20'}`}>
                        {item.domain}
                      </span>
                      <div>
                        <p className="text-text-dim text-sm font-medium">
                          {new Date(item.createdAt).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
                        </p>
                        <div className="flex gap-1.5 mt-0.5 flex-wrap">
                          {(item.skillGaps||[]).slice(0,3).map(g => (
                            <span key={g} className="text-xs text-muted font-mono">#{g}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <ScorePill score={item.overallScore||0}/>
                        <p className={`text-xs mt-0.5 ${item.status==='completed' ? 'text-success' : 'text-gold'}`}>
                          {item.status === 'completed' ? '✓ Completed' : '⏳ In Progress'}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-muted group-hover:text-accent group-hover:translate-x-1 transition-all"/>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
