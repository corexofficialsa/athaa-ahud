import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { formatDate } from '../../utils/scheduleCalculator'

export default function ProfileTab() {
  const navigate  = useNavigate()
  const { userData, logout, updateUserData, resetPassword } = useAuth()
  const [loading, setLoading]   = useState(false)
  const [toast,   setToast]     = useState('')
  const [editName, setEditName] = useState(false)
  const [newName, setNewName]   = useState(userData?.displayName || '')
  const [showLogout, setShowLogout] = useState(false)
  const [showReset,  setShowReset]  = useState(false)

  const perf        = userData?.onboardingData?.score || 0
  const completedDays = userData?.completedDays || []
  const doneCount   = completedDays.filter(d => !d.isLeave).length
  const leaveCount  = completedDays.filter(d => d.isLeave).length
  const rollNumber  = userData?.rollNumber || '—'

  function showMsg(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function saveName() {
    if (!newName.trim()) return
    await updateUserData({ displayName: newName.trim() })
    setEditName(false)
    showMsg('Name updated!')
  }

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  async function sendReset() {
    setLoading(true)
    try {
      await resetPassword(userData?.email)
      showMsg('Password reset email sent!')
      setShowReset(false)
    } catch {
      showMsg('Could not send reset email.')
    } finally {
      setLoading(false)
    }
  }

  const initials = (userData?.displayName || userData?.username || 'U')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ padding: '56px 16px 40px' }}>
        <h2 style={{ color: 'var(--brown)', marginBottom: 20 }}>Profile</h2>

        {/* Avatar + name */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              width: 96, height: 96,
              borderRadius: '50%',
              background: 'var(--cream)',
              border: '3px solid var(--brown)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--brown)' }}>{initials}</span>
          </div>

          {editName ? (
            <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center', justifyContent: 'center' }}>
              <input
                className="input"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                style={{ maxWidth: 200, textAlign: 'center' }}
                autoFocus
              />
              <button className="btn btn-primary btn-sm" style={{ width: 'auto' }} onClick={saveName}>Save</button>
              <button className="btn btn-ghost btn-sm" style={{ width: 'auto' }} onClick={() => setEditName(false)}>✕</button>
            </div>
          ) : (
            <div style={{ marginTop: 12 }}>
              <p className="fw-700" style={{ fontSize: '1.25rem', color: 'var(--brown)' }}>{userData?.displayName || userData?.username}</p>
              <p className="text-sm text-muted">@{userData?.username}</p>
              <button onClick={() => setEditName(true)} style={{ background: 'none', border: 'none', color: 'var(--brown)', fontSize: '0.8rem', cursor: 'pointer', marginTop: 4 }}>
                Edit Name
              </button>
            </div>
          )}

          {/* Roll number */}
          <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 100, padding: '6px 16px' }}>
            <span className="text-xs text-muted">Roll No.</span>
            <span className="fw-700" style={{ color: 'var(--brown)', letterSpacing: '0.15em', fontSize: '1rem' }}>{rollNumber}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="stat-grid" style={{ marginBottom: 16 }}>
          <div className="stat-card">
            <div className="stat-value">{perf}%</div>
            <div className="stat-label">Initial Score</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{doneCount}</div>
            <div className="stat-label">Days Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{leaveCount}</div>
            <div className="stat-label">Leaves Taken</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ fontSize: '0.85rem' }}>{userData?.createdAt ? formatDate(userData.createdAt) : '—'}</div>
            <div className="stat-label">Joined</div>
          </div>
        </div>

        {/* Plan info */}
        <div className="card card-cream" style={{ marginBottom: 16 }}>
          <p className="text-sm fw-600" style={{ color: 'var(--brown)', marginBottom: 10 }}>Your Plan</p>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="text-sm text-muted">Performance Tier</span>
            <span className={`chip ${perf >= 75 ? 'chip-teal' : 'chip-gold'}`}>
              {perf >= 75 ? 'High Performance' : 'Recovery Plan'}
            </span>
          </div>
          <div className="divider" />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="text-sm text-muted">Daily New Pages</span>
            <span className="fw-600" style={{ color: 'var(--brown)' }}>{perf >= 75 ? '5 pages/day' : '2 pages/day'}</span>
          </div>
        </div>

        {/* Account info */}
        <div className="card" style={{ marginBottom: 16 }}>
          <p className="text-sm fw-600" style={{ color: 'var(--brown)', marginBottom: 10 }}>Account</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-sm text-muted">Email</span>
            <span className="text-sm fw-600" style={{ color: 'var(--brown)' }}>{userData?.email}</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="btn btn-outline" onClick={() => setShowReset(true)}>
            Change Password
          </button>
          <button
            className="btn"
            onClick={() => setShowLogout(true)}
            style={{ background: 'rgba(192,57,43,0.08)', color: '#c0392b', border: '1.5px solid rgba(192,57,43,0.2)' }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Logout confirm */}
      {showLogout && (
        <div className="modal-backdrop" onClick={() => setShowLogout(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 style={{ color: 'var(--brown)', marginBottom: 8 }}>Sign Out?</h3>
            <p className="text-sm text-muted" style={{ marginBottom: 20 }}>Your progress is saved. You can sign back in anytime.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" onClick={() => setShowLogout(false)}>Cancel</button>
              <button className="btn" onClick={handleLogout} style={{ background: '#c0392b', color: '#fff' }}>Sign Out</button>
            </div>
          </div>
        </div>
      )}

      {/* Password reset confirm */}
      {showReset && (
        <div className="modal-backdrop" onClick={() => setShowReset(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 style={{ color: 'var(--brown)', marginBottom: 8 }}>Change Password</h3>
            <p className="text-sm text-muted" style={{ marginBottom: 20 }}>
              A password reset link will be sent to <strong>{userData?.email}</strong>
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" onClick={() => setShowReset(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={sendReset} disabled={loading}>
                {loading ? 'Sending…' : 'Send Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
