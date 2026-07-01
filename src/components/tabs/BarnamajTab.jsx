import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { formatDateShort, formatDate } from '../../utils/scheduleCalculator'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Filler, Tooltip, Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

export default function BarnamajTab() {
  const { userData, schedule: scheduleResult, addLeave } = useAuth()
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [leaveDate,  setLeaveDate]  = useState('')
  const [leaveNote,  setLeaveNote]  = useState('')
  const [loading,    setLoading]    = useState(false)
  const [filter,     setFilter]     = useState('all') // all | upcoming | completed

  const plan         = userData?.plan
  const schedule     = scheduleResult?.schedule || []
  const completedDays = userData?.completedDays || []
  const leaves       = userData?.leaves || []

  const todayKey = new Date().toISOString().split('T')[0]

  const filteredSchedule = schedule.filter(entry => {
    const dateStr = new Date(entry.date).toISOString().split('T')[0]
    if (filter === 'upcoming')  return dateStr >= todayKey && !entry.isWeekend
    if (filter === 'completed') return completedDays.some(d => d.date === dateStr && !d.isLeave)
    return !entry.isWeekend
  })

  // Chart: last 14 days completion
  const last14 = getLast14Days()
  const chartLabels = last14.map(d => formatDateShort(d))
  const chartData   = last14.map(d => {
    const dk = d.toISOString().split('T')[0]
    return completedDays.some(c => c.date === dk && !c.isLeave) ? 1 : 0
  })

  const completedCount = completedDays.filter(d => !d.isLeave).length
  const leaveCount     = leaves.length
  const pct            = plan?.totalDays ? Math.round((completedCount / plan.totalDays) * 100) : 0

  async function handleAddLeave(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await addLeave(leaveDate, leaveNote)
      setShowLeaveModal(false)
      setLeaveDate('')
      setLeaveNote('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ padding: 'var(--header-top) 16px 24px' }}>
        <h2 style={{ color: 'var(--brown)', marginBottom: 4 }}>Barnamaj</h2>
        <p className="text-sm text-muted" style={{ marginBottom: 20 }}>Your full revision programme</p>

        {/* Stats row */}
        <div className="stat-grid" style={{ marginBottom: 16 }}>
          <div className="stat-card">
            <div className="stat-value">{completedCount}</div>
            <div className="stat-label">Days Done</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{pct}%</div>
            <div className="stat-label">Complete</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{leaveCount}</div>
            <div className="stat-label">Leaves Taken</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ fontSize: '1rem' }}>{plan?.estimatedCompletionDate ? formatDateShort(plan.estimatedCompletionDate) : '—'}</div>
            <div className="stat-label">Est. Finish</div>
          </div>
        </div>

        {/* Progress graph */}
        <div className="graph-wrap" style={{ marginBottom: 16 }}>
          <p className="text-sm fw-600" style={{ color: 'var(--brown)', marginBottom: 12 }}>Last 14 Days</p>
          <Line
            data={{
              labels: chartLabels,
              datasets: [{
                label: 'Completed',
                data: chartData,
                fill: true,
                borderColor: '#9B7654',
                backgroundColor: 'rgba(155,118,84,0.1)',
                tension: 0.4,
                pointBackgroundColor: '#F0B544',
                pointRadius: 5,
              }],
            }}
            options={{
              responsive: true,
              scales: {
                y: { display: false, min: 0, max: 1.2 },
                x: { grid: { display: false }, ticks: { font: { size: 10 } } },
              },
              plugins: { legend: { display: false }, tooltip: { callbacks: {
                label: ctx => ctx.raw === 1 ? '✓ Completed' : '✗ Missed',
              }}},
            }}
            height={80}
          />
        </div>

        {/* Add leave button */}
        <button className="btn btn-ghost" style={{ marginBottom: 16 }} onClick={() => setShowLeaveModal(true)}>
          + Add Leave in Advance
        </button>

        {/* Scheduled leaves */}
        {leaves.length > 0 && (
          <div className="card" style={{ marginBottom: 16 }}>
            <p className="text-sm fw-600" style={{ color: 'var(--brown)', marginBottom: 10 }}>Scheduled Leaves</p>
            {leaves.map((l, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < leaves.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div>
                  <p className="text-sm fw-600" style={{ color: 'var(--brown)' }}>{formatDate(l.date)}</p>
                  <p className="text-xs text-muted">{l.reason}</p>
                </div>
                <span className="chip chip-gold">Leave</span>
              </div>
            ))}
          </div>
        )}

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {[['all','All'],['upcoming','Upcoming'],['completed','Done']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                border: `1.5px solid ${filter === key ? 'var(--brown)' : 'var(--border)'}`,
                background: filter === key ? 'var(--cream)' : 'transparent',
                color: filter === key ? 'var(--brown)' : 'var(--text-2)',
                font: 'inherit',
                fontSize: '0.8rem',
                fontWeight: filter === key ? 700 : 400,
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Schedule list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredSchedule.slice(0, 60).map(entry => {
            const dateStr    = new Date(entry.date).toISOString().split('T')[0]
            const done       = completedDays.find(d => d.date === dateStr)
            const isToday    = dateStr === todayKey
            const isLeaveDay = leaves.some(l => l.date === dateStr)
            return (
              <ScheduleRow
                key={entry.day}
                entry={entry}
                done={done}
                isToday={isToday}
                isLeaveDay={isLeaveDay}
              />
            )
          })}
          {filteredSchedule.length === 0 && (
            <div className="card text-center" style={{ padding: '28px' }}>
              <p className="text-muted">No lessons to show</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Leave Modal */}
      {showLeaveModal && (
        <div className="modal-backdrop" onClick={() => setShowLeaveModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 style={{ color: 'var(--brown)', marginBottom: 16 }}>Add Leave</h3>
            <form onSubmit={handleAddLeave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="input-group">
                <label>Date</label>
                <input className="input" type="date" value={leaveDate} onChange={e => setLeaveDate(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Reason</label>
                <textarea className="input" placeholder="e.g. Travel, exam..." value={leaveNote} onChange={e => setLeaveNote(e.target.value)} rows={3} style={{ resize: 'none' }} required />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowLeaveModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Add Leave'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function ScheduleRow({ entry, done, isToday, isLeaveDay }) {
  const [open, setOpen] = useState(false)
  const dateLabel = formatDateShort(entry.date)

  return (
    <div
      className="card"
      style={{
        padding: '14px 16px',
        borderLeft: isToday ? '4px solid var(--gold)' : done ? '4px solid var(--teal)' : '4px solid var(--border)',
        background: isToday ? 'rgba(240,181,68,0.05)' : done?.isLeave ? 'rgba(240,181,68,0.04)' : 'var(--surface)',
        cursor: 'pointer',
      }}
      onClick={() => setOpen(o => !o)}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: done && !done.isLeave ? 'var(--teal)' : done?.isLeave ? 'var(--gold)' : isToday ? 'var(--gold)' : 'var(--cream)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 700,
            color: done ? '#fff' : 'var(--brown)',
          }}>
            {done && !done.isLeave ? '✓' : done?.isLeave ? '🌙' : entry.day}
          </div>
          <div>
            <p className="text-sm fw-600" style={{ color: isToday ? '#c48a00' : 'var(--brown)' }}>
              {isToday ? 'Today' : dateLabel}
              {isLeaveDay && <span className="chip chip-gold" style={{ marginLeft: 6, fontSize: '0.65rem', padding: '2px 8px' }}>Leave</span>}
            </p>
            <p className="text-xs text-muted">
              {entry.newLesson.pages}p new + {entry.muraja.pages}p muraja
            </p>
          </div>
        </div>
        <span style={{ color: 'var(--brown-light)', fontSize: '0.75rem' }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 16 }}>
          <div>
            <p className="text-xs text-muted">New Lesson</p>
            <p className="text-sm fw-600" style={{ color: 'var(--brown)' }}>
              Pg {entry.newLesson.startPage}–{entry.newLesson.endPage}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Muraja'ah</p>
            <p className="text-sm fw-600" style={{ color: 'var(--teal-dark)' }}>
              Pg {entry.muraja.startPage}–{entry.muraja.endPage}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function getLast14Days() {
  const days = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    d.setHours(0,0,0,0)
    days.push(d)
  }
  return days
}
