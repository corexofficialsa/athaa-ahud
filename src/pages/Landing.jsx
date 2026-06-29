import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Landing() {
  const navigate = useNavigate()
  const { loginByUsername, currentUser, userData } = useAuth()
  const [view, setView]         = useState('home')
  const [username, setUsername] = useState('')
  const [password, setPass]     = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  if (currentUser && userData?.plan) {
    navigate('/dashboard', { replace: true })
    return null
  }

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await loginByUsername(username, password)
      navigate('/dashboard')
    } catch (err) {
      if (err.message === 'Username not found') {
        setError('Username not found. Please check and try again.')
      } else {
        setError('Incorrect password. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (view === 'login') {
    return (
      <div className="page-no-tabs fade-in" style={{ background: 'linear-gradient(160deg, var(--cream) 0%, var(--bg) 60%)' }}>
        <div className="page-content" style={{ justifyContent: 'center', flex: 1 }}>
          <button onClick={() => setView('home')} className="btn btn-ghost btn-sm" style={{ width: 'auto', alignSelf: 'flex-start', marginBottom: 8 }}>
            ← Back
          </button>

          <div className="text-center" style={{ marginBottom: 32 }}>
            <LogoMark width={160} />
            <p className="text-muted text-sm" style={{ marginTop: 16 }}>Continue your Quran journey</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="input-group">
              <label>Username</label>
              <input className="input" type="text" placeholder="your username" value={username} onChange={e => setUsername(e.target.value)} autoCapitalize="none" required />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPass(e.target.value)} required />
            </div>
            {error && <p style={{ color: '#c0392b', fontSize: '0.875rem', textAlign: 'center' }}>{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/forgot')}>
              Forgot Password?
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="page-no-tabs" style={{ background: '#9B7654', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ padding: '80px 24px 40px', textAlign: 'center' }}>
        {/* Logo image on white pill */}
        <div style={{
          display: 'inline-block',
          background: '#fff',
          borderRadius: 20,
          padding: '16px 28px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        }}>
          <img src="/logo.png" alt="التعاهد" style={{ height: 72, display: 'block', objectFit: 'contain' }} />
        </div>

        <div style={{ marginTop: 32 }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 16 }}>
            Quran Revision Platform
          </p>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem', lineHeight: 1.7 }}>
            Your structured Quran revision companion.<br />
            Built for those who completed the journey.
          </p>
        </div>
      </div>

      {/* Quote */}
      <div style={{ margin: '0 20px 32px', background: 'rgba(98,206,186,0.08)', border: '1px solid rgba(98,206,186,0.15)', borderRadius: 'var(--radius)', padding: '20px' }}>
        <p className="arabic" style={{ color: 'var(--cream)', fontSize: '1.15rem', textAlign: 'center', direction: 'rtl', lineHeight: 2.2 }}>
          وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ
        </p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textAlign: 'center', marginTop: 8 }}>
          Al-Qamar 54:17
        </p>
      </div>

      {/* Buttons */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button
          className="btn btn-gold"
          onClick={() => navigate('/onboarding')}
          style={{ fontSize: '1.05rem', padding: '18px 24px' }}
        >
          ✦ Start Your Muraja'ah
        </button>

        <button
          className="btn"
          onClick={() => setView('login')}
          style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.2)' }}
        >
          Sign In
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button
            className="btn btn-sm"
            onClick={() => navigate('/parent')}
            style={{ background: 'rgba(98,206,186,0.15)', color: 'var(--teal)', border: '1.5px solid rgba(98,206,186,0.25)' }}
          >
            Parent Login
          </button>
          <button
            className="btn btn-sm"
            onClick={() => navigate('/admin')}
            style={{ background: 'rgba(250,221,164,0.1)', color: 'var(--cream)', border: '1.5px solid rgba(250,221,164,0.2)' }}
          >
            Admin Login
          </button>
        </div>
      </div>

      <div style={{ padding: '32px 20px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem', letterSpacing: '0.15em' }}>
          حافظ القرآن · Hafiz Al-Quran
        </p>
      </div>
    </div>
  )
}

export function LogoMark({ width = 120, dark = false }) {
  return (
    <div style={{
      display: 'inline-block',
      background: dark ? 'transparent' : '#fff',
      borderRadius: 12,
      padding: dark ? '0' : '10px 16px',
    }}>
      <img
        src="/logo.png"
        alt="التعاهد"
        style={{ height: width * 0.45, display: 'block', objectFit: 'contain' }}
      />
    </div>
  )
}
