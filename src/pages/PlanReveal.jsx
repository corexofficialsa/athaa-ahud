import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { formatDate } from '../utils/scheduleCalculator'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js'

ChartJS.register(ArcElement, Tooltip)

export default function PlanReveal() {
  const navigate    = useNavigate()
  const { userData } = useAuth()

  useEffect(() => {
    if (!userData) navigate('/', { replace: true })
  }, [userData])

  if (!userData) return null

  const score     = userData.onboardingData?.score || 0
  const plan      = userData.plan
  const isHigh    = score >= 75
  const totalDays = plan?.totalDays || 0
  const estDate   = plan?.estimatedCompletionDate
  const newPages  = isHigh ? 5 : 2
  const murajaPages = isHigh ? 20 : 10
  const totalPages  = plan?.totalNewPages || 604

  const scoreColor = score >= 75 ? '#62CEBA' : '#F0B544'

  return (
    <div className="page-no-tabs fade-in" style={{ background: 'var(--bg)', overflowY: 'auto' }}>
      {/* Hero banner */}
      <div style={{
        background: 'var(--brown)',
        padding: '56px 24px 40px',
        textAlign: 'center',
        color: '#fff',
      }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
          Your Revision Plan
        </p>
        <h1 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 800, marginBottom: 4 }}>
          Welcome, {userData.displayName}!
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem' }}>
          Here's your personalised Quran revision journey
        </p>
      </div>

      <div style={{ padding: '24px 16px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Score card */}
        <div className="card" style={{ textAlign: 'center', padding: '28px 20px' }}>
          <p className="text-sm fw-600" style={{ color: 'var(--brown)', marginBottom: 20 }}>Your Strength Score</p>

          <div style={{ position: 'relative', width: 160, height: 160, margin: '0 auto' }}>
            <Doughnut
              data={{
                datasets: [{
                  data: [score, 100 - score],
                  backgroundColor: [scoreColor, '#F0EDE8'],
                  borderWidth: 0,
                  circumference: 270,
                  rotation: 225,
                }],
              }}
              options={{
                cutout: '75%',
                plugins: { tooltip: { enabled: false } },
                animation: { duration: 1200, easing: 'easeOutQuart' },
              }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{score}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-2)', marginTop: 2 }}>out of 100</span>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <span style={{
              display: 'inline-block',
              padding: '6px 20px',
              borderRadius: 100,
              background: isHigh ? 'rgba(98,206,186,0.15)' : 'rgba(240,181,68,0.15)',
              color: isHigh ? 'var(--teal-dark)' : '#a06000',
              fontWeight: 700,
              fontSize: '0.9rem',
            }}>
              {isHigh ? '🌟 High Performance' : '🌱 Recovery Plan'}
            </span>
            <p className="text-sm text-muted" style={{ marginTop: 10, lineHeight: 1.6 }}>
              {isHigh
                ? 'Your memory is strong. You\'re ready for an intensive revision plan.'
                : 'A gentle and consistent approach will rebuild your memory steadily.'}
            </p>
          </div>
        </div>

        {/* Daily plan breakdown */}
        <div className="card" style={{ padding: '20px' }}>
          <p className="text-sm fw-600" style={{ color: 'var(--brown)', marginBottom: 16 }}>Your Daily Plan</p>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1, textAlign: 'center', padding: '20px 12px', background: 'rgba(240,181,68,0.1)', borderRadius: 'var(--radius-sm)', border: '1.5px solid rgba(240,181,68,0.3)' }}>
              <p style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--brown)', lineHeight: 1 }}>{newPages}</p>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a06000', marginTop: 4 }}>pages/day</p>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-2)', marginTop: 6 }}>📖 New Lesson</p>
            </div>
            <div style={{ flex: 1, textAlign: 'center', padding: '20px 12px', background: 'rgba(98,206,186,0.1)', borderRadius: 'var(--radius-sm)', border: '1.5px solid rgba(98,206,186,0.3)' }}>
              <p style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--teal-dark)', lineHeight: 1 }}>{murajaPages}</p>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal-dark)', marginTop: 4 }}>pages/day</p>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-2)', marginTop: 6 }}>🔄 Muraja'ah</p>
            </div>
          </div>

          <p className="text-xs text-muted" style={{ marginTop: 14, textAlign: 'center', lineHeight: 1.6 }}>
            {isHigh
              ? 'Strong memory — 5 new pages every day keeps momentum high.'
              : 'Steady and consistent — 2 pages a day rebuilds your memory firmly.'}
          </p>
        </div>

        {/* Completion stats */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-value">{totalDays}</div>
            <div className="stat-label">Total Days</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalPages}</div>
            <div className="stat-label">Pages to Cover</div>
          </div>
          <div className="stat-card" style={{ gridColumn: '1 / -1', background: 'var(--brown)', border: 'none' }}>
            <div className="stat-value" style={{ color: 'var(--gold)', fontSize: '1.1rem' }}>
              {estDate ? formatDate(estDate) : '—'}
            </div>
            <div className="stat-label" style={{ color: 'rgba(255,255,255,0.7)' }}>Estimated Completion Date</div>
          </div>
        </div>

        {/* Motivational note */}
        <div className="card card-cream" style={{ textAlign: 'center', padding: '20px' }}>
          <p className="arabic" style={{ fontSize: '1.2rem', color: 'var(--brown)', direction: 'rtl', lineHeight: 2.2 }}>
            وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ
          </p>
          <p className="text-xs text-muted" style={{ marginTop: 8, fontStyle: 'italic' }}>
            "And We have certainly made the Quran easy to remember." — Al-Qamar 54:17
          </p>
        </div>

        <button
          className="btn btn-gold"
          style={{ fontSize: '1.05rem', padding: '18px', marginTop: 4 }}
          onClick={() => navigate('/dashboard', { replace: true })}
        >
          ✦ Start My Journey
        </button>
      </div>
    </div>
  )
}

