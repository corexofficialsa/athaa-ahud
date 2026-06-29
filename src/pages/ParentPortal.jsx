import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { formatDate, formatDateShort } from '../utils/scheduleCalculator'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export default function ParentPortal() {
  const navigate    = useNavigate()
  const { loginByRoll } = useAuth()
  const [rollInput, setRollInput] = useState('')
  const [student,   setStudent]   = useState(null)
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    if (rollInput.length !== 5 || !/^\d{5}$/.test(rollInput)) {
      setError('Please enter a valid 5-digit roll number.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await loginByRoll(rollInput)
      setStudent(data)
    } catch {
      setError('Student not found. Please check the roll number.')
    } finally {
      setLoading(false)
    }
  }

  if (student) {
    return <ParentView student={student} onBack={() => { setStudent(null); setRollInput('') }} />
  }

  return (
    <div className="page-no-tabs fade-in" style={{ background: 'linear-gradient(160deg, #0d2b26 0%, #1a4a42 40%, var(--bg) 100%)', minHeight: '100vh' }}>
      <div className="page-content" style={{ justifyContent: 'center', flex: 1 }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', marginBottom: 16, fontSize: '0.9rem', alignSelf: 'flex-start' }}>
          ← Back
        </button>

        <div className="text-center" style={{ marginBottom: 32 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>👪</div>
          <h2 style={{ color: '#fff' }}>Parent Login</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', marginTop: 6 }}>
            Enter your child's 5-digit roll number to view their progress
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="input-group">
            <label style={{ color: 'rgba(255,255,255,0.7)' }}>Student Roll Number</label>
            <input
              className="input"
              type="text"
              inputMode="numeric"
              pattern="\d{5}"
              maxLength={5}
              placeholder="e.g. 12345"
              value={rollInput}
              onChange={e => setRollInput(e.target.value.replace(/\D/g, '').slice(0, 5))}
              style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.3em' }}
              required
            />
          </div>
          {error && <p style={{ color: '#e74c3c', fontSize: '0.875rem', textAlign: 'center' }}>{error}</p>}
          <button type="submit" className="btn btn-teal" disabled={loading || rollInput.length !== 5}>
            {loading ? 'Looking up…' : 'View Progress'}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', padding: '16px', background: 'rgba(98,206,186,0.1)', border: '1px solid rgba(98,206,186,0.2)', borderRadius: 'var(--radius)' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', lineHeight: 1.6 }}>
            The roll number is a unique 5-digit code assigned to your child when they registered. Ask them to share it with you from their Profile tab.
          </p>
        </div>
      </div>
    </div>
  )
}

function ParentView({ student, onBack }) {
  const completedDays = student.completedDays || []
  const leaves        = student.leaves || []
  const leaveEntries  = completedDays.filter(d => d.isLeave)
  const doneCount     = completedDays.filter(d => !d.isLeave).length
  const totalDays     = student.plan?.totalDays || 1
  const pct           = Math.round((doneCount / totalDays) * 100)
  const score         = student.onboardingData?.score || 0
  const todayKey      = new Date().toISOString().split('T')[0]
  const doneToday     = completedDays.some(d => d.date === todayKey && !d.isLeave)

  // Last 7 days chart
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d
  })
  const chartLabels = last7.map(d => d.toLocaleDateString('en-US', { weekday: 'short' }))
  const chartData   = last7.map(d => {
    const dk = d.toISOString().split('T')[0]
    return completedDays.some(c => c.date === dk && !c.isLeave) ? 1 : 0
  })

  return (
    <div className="page-no-tabs fade-in" style={{ overflow: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '56px 16px 20px', background: 'linear-gradient(135deg, #0d2b26, #1a4a42)', color: '#fff' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', marginBottom: 16, fontSize: '0.875rem' }}>
          ← Change Student
        </button>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(98,206,186,0.2)', border: '2px solid rgba(98,206,186,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {student.photoURL
              ? <img src={student.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--teal)' }}>{(student.displayName || 'U')[0]}</span>
            }
          </div>
          <div>
            <h3 style={{ color: '#fff' }}>{student.displayName || student.username}</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Roll No. {student.rollNumber}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: 100, background: doneToday ? 'rgba(98,206,186,0.3)' : 'rgba(255,255,255,0.1)', color: doneToday ? 'var(--teal)' : 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                {doneToday ? '✓ Active Today' : '○ Not active today'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Stats */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--teal-dark)' }}>{pct}%</div>
            <div className="stat-label">Progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{doneCount}</div>
            <div className="stat-label">Days Done</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{leaveEntries.length + (student.leaves?.length || 0)}</div>
            <div className="stat-label">Leaves</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{score}%</div>
            <div className="stat-label">Strength Score</div>
          </div>
        </div>

        {/* 7-day chart */}
        <div className="graph-wrap">
          <p className="text-sm fw-600" style={{ color: 'var(--brown)', marginBottom: 12 }}>Last 7 Days</p>
          <Bar
            data={{
              labels: chartLabels,
              datasets: [{
                label: 'Completed',
                data: chartData,
                backgroundColor: chartData.map(v => v === 1 ? '#62CEBA' : '#FADDA4'),
                borderRadius: 8,
              }],
            }}
            options={{
              responsive: true,
              scales: {
                y: { display: false, min: 0, max: 1.2 },
                x: { grid: { display: false }, ticks: { font: { size: 11 } } },
              },
              plugins: { legend: { display: false } },
            }}
            height={80}
          />
        </div>

        {/* Plan overview */}
        <div className="card">
          <p className="text-sm fw-600" style={{ color: 'var(--brown)', marginBottom: 10 }}>Revision Plan</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
            <span className="text-sm text-muted">Start Date</span>
            <span className="text-sm fw-600" style={{ color: 'var(--brown)' }}>{student.onboardingData?.startDate ? formatDate(student.onboardingData.startDate) : '—'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
            <span className="text-sm text-muted">Est. Completion</span>
            <span className="text-sm fw-600" style={{ color: 'var(--brown)' }}>{student.plan?.estimatedCompletionDate ? formatDate(student.plan.estimatedCompletionDate) : '—'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0' }}>
            <span className="text-sm text-muted">Performance Tier</span>
            <span className={`chip ${score >= 80 ? 'chip-teal' : 'chip-gold'}`}>{score >= 80 ? 'High' : 'Recovery'}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <p className="text-sm fw-600" style={{ color: 'var(--brown)' }}>Overall Progress</p>
            <p className="text-sm fw-600" style={{ color: 'var(--teal-dark)' }}>{pct}%</p>
          </div>
          <div className="progress-bar-wrap" style={{ height: 10 }}>
            <div className="progress-bar-fill" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--teal), var(--teal-dark))' }} />
          </div>
          <p className="text-xs text-muted" style={{ marginTop: 8, textAlign: 'center' }}>{doneCount} of {totalDays} days completed</p>
        </div>

        {/* Leave history */}
        {(leaveEntries.length > 0 || leaves.length > 0) && (
          <div className="card">
            <p className="text-sm fw-600" style={{ color: 'var(--brown)', marginBottom: 10 }}>Leave History</p>
            {leaveEntries.map((l, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <p className="text-sm" style={{ color: 'var(--text)' }}>{formatDate(l.date)}</p>
                  <p className="text-xs text-muted">{l.leaveReason || '(no reason provided)'}</p>
                </div>
                <span className="chip chip-gold">Leave</span>
              </div>
            ))}
            {leaves.map((l, i) => (
              <div key={`adv-${i}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <p className="text-sm" style={{ color: 'var(--text)' }}>{formatDate(l.date)}</p>
                  <p className="text-xs text-muted">{l.reason}</p>
                </div>
                <span className="chip" style={{ background: 'rgba(240,181,68,0.08)', color: '#c48a00', fontSize: '0.65rem' }}>Scheduled</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
