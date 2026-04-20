import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import { Code2, TrendingUp, Brain, Briefcase, Palette, Megaphone, ArrowRight, Check } from 'lucide-react'

const DOMAINS = [
  { id:'Computer Science', icon:Code2,     color:'#6366f1', glow:'rgba(99,102,241,0.2)',
    desc:'Software engineering, system design, algorithms, cloud & DevOps.',
    tags:['Python','React','AWS','System Design'] },
  { id:'Finance',          icon:TrendingUp,color:'#22c55e', glow:'rgba(34,197,94,0.2)',
    desc:'Investment banking, equity research, financial modeling & risk.',
    tags:['Excel','Bloomberg','DCF','Risk'] },
  { id:'Data Science',     icon:Brain,     color:'#a78bfa', glow:'rgba(167,139,250,0.2)',
    desc:'ML, statistical analysis, data visualization, AI pipelines.',
    tags:['Python','ML','SQL','Statistics'] },
  { id:'Business',         icon:Briefcase, color:'#f59e0b', glow:'rgba(245,158,11,0.2)',
    desc:'Strategy, business development, operations & management.',
    tags:['Strategy','CRM','OKRs','Leadership'] },
  { id:'Arts',             icon:Palette,   color:'#f472b6', glow:'rgba(244,114,182,0.2)',
    desc:'Design, visual communication, motion graphics & creative production.',
    tags:['Figma','Adobe CC','UI/UX','Branding'] },
  { id:'Marketing',        icon:Megaphone, color:'#06b6d4', glow:'rgba(6,182,212,0.2)',
    desc:'Digital marketing, SEO, growth hacking & brand strategy.',
    tags:['SEO','Google Ads','Analytics','Content'] },
]

export default function DomainSelect() {
  const [sel, setSel] = useState(null)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-bg">
      <Navbar/>
      <div className="absolute inset-0 bg-hero-glow opacity-60 pointer-events-none"/>

      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 relative z-10">

        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 glass-violet rounded-full text-xs font-semibold text-violet mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-violet animate-pulse"/> Step 1 of 3
          </div>
          <h1 className="text-4xl font-bold text-text mb-3">Choose your domain</h1>
          <p className="text-sub">Select the field matching the role you're preparing for</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {DOMAINS.map(({ id, icon: Icon, color, glow, desc, tags }, i) => (
            <motion.button key={id} onClick={() => setSel(id)}
              initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
              className={`text-left p-6 rounded-2xl border-2 transition-all duration-200 relative overflow-hidden group
                ${sel===id ? 'scale-[1.02]' : 'glass hover:scale-[1.01]'}`}
              style={sel===id
                ? { borderColor: color, background: glow, boxShadow: `0 0 30px ${glow}` }
                : { borderColor: 'rgba(255,255,255,0.07)' }}>

              {sel===id && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: color }}>
                  <Check size={10} className="text-white"/>
                </div>
              )}

              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ background: glow, border: `1px solid ${color}33` }}>
                <Icon size={20} style={{ color }}/>
              </div>
              <h3 className="font-semibold text-text mb-2">{id}</h3>
              <p className="text-sub text-sm leading-relaxed mb-4">{desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {tags.map(t => (
                  <span key={t} className="px-2 py-0.5 rounded-md text-xs font-medium"
                    style={sel===id
                      ? { background: glow, color, border: `1px solid ${color}33` }
                      : { background: 'rgba(255,255,255,0.05)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.07)' }}>
                    {t}
                  </span>
                ))}
              </div>
            </motion.button>
          ))}
        </div>

        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.4}} className="flex justify-center">
          <button onClick={() => sel && navigate('/setup', { state:{ domain: sel } })}
            disabled={!sel} className="btn-violet flex items-center gap-2 px-8 py-3.5 text-base">
            Continue to Setup <ArrowRight size={18}/>
          </button>
        </motion.div>
      </div>
    </div>
  )
}
