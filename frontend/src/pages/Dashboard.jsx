import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import Navbar from '../components/Navbar'
import { Plus, TrendingUp, Award, Clock, ChevronRight, BarChart3, User, Phone, Mail, FileText } from 'lucide-react'

const DOMAIN_PILL = {
  'Computer Science': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  'Finance':          'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  'Data Science':     'text-purple-400 bg-purple-400/10 border-purple-400/20',
  'Business':         'text-orange-400 bg-orange-400/10 border-orange-400/20',
  'Arts':             'text-pink-400 bg-pink-400/10 border-pink-400/20',
  'Marketing':        'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
}

function ScoreColor({ s }) {
  const c = s >= 80 ? 'text-success' : s >= 60 ? 'text-gold' : 'text-danger'
  return <span className={`font-mono font-bold text-xl ${c}`}>{s}<span className="text-xs text-sub">%</span></span>
}

function Skel() { return <div className="skeleton h-20 rounded-2xl"/> }

export default function Dashboard() {
  const { user }  = useAuth()
  const [hist, setHist] = useState([])
  const [load, setLoad] = useState(true)

  useEffect(() => {
    api.get('/interview/history').then(r => setHist(r.data)).catch(console.error).finally(() => setLoad(false))
  }, [])

  const done = hist.filter(i => i.status === 'completed')
  const avg  = done.length ? Math.round(done.reduce((s,i) => s + (i.overallScore||0), 0) / done.length) : 0
  const best = done.length ? Math.max(...done.map(i => i.overallScore||0)) : 0

  const STATS = [
    { label:'Total Sessions', val: hist.length,  icon: BarChart3, c:'text-violet' },
    { label:'Avg Score',      val: `${avg}%`,     icon: TrendingUp,c:'text-gold'   },
    { label:'Best Score',     val: `${best}%`,    icon: Award,     c:'text-success' },
    { label:'Completed',      val: done.length,   icon: Clock,     c:'text-cyan'   },
  ]

  return (
    <div className="min-h-screen bg-bg">
      <Navbar/>
      <div className="absolute inset-0 bg-hero-glow pointer-events-none opacity-50"/>

      <div className="max-w-6xl mx-auto px-6 pt-20 pb-16 relative z-10">

        {/* Profile card */}
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.5}}
          className="glass rounded-2xl p-6 mb-5 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet/30 to-indigo/30 border border-violet/20 flex items-center justify-center flex-shrink-0">
            <User size={26} className="text-violet"/>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-text">{user?.name}</h1>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-1.5">
              <span className="flex items-center gap-1.5 text-sm text-sub"><Mail size={12}/>{user?.email}</span>
              {user?.phone && <span className="flex items-center gap-1.5 text-sm text-sub"><Phone size={12}/>{user.phone}</span>}
              {user?.resumeUrl && <span className="flex items-center gap-1.5 text-sm text-success"><FileText size={12}/>Resume on file</span>}
            </div>
          </div>
          <Link to="/select-domain" className="btn-violet flex items-center gap-2 flex-shrink-0 self-start sm:self-auto">
            <Plus size={15}/> New Interview
          </Link>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {STATS.map(({ label, val, icon: Icon, c }, i) => (
            <motion.div key={label} initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
              className="glass rounded-2xl p-5">
              <div className="flex justify-between items-center mb-3">
                <p className="text-xs text-sub font-medium uppercase tracking-wide">{label}</p>
                <Icon size={14} className={c}/>
              </div>
              <p className={`text-2xl font-bold ${c}`}>{val}</p>
            </motion.div>
          ))}
        </div>

        {/* History */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-text">Interview History</h2>
            {hist.length > 0 && <span className="text-xs text-sub font-mono">{hist.length} session{hist.length!==1?'s':''}</span>}
          </div>

          {load ? (
            <div className="space-y-3">{[1,2,3].map(i=><Skel key={i}/>)}</div>
          ) : hist.length === 0 ? (
            <motion.div initial={{opacity:0}} animate={{opacity:1}}
              className="glass rounded-2xl py-20 text-center border-2 border-dashed border-border">
              <Clock size={28} className="text-muted mx-auto mb-3"/>
              <p className="font-semibold text-text mb-1">No interviews yet</p>
              <p className="text-sm text-sub mb-6">Start your first AI-powered mock interview</p>
              <Link to="/select-domain" className="btn-violet inline-flex items-center gap-2 text-sm">
                <Plus size={14}/> Start now
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {hist.map((item, i) => (
                <motion.div key={item._id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}>
                  <Link to={item.status==='completed' ? `/results/${item._id}` : `/interview/${item._id}`}
                    className="glass rounded-2xl p-5 flex items-center justify-between hover:glow-border-violet transition-all duration-200 group block">
                    <div className="flex items-center gap-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${DOMAIN_PILL[item.domain]||'text-sub bg-sub/10 border-sub/20'}`}>
                        {item.domain}
                      </span>
                      <div>
                        <p className="text-dim text-sm font-medium">
                          {new Date(item.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                        </p>
                        <div className="flex gap-1.5 mt-0.5 flex-wrap">
                          {(item.skillGaps||[]).slice(0,3).map(g=>(
                            <span key={g} className="text-xs text-muted font-mono">#{g}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <ScoreColor s={item.overallScore||0}/>
                        <p className={`text-xs mt-0.5 ${item.status==='completed'?'text-success':'text-gold'}`}>
                          {item.status==='completed'?'✓ Done':'⏳ In Progress'}
                        </p>
                      </div>
                      <ChevronRight size={15} className="text-muted group-hover:text-violet group-hover:translate-x-1 transition-all"/>
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
