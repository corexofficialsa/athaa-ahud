import { useState, useEffect } from 'react'

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('idle') // idle → open → zoom → done

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('open'),  350)
    const t2 = setTimeout(() => setPhase('zoom'),  1150)
    const t3 = setTimeout(() => onDone(),           1900)
    return () => [t1, t2, t3].forEach(clearTimeout)
  }, [])

  const isOpen = phase === 'open' || phase === 'zoom'
  const isZoom = phase === 'zoom'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#2a1808',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {/* Radial glow behind book */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, rgba(155,118,84,0.4) 0%, transparent 60%)',
        opacity: isZoom ? 0 : 1,
        transition: 'opacity 0.6s ease',
      }} />

      {/* Whole scene — zooms in on open */}
      <div style={{
        perspective: 900,
        transform: isZoom ? 'scale(4.5)' : 'scale(1)',
        opacity:    isZoom ? 0 : 1,
        transition: isZoom
          ? 'transform 0.75s cubic-bezier(0.4,0,1,1), opacity 0.55s ease 0.1s'
          : 'none',
        willChange: 'transform, opacity',
      }}>
        <div style={{
          position: 'relative', width: 280, height: 350,
          animation: 'bookAppear 0.4s cubic-bezier(0.34,1.4,0.64,1) forwards',
        }}>

          {/* Inner pages — revealed when covers open */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, #f8f1e4 0%, #ede3cc 100%)',
            borderRadius: 4,
            overflow: 'hidden',
          }}>
            {/* Ruled lines */}
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} style={{
                position: 'absolute', left: 18, right: 18,
                top: 30 + i * 19, height: 1,
                background: 'rgba(155,118,84,0.13)',
              }} />
            ))}
            {/* Center binding shadow */}
            <div style={{
              position: 'absolute', top: 0, bottom: 0, left: '50%',
              width: 18, marginLeft: -9,
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.18) 0%, transparent 80%)',
            }} />
            {/* Arabic bismillah faint watermark */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none',
            }}>
              <p style={{
                fontFamily: 'Amiri, serif',
                fontSize: '1.1rem',
                color: 'rgba(155,118,84,0.2)',
                direction: 'rtl',
                letterSpacing: 2,
                userSelect: 'none',
              }}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
            </div>
          </div>

          {/* LEFT COVER */}
          <div style={{
            position: 'absolute', left: 0, top: 0,
            width: '50%', height: '100%',
            transformOrigin: 'right center',
            transform: isOpen ? 'rotateY(-165deg)' : 'rotateY(0deg)',
            transition: 'transform 0.72s cubic-bezier(0.65,0,0.35,1)',
            transformStyle: 'preserve-3d',
            zIndex: 2,
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(150deg, #b08858 0%, #9B7654 45%, #7a5230 100%)',
              borderRadius: '10px 0 0 10px',
              boxShadow: 'inset -3px 0 10px rgba(0,0,0,0.4)',
            }}>
              <div style={{ position: 'absolute', inset: 10, border: '1px solid rgba(250,221,164,0.28)', borderRadius: 6 }} />
              <div style={{ position: 'absolute', top: 14, left: 14, width: 16, height: 16, borderTop: '2px solid rgba(250,221,164,0.45)', borderLeft: '2px solid rgba(250,221,164,0.45)', borderRadius: '3px 0 0 0' }} />
              <div style={{ position: 'absolute', bottom: 14, left: 14, width: 16, height: 16, borderBottom: '2px solid rgba(250,221,164,0.45)', borderLeft: '2px solid rgba(250,221,164,0.45)', borderRadius: '0 0 0 3px' }} />
            </div>
          </div>

          {/* RIGHT COVER */}
          <div style={{
            position: 'absolute', right: 0, top: 0,
            width: '50%', height: '100%',
            transformOrigin: 'left center',
            transform: isOpen ? 'rotateY(165deg)' : 'rotateY(0deg)',
            transition: 'transform 0.72s cubic-bezier(0.65,0,0.35,1)',
            transformStyle: 'preserve-3d',
            zIndex: 2,
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(150deg, #9B7654 0%, #7a5230 55%, #5c3d1e 100%)',
              borderRadius: '0 10px 10px 0',
              boxShadow: 'inset 3px 0 10px rgba(0,0,0,0.4)',
            }}>
              <div style={{ position: 'absolute', inset: 10, border: '1px solid rgba(250,221,164,0.22)', borderRadius: 6 }} />
              <div style={{ position: 'absolute', top: 14, right: 14, width: 16, height: 16, borderTop: '2px solid rgba(250,221,164,0.38)', borderRight: '2px solid rgba(250,221,164,0.38)', borderRadius: '0 3px 0 0' }} />
              <div style={{ position: 'absolute', bottom: 14, right: 14, width: 16, height: 16, borderBottom: '2px solid rgba(250,221,164,0.38)', borderRight: '2px solid rgba(250,221,164,0.38)', borderRadius: '0 0 3px 0' }} />
            </div>
          </div>

          {/* SPINE */}
          <div style={{
            position: 'absolute', left: '50%', top: 0, bottom: 0,
            width: 10, marginLeft: -5,
            background: 'linear-gradient(90deg, #3a2208, #1e0e04, #3a2208)',
            zIndex: 5,
            boxShadow: '0 0 10px rgba(0,0,0,0.7)',
          }} />

          {/* LOGO — on closed cover, fades as book opens */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 6,
            opacity: isOpen ? 0 : 1,
            transform: isOpen ? 'scale(0.88)' : 'scale(1)',
            transition: 'opacity 0.25s ease, transform 0.25s ease',
            pointerEvents: 'none',
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.97)',
              borderRadius: 14,
              padding: '14px 22px',
              boxShadow: '0 10px 36px rgba(0,0,0,0.4)',
            }}>
              <img src="/logo.png" alt="التعاهد" style={{ width: 170, display: 'block' }} />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
