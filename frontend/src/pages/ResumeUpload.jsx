import React, { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../utils/api'
import Navbar from '../components/Navbar'
import { Upload, FileText, Briefcase, ArrowRight, CheckCircle2, X, Sparkles, AlertCircle } from 'lucide-react'

const STEPS = ['Extracting resume text…', 'Analysing skills & job description…', 'Generating 7 personalised questions…', 'Setting up interview room…']

export default function ResumeUpload() {
  const { state }    = useLocation()
  const domain       = state?.domain || 'Computer Science'
  const navigate     = useNavigate()
  const fileRef      = useRef()

  const [file, setFile]       = useState(null)
  const [jd,   setJD]         = useState('')
  const [load, setLoad]       = useState(false)
  const [step, setStep]       = useState(0)
  const [err,  setErr]        = useState('')
  const [drag, setDrag]       = useState(false)

  const handleFile = f => { if (f?.type==='application/pdf') { setFile(f); setErr('') } else setErr('PDF only') }
  const onDrop     = e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]) }

  const submit = async e => {
    e.preventDefault()
    if (!file) return setErr('Please upload your resume PDF.')
    if (!jd.trim()) return setErr('Please paste the job description.')
    setErr(''); setLoad(true); setStep(0)

    const tick = () => setStep(s => Math.min(s+1, STEPS.length-1))
    const t1 = setTimeout(tick, 3000)
    const t2 = setTimeout(tick, 7000)
    const t3 = setTimeout(tick, 12000)

    try {
      const fd = new FormData()
      fd.append('resume', file); fd.append('domain', domain); fd.append('jobDescription', jd)
      const r = await api.post('/interview/setup', fd, { headers:{'Content-Type':'multipart/form-data'}, timeout:120000 })
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3)
      navigate(`/interview/${r.data.interviewId}`, { state: r.data })
    } catch(e) {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3)
      setErr(e.response?.data?.error || 'Setup failed — ensure AI service is running on :8000')
      setLoad(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar/>
      <div className="absolute inset-0 bg-hero-glow opacity-50 pointer-events-none"/>

      <div className="max-w-2xl mx-auto px-6 pt-20 pb-16 relative z-10">

        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 glass-violet rounded-full text-xs font-semibold text-violet mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-violet animate-pulse"/> Step 2 of 3
          </div>
          <h1 className="text-4xl font-bold text-text mb-2">Set up your interview</h1>
          <p className="text-sub">Domain: <span className="text-violet font-semibold">{domain}</span></p>
        </motion.div>

        {err && (
          <motion.div initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}}
            className="mb-5 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex gap-2">
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5"/>{err}
          </motion.div>
        )}

        <motion.form onSubmit={submit} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
          className="space-y-5">

          {/* Resume Upload */}
          <div className="glass rounded-2xl p-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-text mb-4">
              <FileText size={14} className="text-violet"/> Resume (PDF)
            </label>
            <div
              onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={onDrop}
              onClick={()=>fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
                ${drag?'border-violet bg-violet/5':file?'border-success/50 bg-success/5':'border-border hover:border-border-hi hover:bg-white/[0.02]'}`}>
              <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={e=>handleFile(e.target.files[0])}/>
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle2 size={22} className="text-success"/>
                  <div className="text-left">
                    <p className="text-text font-medium text-sm">{file.name}</p>
                    <p className="text-sub text-xs mt-0.5">{(file.size/1024).toFixed(0)} KB</p>
                  </div>
                  <button type="button" onClick={e=>{e.stopPropagation();setFile(null)}}
                    className="ml-auto w-7 h-7 rounded-lg bg-danger/10 flex items-center justify-center text-danger hover:bg-danger/20 transition-colors">
                    <X size={13}/>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-violet/10 border border-violet/20 flex items-center justify-center">
                    <Upload size={20} className="text-violet"/>
                  </div>
                  <p className="text-dim text-sm">Drop your resume or <span className="text-violet">browse</span></p>
                  <p className="text-muted text-xs">PDF only · Max 10 MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Job Description */}
          <div className="glass rounded-2xl p-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-text mb-4">
              <Briefcase size={14} className="text-gold"/> Job Description
            </label>
            <textarea value={jd} onChange={e=>setJD(e.target.value)}
              placeholder={"Paste the full job description here — required skills, responsibilities, qualifications, tech stack…\n\nMore detail = sharper questions."}
              rows={9} className="input-dark resize-none text-sm leading-relaxed"/>
            <div className="flex justify-between mt-3 pt-3 border-t border-border text-xs text-sub">
              <span className="font-mono">{jd.split(/\s+/).filter(Boolean).length} words</span>
              <span>{jd.length < 200 ? '⚡ Add more detail' : jd.length < 500 ? '✓ Good amount' : '🎯 Excellent'}</span>
            </div>
          </div>

          <button type="submit" disabled={load} className="btn-gold w-full flex items-center justify-center gap-3 py-4 text-base">
            {load ? (
              <><div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"/>
              <span>{STEPS[step]}</span></>
            ) : (
              <><Sparkles size={18}/><span>Generate Interview Questions</span><ArrowRight size={18}/></>
            )}
          </button>
        </motion.form>

        {load && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5}}
            className="mt-4 glass rounded-xl p-4 text-center text-sm text-sub border border-gold/10">
            <span className="text-gold">✨</span> AI is reading your resume and crafting 7 personalised questions — ~15–25 seconds
          </motion.div>
        )}
      </div>
    </div>
  )
}
