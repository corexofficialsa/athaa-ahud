import { useState, useEffect } from 'react'

export default function SplashScreen({ onDone }) {
  const [open, setOpen] = useState(false)
  const [fade, setFade] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setOpen(true),  550)
    const t2 = setTimeout(() => setFade(true),  1350)
    const t3 = setTimeout(() => onDone(),        1850)
    return () => [t1, t2, t3].forEach(clearTimeout)
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#3d2610',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: fade ? 0 : 1,
      transition: 'opacity 0.5s ease',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, rgba(155,118,84,0.35) 0%, transparent 65%)',
      }} />

      {/* 3D scene */}
      <div style={{ perspective: 1000, perspectiveOrigin: '50% 50%' }}>
        <div style={{
          position: 'relative', width: 280, height: 350,
          animation: 'bookAppear 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards',
        }}>

          {/* Inner pages (visible when book opens) */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, #f5efe4 0%, #ede3d0 100%)',
            borderRadius: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {/* Page lines */}
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                left: 20, right: 20,
                top: 40 + i * 20,
                height: 1,
                background: 'rgba(155,118,84,0.12)',
              }} />
            ))}
            {/* Center binding line */}
            <div style={{
              position: 'absolute', top: 0, bottom: 0,
              left: '50%', width: 1, marginLeft: -0.5,
              background: 'rgba(155,118,84,0.2)',
            }} />
          </div>

          {/* LEFT COVER */}
          <div style={{
            position: 'absolute', left: 0, top: 0,
            width: '50%', height: '100%',
            transformOrigin: 'right center',
            transform: open ? 'rotateY(-165deg)' : 'rotateY(0deg)',
            transition: 'transform 0.75s cubic-bezier(0.65, 0, 0.35, 1)',
            transformStyle: 'preserve-3d',
            zIndex: 2,
          }}>
            {/* Front face */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(150deg, #b08050 0%, #9B7654 40%, #7a5230 100%)',
              borderRadius: '10px 0 0 10px',
              boxShadow: 'inset -4px 0 12px rgba(0,0,0,0.35)',
            }}>
              <div style={{
                position: 'absolute', inset: 10,
                border: '1px solid rgba(250,221,164,0.3)',
                borderRadius: 6,
              }} />
              {/* Corner ornament */}
              <div style={{
                position: 'absolute', top: 16, left: 16,
                width: 18, height: 18,
                borderTop: '2px solid rgba(250,221,164,0.4)',
                borderLeft: '2px solid rgba(250,221,164,0.4)',
                borderRadius: '3px 0 0 0',
              }} />
              <div style={{
                position: 'absolute', bottom: 16, left: 16,
                width: 18, height: 18,
                borderBottom: '2px solid rgba(250,221,164,0.4)',
                borderLeft: '2px solid rgba(250,221,164,0.4)',
                borderRadius: '0 0 0 3px',
              }} />
            </div>
            {/* Back face (inner side) */}
            <div style={{
              position: 'absolute', inset: 0,
              background: '#e8dcc8',
              borderRadius: '10px 0 0 10px',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }} />
          </div>

          {/* RIGHT COVER */}
          <div style={{
            position: 'absolute', right: 0, top: 0,
            width: '50%', height: '100%',
            transformOrigin: 'left center',
            transform: open ? 'rotateY(165deg)' : 'rotateY(0deg)',
            transition: 'transform 0.75s cubic-bezier(0.65, 0, 0.35, 1)',
            transformStyle: 'preserve-3d',
            zIndex: 2,
          }}>
            {/* Front face */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(150deg, #9B7654 0%, #7a5230 60%, #5c3d1e 100%)',
              borderRadius: '0 10px 10px 0',
              boxShadow: 'inset 4px 0 12px rgba(0,0,0,0.35)',
            }}>
              <div style={{
                position: 'absolute', inset: 10,
                border: '1px solid rgba(250,221,164,0.25)',
                borderRadius: 6,
              }} />
              <div style={{
                position: 'absolute', top: 16, right: 16,
                width: 18, height: 18,
                borderTop: '2px solid rgba(250,221,164,0.35)',
                borderRight: '2px solid rgba(250,221,164,0.35)',
                borderRadius: '0 3px 0 0',
              }} />
              <div style={{
                position: 'absolute', bottom: 16, right: 16,
                width: 18, height: 18,
                borderBottom: '2px solid rgba(250,221,164,0.35)',
                borderRight: '2px solid rgba(250,221,164,0.35)',
                borderRadius: '0 0 3px 0',
              }} />
            </div>
            {/* Back face */}
            <div style={{
              position: 'absolute', inset: 0,
              background: '#e8dcc8',
              borderRadius: '0 10px 10px 0',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }} />
          </div>

          {/* SPINE */}
          <div style={{
            position: 'absolute', left: '50%', top: 0, bottom: 0,
            width: 10, marginLeft: -5,
            background: 'linear-gradient(180deg, #4a2e10 0%, #2d1a08 50%, #4a2e10 100%)',
            zIndex: 5,
            boxShadow: '0 0 8px rgba(0,0,0,0.6)',
          }} />

          {/* LOGO — sits on top of closed covers, fades as book opens */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 6,
            opacity: open ? 0 : 1,
            transform: open ? 'scale(0.92)' : 'scale(1)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            pointerEvents: 'none',
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.96)',
              borderRadius: 14,
              padding: '14px 22px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
            }}>
              <img src="/logo.png" alt="التعاهد" style={{ width: 170, display: 'block' }} />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
