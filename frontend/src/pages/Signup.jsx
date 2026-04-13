import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Zap, Upload, FileText, CheckCircle2, ArrowRight, X } from 'lucide-react'
import api from '../utils/api'

export default function Signup() {
  const { signup } = useAuth()
  const navigate   = useNavigate()
  const fileRef    = useRef()
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'' })
  const [file, setFile] = useState(null)
  const [showPass, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]    = useState('')
  const [drag, setDrag]      = useState(false)

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))
  const handleFile = (f) => { if (f?.type === 'application/pdf') setFile(f); else setError('PDF files only') }
  const onDrop = (e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]) }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      // Signup with multipart (resume optional)
      const formData = new FormData()
      Object.entries(form).forEach(([k,v]) => formData.append(k,v))
      if (file) formData.append('resume', file)
      const res = await api.post('/auth/signup', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      const { token, user } = res.data
      localStorage.setItem('intrivue_token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      navigate('/dashboard')
    } catch(err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Signup failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-mesh pointer-events-none"/>
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gold/5 rounded-full blur-3xl pointer-events-none"/>

      <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:0.5}}
        className="w-full max-w-lg relative z-10">

        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-glow">
            <Zap size={18} className="text-white"/>
          </div>
          <span className="text-2xl font-bold text-text tracking-tight">Intri<span className="text-gold">Vue</span></span>
        </div>

        <div className="glass rounded-2xl p-8 shadow-glass">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-text mb-1">Create your account</h1>
            <p className="text-muted text-sm">Get started with AI-powered interview prep</p>
          </div>

          {error && (
            <motion.div initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}}
              className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex items-center gap-2">
              <X size={14}/> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-dim mb-1.5">Full Name</label>
                <input type="text" required value={form.name} onChange={set('name')}
                  placeholder="Alex Johnson" className="input-dark"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dim mb-1.5">Phone Number</label>
                <input type="tel" value={form.phone} onChange={set('phone')}
                  placeholder="+91 98765 43210" className="input-dark"/>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dim mb-1.5">Email</label>
              <input type="email" required value={form.email} onChange={set('email')}
                placeholder="you@example.com" className="input-dark"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dim mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass?'text':'password'} required minLength={6} value={form.password} onChange={set('password')}
                  placeholder="Min. 6 characters" className="input-dark pr-12"/>
                <button type="button" onClick={()=>setShow(p=>!p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors">
                  {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            {/* Resume Upload */}
            <div>
              <label className="block text-sm font-medium text-text-dim mb-1.5">
                Resume <span className="text-muted font-normal">(PDF · optional)</span>
              </label>
              <div
                onDragOver={e=>{e.preventDefault();setDrag(true)}}
                onDragLeave={()=>setDrag(false)}
                onDrop={onDrop}
                onClick={()=>fileRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200
                  ${drag ? 'border-accent bg-accent/5' : file ? 'border-success/50 bg-success/5' : 'border-border hover:border-border-bright'}`}>
                <input ref={fileRef} type="file" accept=".pdf" className="hidden"
                  onChange={e=>handleFile(e.target.files[0])}/>
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <CheckCircle2 size={20} className="text-success"/>
                    <div className="text-left">
                      <p className="text-text text-sm font-medium">{file.name}</p>
                      <p className="text-muted text-xs">{(file.size/1024).toFixed(0)} KB</p>
                    </div>
                    <button type="button" onClick={e=>{e.stopPropagation();setFile(null)}}
                      className="ml-auto text-muted hover:text-danger transition-colors"><X size={14}/></button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload size={20} className="text-muted"/>
                    <p className="text-text-dim text-sm">Drop PDF here or <span className="text-accent">browse</span></p>
                  </div>
                )}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/><span>Creating account…</span></>
                : <><span>Create Account</span><ArrowRight size={15}/></>}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-muted text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-accent font-semibold hover:text-accent/80 transition-colors">Sign in →</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
