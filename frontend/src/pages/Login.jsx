import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'

const GradText = ({ children, from='#7c3aed', to='#06b6d4' }) => (
  <span style={{ background:`linear-gradient(90deg,${from},${to})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
    {children}
  </span>
)

const BULLETS = [
  'AI reads your resume + job description',
  'Generates 7 hyper-relevant questions',
  'Facial expression & speech analysis',
  'PDF scorecard you can download',
]

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, set]   = useState({ email:'', password:'' })
  const [show, setShow]   = useState(false)
  const [load, setLoad]   = useState(false)
  const [err,  setErr]    = useState('')

  const upd = k => e => set(p => ({ ...p, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault(); setErr(''); setLoad(true)
    try { await login(form.email, form.password); navigate('/dashboard') }
    catch(e) { setErr(e.response?.data?.error || 'Invalid credentials') }
    finally { setLoad(false) }
  }

  return (
    <div className="min-h-screen bg-bg flex">

      {/* LEFT — slim branding */}
      <div className="hidden lg:flex lg:w-[48%] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 grid-overlay"/>
        <div className="absolute inset-0" style={{background:'radial-gradient(ellipse 80% 70% at 40% 30%, rgba(124,58,237,0.22) 0%, transparent 65%)'}}/>
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-cyan/8 blur-3xl"/>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <img src="/logo.svg" alt="IntriVue" className="w-10 h-10"/>
          <div>
            <p className="text-xl font-bold text-text">Intri<GradText>Vue</GradText></p>
            <p className="text-xs text-sub">AI Interview Intelligence</p>
          </div>
        </div>

        {/* Hero */}
        <div className="relative z-10">
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.6}}>
            <p className="text-xs font-semibold text-violet uppercase tracking-widest mb-3">Interview smarter</p>
            <h1 className="text-4xl font-extrabold text-text leading-[1.1] mb-4">
              Know exactly<br/><GradText>where you stand.</GradText>
            </h1>
            <p className="text-sub text-sm leading-relaxed mb-8 max-w-xs">
              Upload resume. Drop the JD. Get a real AI interview with facial + speech analysis — and a scorecard that tells you what to fix.
            </p>
          </motion.div>
          <div className="space-y-3">
            {BULLETS.map((t,i) => (
              <motion.div key={i} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:.25+i*.07}}
                className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-violet to-cyan flex-shrink-0"/>
                <p className="text-dim text-sm">{t}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-muted text-xs">Free · No card · No limits</p>
      </div>

      {/* RIGHT — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative" style={{background:'#060608'}}>
        <div className="absolute inset-0" style={{background:'radial-gradient(ellipse 60% 50% at 50% 10%, rgba(124,58,237,0.15) 0%, transparent 60%)'}}/>
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.5}}
          className="w-full max-w-md relative z-10">

          <div className="flex items-center gap-2 mb-7 lg:hidden">
            <img src="/logo.svg" alt="IntriVue" className="w-9 h-9"/>
            <span className="text-xl font-bold text-text">Intri<GradText>Vue</GradText></span>
          </div>

          <div className="glass rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-text mb-1">Sign in</h2>
            <p className="text-sub text-sm mb-6">Welcome back — continue your prep</p>

            {err && (
              <motion.div initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}}
                className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">{err}</motion.div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-dim uppercase tracking-wide mb-1.5">Email</label>
                <input type="email" required value={form.email} onChange={upd('email')}
                  placeholder="you@example.com" className="input-dark"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-dim uppercase tracking-wide mb-1.5">Password</label>
                <div className="relative">
                  <input type={show?'text':'password'} required value={form.password} onChange={upd('password')}
                    placeholder="••••••••" className="input-dark pr-12"/>
                  <button type="button" onClick={()=>setShow(p=>!p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors">
                    {show?<EyeOff size={15}/>:<Eye size={15}/>}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={load} className="btn-violet w-full flex items-center justify-center gap-2 mt-2">
                {load?<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                    :<><span>Sign in</span><ArrowRight size={15}/></>}
              </button>
            </form>

            <div className="mt-5 pt-5 border-t border-border text-center">
              <p className="text-sub text-sm">
                No account?{' '}
                <Link to="/signup" className="font-semibold" style={{color:'#7c3aed'}}>Create one →</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
