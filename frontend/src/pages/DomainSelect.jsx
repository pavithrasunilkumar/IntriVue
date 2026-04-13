import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import { Code2, TrendingUp, Brain, Briefcase, Palette, Megaphone, ArrowRight, Check } from 'lucide-react'

const domains = [
  { id:'Computer Science', icon:Code2,      color:'text-blue-400',   bg:'bg-blue-400/10',   border:'border-blue-400/20',
    desc:'Software engineering, algorithms, system design, cloud & DevOps.',
    tags:['Python','React','System Design','AWS'] },
  { id:'Finance',          icon:TrendingUp,  color:'text-emerald-400', bg:'bg-emerald-400/10', border:'border-emerald-400/20',
    desc:'Investment banking, equity research, financial modeling & risk.',
    tags:['Excel','Bloomberg','DCF','Risk'] },
  { id:'Data Science',     icon:Brain,       color:'text-purple-400', bg:'bg-purple-400/10', border:'border-purple-400/20',
    desc:'ML, statistical analysis, data visualization, AI pipelines.',
    tags:['Python','ML','SQL','Statistics'] },
  { id:'Business',         icon:Briefcase,   color:'text-orange-400', bg:'bg-orange-400/10', border:'border-orange-400/20',
    desc:'Strategy, business development, operations & management.',
    tags:['Strategy','CRM','OKRs','Leadership'] },
  { id:'Arts',             icon:Palette,     color:'text-pink-400',   bg:'bg-pink-400/10',   border:'border-pink-400/20',
    desc:'Design, visual communication, motion graphics & creative production.',
    tags:['Figma','Adobe CC','UI/UX','Branding'] },
  { id:'Marketing',        icon:Megaphone,   color:'text-cyan-400',   bg:'bg-cyan-400/10',   border:'border-cyan-400/20',
    desc:'Digital marketing, SEO, growth, campaigns & brand strategy.',
    tags:['SEO','Google Ads','Analytics','Content'] },
]

export default function DomainSelect() {
  const [selected, setSelected] = useState(null)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-bg">
      <Navbar/>
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16">

        <div className="absolute inset-0 bg-hero-mesh pointer-events-none"/>

        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} className="text-center mb-10 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs font-medium text-gold border border-gold/20 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse"/> Step 1 of 3
          </div>
          <h1 className="text-4xl font-bold text-text mb-3">Choose your domain</h1>
          <p className="text-muted text-base">Select the field matching the role you're preparing for</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 relative z-10">
          {domains.map(({ id, icon:Icon, color, bg, border, desc, tags }, i) => (
            <motion.button key={id} onClick={() => setSelected(id)}
              initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay: i*0.06}}
              className={`text-left p-6 rounded-2xl border-2 transition-all duration-200 relative overflow-hidden group
                ${selected === id
                  ? `border-current ${color} bg-white/[0.06] shadow-glow scale-[1.02]`
                  : `border-border glass hover:border-border-bright hover:bg-white/[0.03]`}`}>

              {selected === id && (
                <div className="absolute top-3 right-3">
                  <div className={`w-5 h-5 rounded-full ${bg} ${border} border flex items-center justify-center`}>
                    <Check size={10} className={color}/>
                  </div>
                </div>
              )}

              <div className={`w-10 h-10 rounded-xl ${bg} border ${border} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                <Icon size={18} className={color}/>
              </div>
              <h3 className="font-semibold text-text mb-2 text-base">{id}</h3>
              <p className="text-muted text-sm leading-relaxed mb-4">{desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {tags.map(t => (
                  <span key={t} className={`px-2 py-0.5 rounded-md text-xs font-medium ${selected===id ? `${bg} ${color} border ${border}` : 'bg-white/5 text-muted border border-border'}`}>{t}</span>
                ))}
              </div>
            </motion.button>
          ))}
        </div>

        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.4}} className="flex justify-center relative z-10">
          <button onClick={() => selected && navigate('/setup', { state:{ domain: selected } })}
            disabled={!selected}
            className="btn-primary flex items-center gap-2 px-8 py-3.5 text-base">
            Continue to Setup <ArrowRight size={18}/>
          </button>
        </motion.div>
      </div>
    </div>
  )
}
