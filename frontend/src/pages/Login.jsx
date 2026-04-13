import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Zap, ArrowRight, Sparkles } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]       = useState({ email:'', password:'' })
  const [showPass, setShow]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await login(form.email, form.password); navigate('/dashboard') }
    catch(err) { setError(err.response?.data?.error || 'Invalid credentials') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-hero-mesh pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:0.5}}
        className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-glow">
            <Zap size={18} className="text-white"/>
          </div>
          <span className="text-2xl font-bold text-text tracking-tight">Intri<span className="text-gold">Vue</span></span>
        </div>

        <div className="glass rounded-2xl p-8 shadow-glass">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-text mb-1">Welcome back</h1>
            <p className="text-muted text-sm">Sign in to your account</p>
          </div>

          {error && (
            <motion.div initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}}
              className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-dim mb-1.5">Email</label>
              <input type="email" required value={form.email} onChange={set('email')}
                placeholder="you@example.com" className="input-dark"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dim mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass?'text':'password'} required value={form.password} onChange={set('password')}
                  placeholder="••••••••" className="input-dark pr-12"/>
                <button type="button" onClick={()=>setShow(p=>!p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors">
                  {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                : <><span>Sign in</span><ArrowRight size={15}/></>}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-muted text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-accent font-semibold hover:text-accent/80 transition-colors">
                Create one →
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted/50 mt-4">
          AI-powered interview prep platform
        </p>
      </motion.div>
    </div>
  )
}
