import React, { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../utils/api'
import Navbar from '../components/Navbar'
import { Upload, FileText, Briefcase, ArrowRight, CheckCircle2, X, Sparkles, AlertCircle } from 'lucide-react'

export default function ResumeUpload() {
  const location = useLocation()
  const domain   = location.state?.domain || 'Computer Science'
  const navigate = useNavigate()
  const fileRef  = useRef()

  const [file, setFile]       = useState(null)
  const [jobDesc, setJobDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [drag, setDrag]       = useState(false)
  const [step, setStep]       = useState('')

  const handleFile = (f) => {
    if (f?.type === 'application/pdf') { setFile(f); setError('') }
    else setError('Please upload a PDF file only.')
  }
  const onDrop = (e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file)            return setError('Please upload your resume PDF.')
    if (!jobDesc.trim())  return setError('Please paste the job description.')
    setError(''); setLoading(true); setStep('Extracting resume content…')

    try {
      const formData = new FormData()
      formData.append('resume', file)
      formData.append('domain', domain)
      formData.append('jobDescription', jobDesc)

      setStep('Analysing skills & generating questions…')
      const res = await api.post('/interview/setup', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 90000
      })
      setStep('Done! Entering interview room…')
      setTimeout(() => navigate(`/interview/${res.data.interviewId}`, { state: res.data }), 400)
    } catch (err) {
      setError(err.response?.data?.error || 'Setup failed — ensure the AI service is running on port 8000.')
      setLoading(false); setStep('')
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="absolute inset-0 bg-hero-mesh pointer-events-none" />

      <div className="max-w-2xl mx-auto px-6 pt-20 pb-16 relative z-10">
        {/* Step badge */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs font-medium text-gold border border-gold/20 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" /> Step 2 of 3
          </div>
          <h1 className="text-4xl font-bold text-text mb-2">Set up your interview</h1>
          <p className="text-muted">
            Domain:{' '}
            <span className="text-accent font-semibold">{domain}</span>
          </p>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex items-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" />{error}
          </motion.div>
        )}

        <motion.form onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="space-y-6">

          {/* ── Resume Upload ───────────────────────────────── */}
          <div className="glass rounded-2xl p-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-text mb-4">
              <FileText size={15} className="text-accent" /> Resume (PDF)
            </label>
            <div
              onDragOver={e => { e.preventDefault(); setDrag(true) }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
                ${drag  ? 'border-accent bg-accent/5'
                : file  ? 'border-success/50 bg-success/5'
                        : 'border-border hover:border-border-bright hover:bg-white/[0.02]'}`}>
              <input ref={fileRef} type="file" accept=".pdf" className="hidden"
                onChange={e => handleFile(e.target.files[0])} />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle2 size={24} className="text-success flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-text font-medium text-sm">{file.name}</p>
                    <p className="text-muted text-xs mt-0.5">{(file.size / 1024).toFixed(0)} KB · PDF</p>
                  </div>
                  <button type="button" onClick={e => { e.stopPropagation(); setFile(null) }}
                    className="ml-auto w-7 h-7 rounded-lg bg-danger/10 flex items-center justify-center text-danger hover:bg-danger/20 transition-colors">
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <Upload size={20} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-text-dim font-medium text-sm">
                      Drop your resume here or <span className="text-accent">browse</span>
                    </p>
                    <p className="text-muted text-xs mt-1">PDF only · Max 10 MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Job Description ─────────────────────────────── */}
          <div className="glass rounded-2xl p-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-text mb-4">
              <Briefcase size={15} className="text-gold" /> Job Description
            </label>
            <textarea
              value={jobDesc}
              onChange={e => setJobDesc(e.target.value)}
              placeholder="Paste the full job description here — required skills, responsibilities, qualifications, tech stack…&#10;&#10;The more detail you add, the more accurate your questions will be."
              rows={9}
              className="input-dark resize-none leading-relaxed text-sm"
            />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <span className="text-xs text-muted font-mono">
                {jobDesc.split(/\s+/).filter(Boolean).length} words
              </span>
              <span className="text-xs text-muted">
                {jobDesc.length < 200
                  ? '⚡ Add more detail for sharper questions'
                  : jobDesc.length < 500
                  ? '✓ Good — a bit more helps'
                  : '🎯 Excellent detail level'}
              </span>
            </div>
          </div>

          {/* ── Submit ──────────────────────────────────────── */}
          <button type="submit" disabled={loading}
            className="btn-gold w-full flex items-center justify-center gap-3 py-4 text-base">
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                <span>{step || 'Processing…'}</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Generate Interview Questions</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </motion.form>

        {/* AI processing hint */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="mt-4 p-4 glass rounded-xl text-sm text-muted text-center border border-gold/10">
            <span className="text-gold">✨</span> AI is reading your resume and crafting 8 personalised questions —
            this takes ~15–20 seconds
          </motion.div>
        )}
      </div>
    </div>
  )
}
