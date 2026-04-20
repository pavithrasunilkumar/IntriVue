import { useRef, useState } from 'react'

const FILLERS = ['um','uh','like','you know','basically','literally','actually','i mean','sort of','kind of']

export function useSpeechAnalysis() {
  const [stats, setStats] = useState({ wpm:0, fillerCount:0, pauseCount:0, speechConfidence:70, spokenWords:0 })
  const startTime  = useRef(null)
  const pauseTimer = useRef(null)
  const pauseCount = useRef(0)

  const analyze = (transcript) => {
    if (!transcript || !startTime.current) return
    const words   = transcript.trim().split(/\s+/).filter(Boolean)
    const wc      = words.length
    const elapsed = (Date.now() - startTime.current) / 60000
    const wpm     = elapsed > 0 ? Math.round(wc / elapsed) : 0
    const fillerCount = words.filter(w => FILLERS.some(f => w.toLowerCase().includes(f))).length

    let conf = 70
    if (wpm>=110 && wpm<=160) conf+=15
    else if (wpm>=80 && wpm<110) conf+=5
    else if (wpm>160 && wpm<=200) conf+=5
    conf -= fillerCount*4; conf -= pauseCount.current*3
    conf = Math.max(20, Math.min(95, conf))
    setStats({ wpm, fillerCount, pauseCount: pauseCount.current, speechConfidence: conf, spokenWords: wc })
  }

  const onSpeechStart = () => { if (!startTime.current) startTime.current = Date.now(); clearTimeout(pauseTimer.current) }
  const onSpeechEnd   = () => { pauseTimer.current = setTimeout(() => { pauseCount.current++ }, 2000) }
  const reset = () => { startTime.current=null; pauseCount.current=0; setStats({ wpm:0,fillerCount:0,pauseCount:0,speechConfidence:70,spokenWords:0 }) }

  return { stats, analyze, onSpeechStart, onSpeechEnd, reset }
}
