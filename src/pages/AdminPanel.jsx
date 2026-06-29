import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, orderBy, query, doc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { formatDate, formatDateShort } from '../utils/scheduleCalculator'

const ADMIN_USER = 'ATHAHUD_ADMIN'
const ADMIN_PASS = 'ATHAHUD3223!'

export default function AdminPanel() {
  const navigate   = useNavigate()
  const [authed,   setAuthed]   = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [students, setStudents] = useState([])
  const [loading,  setLoading]  = useState(false)
  const [selected, setSelected] = useState(null)
  const [search,   setSearch]   = useState('')

  function handleLogin(e) {
    e.preventDefault()
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      setAuthed(true)
      loadStudents()
    } else {
      setError('Invalid admin credentials.')
    }
  }

  async function loadStudents() {
    setLoading(true)
    try {
      const q    = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setStudents(snap.docs.map(d => d.data()))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = students.filter(s =>
    !search ||
    s.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    s.username?.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNumber?.includes(search) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (!authed) {
    return (
      <div className="page-no-tabs fade-in" style={{ background: 'linear-gradient(160deg, #1a0f06 0%, #2d1f0f 50%, var(--bg) 100%)', minHeight: '100vh' }}>
        <div className="page-content" style={{ justifyContent: 'center', flex: 1 }}>
          <div className="text-center" style={{ marginBottom: 32 }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: '12px 20px', display: 'inline-block' }}>
              <img src="/logo.png" alt="التعاهد" style={{ height: 52, display: 'block', objectFit: 'contain' }} />
            </div>
            <h2 style={{ marginTop: 16, color: '#fff' }}>Admin Panel</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', marginTop: 4 }}>Al-Ta'ahud Management</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="input-group">
              <label style={{ color: 'rgba(255,255,255,0.7)' }}>Username</label>
              <input className="input" placeholder="Admin username" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div className="input-group">
              <label style={{ color: 'rgba(255,255,255,0.7)' }}>Password</label>
              <input className="input" type="password" placeholder="Admin password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && <p style={{ color: '#e74c3c', fontSize: '0.875rem', textAlign: 'center' }}>{error}</p>}
            <button type="submit" className="btn btn-gold" style={{ marginTop: 4 }}>Sign In as Admin</button>
          </form>

          <button onClick={() => navigate('/')} className="btn btn-ghost" style={{ marginTop: 12, color: 'rgba(255,255,255,0.5)' }}>
            ← Back to Home
          </button>
        </div>
      </div>
    )
  }

  async function handleDeleteStudent(student) {
    try {
      await deleteDoc(doc(db, 'users', student.uid))
      setStudents(prev => prev.filter(s => s.uid !== student.uid))
      setSelected(null)
    } catch (err) {
      alert('Failed to remove student: ' + err.message)
    }
  }

  if (selected) {
    return <StudentDetail student={selected} onBack={() => setSelected(null)} onDelete={handleDeleteStudent} />
  }

  return (
    <div className="page-no-tabs fade-in">
      {/* Header */}
      <div style={{ padding: '56px 16px 16px', background: 'var(--brown)', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <h2 style={{ color: '#fff' }}>Admin Panel</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>{students.length} students registered</p>
          </div>
          <button onClick={() => { setAuthed(false); navigate('/') }} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '6px 14px', cursor: 'pointer', fontSize: '0.8rem' }}>
            Logout
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          <StatCard label="Total Students" value={students.length} light />
          <StatCard label="Active Today" value={countActiveToday(students)} light />
          <StatCard label="High Perf." value={students.filter(s => (s.onboardingData?.score || 0) >= 80).length} light />
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto', flex: 1 }}>
        {/* Search */}
        <input
          className="input"
          placeholder="Search by name, username, roll no, email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(s => (
              <StudentCard key={s.uid} student={s} onClick={() => setSelected(s)} />
            ))}
            {filtered.length === 0 && (
              <div className="card text-center" style={{ padding: 28 }}>
                <p className="text-muted">No students found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function StudentCard({ student, onClick }) {
  const score        = student.onboardingData?.score || 0
  const completed    = (student.completedDays || []).filter(d => !d.isLeave).length
  const totalDays    = student.plan?.totalDays || 1
  const pct          = Math.round((completed / totalDays) * 100)
  const todayKey     = new Date().toISOString().split('T')[0]
  const doneToday    = (student.completedDays || []).some(d => d.date === todayKey && !d.isLeave)

  return (
    <div className="card" style={{ cursor: 'pointer' }} onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Avatar */}
        <div style={{
          width: 46, height: 46, borderRadius: '50%',
          background: 'var(--cream)', border: '2px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', flexShrink: 0,
        }}>
          {student.photoURL
            ? <img src={student.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontWeight: 700, color: 'var(--brown)', fontSize: '1rem' }}>
                {(student.displayName || student.username || 'U')[0].toUpperCase()}
              </span>
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <p className="fw-600" style={{ color: 'var(--brown)' }}>{student.displayName || student.username}</p>
            {doneToday && <span className="chip chip-teal" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>Active</span>}
          </div>
          <p className="text-xs text-muted">#{student.rollNumber} · {student.email}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
            <MiniBar pct={pct} />
            <span className="text-xs" style={{ color: 'var(--brown)', fontWeight: 600 }}>{pct}%</span>
            <span className="text-xs text-muted">Score: {score}</span>
          </div>
        </div>
        <span style={{ color: 'var(--border)', fontSize: '1rem' }}>›</span>
      </div>
    </div>
  )
}

function StudentDetail({ student, onBack, onDelete }) {
  const score        = student.onboardingData?.score || 0
  const completedDays = student.completedDays || []
  const completed    = completedDays.filter(d => !d.isLeave).length
  const leaves       = completedDays.filter(d => d.isLeave)
  const totalDays    = student.plan?.totalDays || 1
  const pct          = Math.round((completed / totalDays) * 100)
  const ratings      = student.onboardingData?.juzRatings || []
  const [confirming, setConfirming] = useState(false)
  const [deleting,   setDeleting]   = useState(false)

  async function confirmDelete() {
    setDeleting(true)
    await onDelete(student)
    setDeleting(false)
  }

  return (
    <div className="page-no-tabs fade-in" style={{ overflow: 'auto' }}>
      <div style={{ padding: '56px 16px 16px', background: 'var(--brown)', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '0.9rem' }}>
            ← All Students
          </button>
          <button
            onClick={() => setConfirming(true)}
            style={{ background: 'rgba(231,76,60,0.2)', border: '1px solid rgba(231,76,60,0.5)', color: '#ff6b6b', borderRadius: 'var(--radius-sm)', padding: '6px 14px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
          >
            Remove Student
          </button>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.3)' }}>
            {student.photoURL
              ? <img src={student.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>{(student.displayName || 'U')[0]}</span>
            }
          </div>
          <div>
            <h3 style={{ color: '#fff' }}>{student.displayName || student.username}</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>@{student.username} · #{student.rollNumber}</p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>{student.email}</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Stats */}
        <div className="stat-grid">
          <div className="stat-card"><div className="stat-value">{score}%</div><div className="stat-label">Initial Score</div></div>
          <div className="stat-card"><div className="stat-value">{pct}%</div><div className="stat-label">Progress</div></div>
          <div className="stat-card"><div className="stat-value">{completed}</div><div className="stat-label">Days Done</div></div>
          <div className="stat-card"><div className="stat-value">{leaves.length}</div><div className="stat-label">Leaves</div></div>
        </div>

        {/* Plan info */}
        <div className="card">
          <p className="text-sm fw-600" style={{ color: 'var(--brown)', marginBottom: 10 }}>Plan Details</p>
          <InfoRow label="Performance" value={score >= 80 ? 'High Performance' : 'Recovery'} />
          <InfoRow label="Start Date" value={student.onboardingData?.startDate ? formatDate(student.onboardingData.startDate) : '—'} />
          <InfoRow label="Est. Completion" value={student.plan?.estimatedCompletionDate ? formatDate(student.plan.estimatedCompletionDate) : '—'} />
          <InfoRow label="Total Days" value={student.plan?.totalDays || '—'} />
          <InfoRow label="Weekend Days" value={(student.onboardingData?.weekendDays || []).join(', ') || '—'} />
          <InfoRow label="Joined" value={student.createdAt ? formatDate(student.createdAt) : '—'} />
        </div>

        {/* Juz ratings */}
        {ratings.length > 0 && (
          <div className="card">
            <p className="text-sm fw-600" style={{ color: 'var(--brown)', marginBottom: 10 }}>Juz Ratings</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ratings.map(r => (
                <span key={r.juz} className={`chip level-${r.level}`} style={{ padding: '4px 10px' }}>
                  J{r.juz}: {r.level} ({r.pages}p)
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Leave history */}
        {leaves.length > 0 && (
          <div className="card">
            <p className="text-sm fw-600" style={{ color: 'var(--brown)', marginBottom: 10 }}>Leave History</p>
            {leaves.map((l, i) => (
              <div key={i} style={{ paddingBottom: 8, marginBottom: 8, borderBottom: i < leaves.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <p className="text-sm fw-600" style={{ color: 'var(--brown)' }}>{formatDate(l.date)}</p>
                <p className="text-xs text-muted">{l.leaveReason || '(no reason)'}</p>
              </div>
            ))}
          </div>
        )}

        {/* Recent activity */}
        <div className="card">
          <p className="text-sm fw-600" style={{ color: 'var(--brown)', marginBottom: 10 }}>Recent Activity</p>
          {[...completedDays].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 10).map((d, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, marginBottom: 8, borderBottom: i < 9 ? '1px solid var(--border)' : 'none' }}>
              <p className="text-sm" style={{ color: 'var(--text)' }}>{formatDate(d.date)}</p>
              <span className={`chip ${d.isLeave ? 'chip-gold' : 'chip-teal'}`}>{d.isLeave ? 'Leave' : 'Done'}</span>
            </div>
          ))}
          {completedDays.length === 0 && <p className="text-sm text-muted">No activity yet</p>}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {confirming && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div className="card" style={{ width: '100%', maxWidth: 340, padding: 24, textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', marginBottom: 8 }}>⚠️</p>
            <p className="fw-600" style={{ color: 'var(--brown)', marginBottom: 8 }}>Remove Student?</p>
            <p className="text-sm text-muted" style={{ marginBottom: 20, lineHeight: 1.6 }}>
              This will permanently delete <strong>{student.displayName}</strong>'s account and all their data. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-ghost"
                style={{ flex: 1 }}
                onClick={() => setConfirming(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius)', border: 'none', background: '#e74c3c', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
              >
                {deleting ? 'Removing…' : 'Yes, Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm fw-600" style={{ color: 'var(--brown)', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
  )
}

function StatCard({ label, value, light }) {
  return (
    <div style={{ background: light ? 'rgba(255,255,255,0.12)' : 'var(--surface)', borderRadius: 'var(--radius-sm)', padding: '12px', textAlign: 'center' }}>
      <p style={{ fontSize: '1.5rem', fontWeight: 800, color: light ? '#fff' : 'var(--brown)', lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: '0.7rem', color: light ? 'rgba(255,255,255,0.6)' : 'var(--text-2)', marginTop: 4 }}>{label}</p>
    </div>
  )
}

function MiniBar({ pct }) {
  return (
    <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--teal)', borderRadius: 2 }} />
    </div>
  )
}

function countActiveToday(students) {
  const todayKey = new Date().toISOString().split('T')[0]
  return students.filter(s =>
    (s.completedDays || []).some(d => d.date === todayKey && !d.isLeave)
  ).length
}
