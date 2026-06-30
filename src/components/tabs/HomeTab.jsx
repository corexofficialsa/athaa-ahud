import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getTodaySchedule, formatDate, formatDateShort } from '../../utils/scheduleCalculator'
import { getJuzForPage, MOTIVATIONAL_QUOTES } from '../../utils/quranData'

export default function HomeTab() {
  const { userData, schedule, markDayComplete, addLeave } = useAuth()
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [leaveReason, setLeaveReason]       = useState('')
  const [showCelebration, setShowCelebration] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast]     = useState('')

  const plan     = userData?.plan
  const today    = new Date()
  const todayKey = today.toISOString().split('T')[0]

  const sched      = schedule?.schedule || []
  const todayEntry = sched.length ? getTodaySchedule(sched, sched[0]?.date || todayKey) : null
  const isCompleted = (userData?.completedDays || []).some(d => d.date === todayKey && !d.isLeave)
  const isLeave     = (userData?.completedDays || []).some(d => d.date === todayKey && d.isLeave)
  const alreadyLogged = isCompleted || isLeave

  const completedCount = (userData?.completedDays || []).filter(d => !d.isLeave).length
  const totalDays      = plan?.totalDays || 1
  const progressPct    = Math.round((completedCount / totalDays) * 100)

  const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]

  function showToastMsg(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 3100)
  }

  async function handleComplete() {
    setLoading(true)
    try {
      await markDayComplete(todayKey, false, '')
      setShowCelebration(true)
    } finally {
      setLoading(false)
    }
  }

  async function handleLeave() {
    if (!leaveReason.trim()) return
    setLoading(true)
    try {
      await markDayComplete(todayKey, true, leaveReason)
      setShowLeaveModal(false)
      setLeaveReason('')
      showToastMsg('Leave recorded. Rest well 🌙')
    } finally {
      setLoading(false)
    }
  }

  const newJuz     = todayEntry ? getJuzForPage(todayEntry.newLesson?.startPage || 1) : null
  const murajaJuz  = todayEntry ? getJuzForPage(todayEntry.muraja?.startPage || 1) : null

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ padding: '56px 16px 24px' }}>
        {/* Greeting */}
        <div style={{ marginBottom: 20 }}>
          <p className="text-sm text-muted">
            {greeting()}, {userData?.displayName || userData?.username}
          </p>
          <h2 style={{ color: 'var(--brown)', marginTop: 2 }}>Today's Lesson</h2>
          <p className="text-xs text-muted">{formatDate(today)}</p>
        </div>

        {/* Performance banner */}
        <div style={{ background: 'linear-gradient(135deg, var(--brown), var(--brown-dark))', borderRadius: 'var(--radius)', padding: '16px 20px', marginBottom: 16, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '0.75rem', opacity: 0.75, marginBottom: 2 }}>Overall Progress</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1 }}>{progressPct}%</p>
            <p style={{ fontSize: '0.75rem', opacity: 0.75, marginTop: 2 }}>{completedCount} of {totalDays} days</p>
          </div>
          <ProgressRing pct={progressPct} />
        </div>

        {/* Lesson cards */}
        {todayEntry && !todayEntry.isWeekend ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            {/* New Lesson */}
            <div className="card" style={{ borderLeft: '4px solid var(--gold)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="chip chip-gold" style={{ marginBottom: 8 }}>New Lesson</div>
                  <p className="fw-600" style={{ color: 'var(--brown)' }}>
                    Pages {todayEntry.newLesson.startPage}–{todayEntry.newLesson.endPage}
                  </p>
                  <p className="text-xs text-muted" style={{ marginTop: 2 }}>
                    {todayEntry.newLesson.pages} pages · Juz {newJuz?.number}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2rem', lineHeight: 1 }}>📖</div>
                </div>
              </div>
            </div>

            {/* Muraja */}
            {todayEntry.muraja.pages > 0 && (
              <div className="card" style={{ borderLeft: '4px solid var(--teal)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="chip chip-teal" style={{ marginBottom: 8 }}>Muraja'ah</div>
                    <p className="fw-600" style={{ color: 'var(--brown)' }}>
                      Pages {todayEntry.muraja.startPage}–{todayEntry.muraja.endPage}
                    </p>
                    <p className="text-xs text-muted" style={{ marginTop: 2 }}>
                      {todayEntry.muraja.pages} pages · Juz {murajaJuz?.number}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '2rem', lineHeight: 1 }}>🔄</div>
                  </div>
                </div>
              </div>
            )}

            {/* Plan info */}
            <div className="card card-cream">
              <div style={{ display: 'flex', gap: 16 }}>
                <InfoStat label="Day" value={`#${todayEntry.day}`} />
                <div style={{ width: 1, background: 'var(--border)' }} />
                <InfoStat label="Daily Pages" value={todayEntry.newLesson.pages + todayEntry.muraja.pages} />
                <div style={{ width: 1, background: 'var(--border)' }} />
                <InfoStat label="Est. Complete" value={formatDateShort(plan?.estimatedCompletionDate)} />
              </div>
            </div>
          </div>
        ) : todayEntry?.isWeekend ? (
          <div className="card text-center" style={{ marginBottom: 16, padding: '28px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🌙</div>
            <h3 style={{ color: 'var(--brown)' }}>Rest Day</h3>
            <p className="text-muted text-sm" style={{ marginTop: 6 }}>Today is your day off. Enjoy the break!</p>
          </div>
        ) : (
          <div className="card text-center" style={{ marginBottom: 16, padding: '28px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>📅</div>
            <h3 style={{ color: 'var(--brown)' }}>No Lesson Today</h3>
            <p className="text-muted text-sm" style={{ marginTop: 6 }}>Check your Barnamaj for your schedule</p>
          </div>
        )}

        {/* Action buttons */}
        {todayEntry && !todayEntry.isWeekend && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {alreadyLogged ? (
              <div className="card text-center" style={{ padding: '16px', background: isLeave ? 'rgba(240,181,68,0.1)' : 'rgba(98,206,186,0.1)', border: `1px solid ${isLeave ? 'var(--gold)' : 'var(--teal)'}` }}>
                <p className="fw-600" style={{ color: isLeave ? '#c48a00' : 'var(--teal-dark)' }}>
                  {isLeave ? '🌙 Leave recorded' : '✅ Lesson completed!'}
                </p>
                <p className="text-xs text-muted" style={{ marginTop: 4 }}>Keep up the great work</p>
              </div>
            ) : (
              <>
                <button className="btn btn-teal" onClick={handleComplete} disabled={loading} style={{ fontSize: '1.05rem' }}>
                  ✓ Mark as Completed
                </button>
                <button className="btn btn-ghost" onClick={() => setShowLeaveModal(true)}>
                  Taking a Leave Today
                </button>
              </>
            )}
          </div>
        )}

        {/* Streak */}
        <StreakCard completedDays={userData?.completedDays || []} />

        {/* Quote */}
        <div className="card" style={{ marginTop: 16, background: 'linear-gradient(135deg, var(--cream), #fff)', textAlign: 'center' }}>
          <p className="text-xs text-muted" style={{ marginBottom: 8 }}>Daily Verse</p>
          <p className="arabic" style={{ fontSize: '1.1rem', color: 'var(--brown)', lineHeight: 2, direction: 'rtl' }}>
            {quote.arabic}
          </p>
          <p className="text-xs text-muted" style={{ marginTop: 8, fontStyle: 'italic', lineHeight: 1.5 }}>
            {quote.english}
          </p>
        </div>
      </div>

      {/* Leave modal */}
      {showLeaveModal && (
        <div className="modal-backdrop" onClick={() => setShowLeaveModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 style={{ color: 'var(--brown)', marginBottom: 6 }}>Record Leave</h3>
            <p className="text-sm text-muted" style={{ marginBottom: 16 }}>Please provide a reason for taking leave today</p>
            <textarea
              className="input"
              placeholder="e.g. Travelling, not feeling well..."
              value={leaveReason}
              onChange={e => setLeaveReason(e.target.value)}
              rows={3}
              style={{ resize: 'none' }}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="btn btn-ghost" onClick={() => setShowLeaveModal(false)}>Cancel</button>
              <button className="btn btn-gold" onClick={handleLeave} disabled={loading || !leaveReason.trim()}>
                Confirm Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Celebration */}
      {showCelebration && (
        <div className="celebration-overlay" onClick={() => setShowCelebration(false)}>
          <div style={{ fontSize: '5rem', lineHeight: 1, marginBottom: 16 }}>🌟</div>
          <h2 style={{ color: 'var(--brown)', marginBottom: 8 }}>Lesson Complete!</h2>
          <p className="fw-600" style={{ color: 'var(--brown-dark)', fontSize: '1.1rem', marginBottom: 16 }}>
            MashaAllah, {userData?.displayName}!
          </p>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '20px', marginBottom: 20, maxWidth: 320 }}>
            <p className="arabic" style={{ fontSize: '1.1rem', color: 'var(--brown)', direction: 'rtl', lineHeight: 2 }}>
              {quote.arabic}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', marginTop: 8, fontStyle: 'italic', textAlign: 'center' }}>
              {quote.english}
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCelebration(false)}>
            Continue →
          </button>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

function ProgressRing({ pct }) {
  const r = 28, c = 2 * Math.PI * r
  const dash = (pct / 100) * c
  return (
    <svg width={72} height={72} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="5" />
      <circle
        cx="36" cy="36" r={r} fill="none"
        stroke="var(--gold)" strokeWidth="5" strokeLinecap="round"
        strokeDasharray={`${dash} ${c}`}
        style={{ transition: 'stroke-dasharray 1s ease' }}
      />
      <text
        x="36" y="36"
        textAnchor="middle" dominantBaseline="middle"
        fill="#fff" fontSize="11" fontWeight="700"
        style={{ transform: 'rotate(90deg)', transformOrigin: '36px 36px' }}
      >
        {pct}%
      </text>
    </svg>
  )
}

function InfoStat({ label, value }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <p className="fw-600" style={{ color: 'var(--brown)', fontSize: '1.1rem' }}>{value}</p>
      <p className="text-xs text-muted" style={{ marginTop: 2 }}>{label}</p>
    </div>
  )
}

function StreakCard({ completedDays }) {
  const sorted = [...completedDays]
    .filter(d => !d.isLeave)
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  let streak = 0
  let check  = new Date()
  check.setHours(0, 0, 0, 0)

  for (const d of sorted) {
    const dDate = new Date(d.date)
    dDate.setHours(0, 0, 0, 0)
    const diff = (check - dDate) / 86400000
    if (diff <= 1) { streak++; check = dDate }
    else break
  }

  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px' }}>
      <div style={{ fontSize: '2.2rem', lineHeight: 1 }}>🔥</div>
      <div>
        <p className="text-xs text-muted">Current Streak</p>
        <p className="fw-700" style={{ color: 'var(--brown)', fontSize: '1.4rem', lineHeight: 1.2 }}>{streak} days</p>
      </div>
      <div style={{ marginLeft: 'auto' }}>
        <p className="text-xs text-muted">Total Done</p>
        <p className="fw-600" style={{ color: 'var(--teal-dark)', textAlign: 'right' }}>{completedDays.filter(d => !d.isLeave).length}</p>
      </div>
    </div>
  )
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}
