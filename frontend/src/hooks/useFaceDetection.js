import { useEffect, useRef, useState } from 'react'

export function useFaceDetection(videoRef, enabled) {
  const [faceData, setFaceData] = useState({
    faceDetected: false, expressions: {}, dominantExpression: 'neutral',
    expressionConfidence: 0, lookingAway: false, multipleFaces: false,
  })
  const intervalRef = useRef()

  useEffect(() => {
    if (!enabled) return
    let mounted = true

    const run = async () => {
      try {
        const faceapi = await import('face-api.js')
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model'
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ])
        if (!mounted) return

        intervalRef.current = setInterval(async () => {
          const video = videoRef.current
          if (!video || !mounted) return
          try {
            const dets = await faceapi
              .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224 }))
              .withFaceExpressions()
            if (!dets.length) { setFaceData(p => ({ ...p, faceDetected: false, lookingAway: true })); return }
            const d = dets[0]
            const expr = d.expressions
            const dom = Object.entries(expr).sort((a,b) => b[1]-a[1])[0]
            const videoW = video.videoWidth || 640
            const cx = d.detection.box.x + d.detection.box.width / 2
            setFaceData({
              faceDetected: true, expressions: expr,
              dominantExpression: dom[0], expressionConfidence: Math.round(dom[1]*100),
              lookingAway: cx < videoW*0.15 || cx > videoW*0.85,
              multipleFaces: dets.length > 1,
            })
          } catch {}
        }, 1500)
      } catch(e) { console.warn('face-api not available:', e.message) }
    }

    run()
    return () => { mounted = false; clearInterval(intervalRef.current) }
  }, [enabled])

  return faceData
}
