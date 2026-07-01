import { useState, useEffect } from 'react'

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('write') // write → zoom

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('zoom'), 2000)
    const t2 = setTimeout(() => onDone(),          2750)
    return () => [t1, t2].forEach(clearTimeout)
  }, [])

  const isZoom = phase === 'zoom'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#9B7654',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 28,
      transform: isZoom ? 'scale(3.5)' : 'scale(1)',
      opacity:   isZoom ? 0 : 1,
      transition: isZoom
        ? 'transform 0.75s cubic-bezier(0.4,0,1,1), opacity 0.6s ease'
        : 'none',
    }}>

      {/* Bismillah */}
      <div style={{
        fontFamily: 'Amiri, serif',
        fontSize: 'clamp(1.6rem, 7vw, 2.4rem)',
        color: '#ffffff',
        direction: 'rtl',
        lineHeight: 2,
        letterSpacing: 1,
        clipPath: 'inset(0 0 0 0)',
        animation: 'writeReveal 1.6s cubic-bezier(0.4,0,0.2,1) 0.2s both',
        textShadow: '0 0 40px rgba(255,255,255,0.3), 0 2px 8px rgba(0,0,0,0.2)',
        whiteSpace: 'nowrap',
      }}>
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </div>

      {/* Underline that draws in sync */}
      <div style={{
        height: 1,
        width: '70%',
        maxWidth: 320,
        background: 'linear-gradient(to left, rgba(255,255,255,0.6), transparent)',
        animation: 'writeReveal 1.6s cubic-bezier(0.4,0,0.2,1) 0.2s both',
        alignSelf: 'center',
      }} />

    </div>
  )
}
