import { useEffect, useState } from 'react'

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('in') // 'in' | 'out'

  useEffect(() => {
    const hold  = setTimeout(() => setPhase('out'), 900)
    const done  = setTimeout(() => onDone(), 1400)
    return () => { clearTimeout(hold); clearTimeout(done) }
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'var(--brown)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      animation: phase === 'out' ? 'splashOut 0.5s ease forwards' : 'none',
    }}>
      {/* Ripple rings */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width: 300, height: 300,
            borderRadius: '50%',
            border: '1.5px solid rgba(250,221,164,0.18)',
            transform: 'translate(-50%, -50%)',
            animation: `splashRipple 2s ease-out ${i * 0.55}s infinite`,
          }} />
        ))}
      </div>

      {/* Logo container */}
      <div style={{
        animation: 'splashLogoIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        opacity: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
      }}>
        {/* Logo pill */}
        <div style={{
          background: 'rgba(255,255,255,0.97)',
          borderRadius: 24,
          padding: '20px 36px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        }}>
          <img
            src="/logo.png"
            alt="التعاهد"
            style={{ height: 60, display: 'block', objectFit: 'contain' }}
          />
        </div>

        {/* Animated dots */}
        <div style={{ display: 'flex', gap: 8, animation: 'splashDotsIn 0.4s ease 0.5s forwards', opacity: 0 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 6, height: 6,
              borderRadius: '50%',
              background: 'rgba(250,221,164,0.7)',
              animation: `splashDotPulse 1s ease ${i * 0.18}s infinite`,
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}
