import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Upload, CheckCircle2, X, ArrowRight, Sparkles } from 'lucide-react'

const GradText = ({ children }) => (
  <span
    style={{
      background: 'linear-gradient(90deg,#f5a623,#7c3aed)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    }}
  >
    {children}
  </span>
)

export default function Signup() {
  const navigate = useNavigate()
  const fileRef = useRef()

  const [form, set] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  })

  const [file, setFile] = useState(null)
  const [show, setShow] = useState(false)
  const [load, setLoad] = useState(false)
  const [err, setErr] = useState('')
  const [drag, setDrag] = useState(false)

  const upd = k => e => set(p => ({ ...p, [k]: e.target.value }))

  const handleFile = f => {
    if (f?.type === 'application/pdf') {
      setFile(f)
      setErr('')
    } else {
      setErr('PDF only')
    }
  }

  const onDrop = e => {
    e.preventDefault()
    setDrag(false)
    handleFile(e.dataTransfer.files[0])
  }

  const submit = async e => {
    e.preventDefault()
    setErr('')
    setLoad(true)

    try {
      const fd = new FormData()

      Object.entries(form).forEach(([k, v]) => fd.append(k, v))

      if (file) fd.append('resume', file)

      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/signup`,
        {
          method: 'POST',
          body: fd
        }
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Signup failed')
      }

      localStorage.setItem('intrivue_token', data.token)

      navigate('/dashboard')
    } catch (e) {
      setErr(e.message || 'Signup failed')
    } finally {
      setLoad(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex">
      {/* LEFT */}
      <div className="hidden lg:flex lg:w-[42%] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 grid-overlay" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 30% 40%, rgba(245,166,35,0.12) 0%, transparent 60%)'
          }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <img src="/logo.svg" alt="IntriVue" className="w-10 h-10" />
          <span className="text-xl font-bold text-text">
            Intri
            <span
              style={{
                background: 'linear-gradient(90deg,#7c3aed,#06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Vue
            </span>
          </span>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold text-text leading-tight mb-3">
            Land the role.
            <br />
            <GradText>Own the room.</GradText>
          </h1>

          <p className="text-sub text-sm mb-8 leading-relaxed max-w-xs">
            AI that reads your resume, maps the job, interviews you live — and
            tells you exactly where to improve.
          </p>

          {[
            'Free — no card needed',
            'Resume-aware questions',
            'Face + voice confidence',
            'Instant PDF report'
          ].map((p, i) => (
            <div key={i} className="flex items-center gap-3 mb-3">
              <span className="text-violet font-bold">→</span>
              <p className="text-dim text-sm">{p}</p>
            </div>
          ))}
        </div>

        <p className="relative z-10 text-muted text-xs">
          Join thousands of candidates who prep smarter
        </p>
      </div>

      {/* RIGHT */}
      <div
        className="flex-1 flex items-center justify-center px-6 py-10 relative"
        style={{ background: '#060608' }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 50% 40% at 50% 5%, rgba(124,58,237,0.12) 0%, transparent 60%)'
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="flex items-center gap-2 mb-7 lg:hidden">
            <img src="/logo.svg" className="w-9 h-9" alt="" />
            <span className="text-xl font-bold text-text">IntriVue</span>
          </div>

          <div className="glass rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-text mb-1">
              Create account
            </h2>

            <p className="text-sub text-sm mb-6">
              Start your AI-powered interview prep
            </p>

            {err && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex gap-2"
              >
                <X size={14} className="flex-shrink-0 mt-0.5" />
                {err}
              </motion.div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-dim uppercase tracking-wide mb-1.5">
                    Name
                  </label>

                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={upd('name')}
                    placeholder="Alex Johnson"
                    className="input-dark text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dim uppercase tracking-wide mb-1.5">
                    Phone
                  </label>

                  <input
                    type="tel"
                    value={form.phone}
                    onChange={upd('phone')}
                    placeholder="+91 98765 43210"
                    className="input-dark text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dim uppercase tracking-wide mb-1.5">
                  Email
                </label>

                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={upd('email')}
                  placeholder="you@example.com"
                  className="input-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dim uppercase tracking-wide mb-1.5">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={show ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={form.password}
                    onChange={upd('password')}
                    placeholder="Min. 6 characters"
                    className="input-dark pr-12"
                  />

                  <button
                    type="button"
                    onClick={() => setShow(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
                  >
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}