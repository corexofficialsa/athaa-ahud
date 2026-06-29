import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogoMark } from './Landing'

export default function ForgotPassword() {
  const navigate    = useNavigate()
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent]   = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch {
      setError('Could not find an account with that email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-no-tabs fade-in" style={{ background: 'linear-gradient(160deg, var(--cream) 0%, var(--bg) 60%)' }}>
      <div className="page-content" style={{ justifyContent: 'center', flex: 1 }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ width: 'auto', alignSelf: 'flex-start', marginBottom: 8 }}>
          ← Back
        </button>

        <div className="text-center" style={{ marginBottom: 32 }}>
          <LogoMark width={140} />
          <h2 style={{ marginTop: 16, color: 'var(--brown)' }}>Reset Password</h2>
          <p className="text-muted text-sm" style={{ marginTop: 4 }}>
            We'll send a reset link to your email
          </p>
        </div>

        {sent ? (
          <div className="card card-cream text-center">
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📧</div>
            <h3 style={{ color: 'var(--brown)' }}>Check your inbox</h3>
            <p className="text-muted text-sm" style={{ marginTop: 8 }}>
              A password reset link has been sent to <strong>{email}</strong>
            </p>
            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/')}>
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="input-group">
              <label>Email Address</label>
              <input
                className="input"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            {error && <p style={{ color: '#c0392b', fontSize: '0.875rem', textAlign: 'center' }}>{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
