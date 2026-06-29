import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { SURAHS, JUZ } from '../utils/quranData'
import { calcPerformanceScore, buildSchedule } from '../utils/scheduleCalculator'
import ImageCropper from '../components/ImageCropper'

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

const QUESTIONS = [
  {
    key: 'q1',
    question: (name) => `${name}, how much of the Quran still feels present in your memory?`,
    options: [
      { key: 'A', text: '90–100% — Almost all of it' },
      { key: 'B', text: '70–90% — Most of it is still there' },
      { key: 'C', text: '50–70% — About half feels solid' },
      { key: 'D', text: 'Below 50% — Significant gaps' },
    ],
  },
  {
    key: 'q2',
    question: (name) => `${name}, how consistent have you been with muraja'ah recently?`,
    options: [
      { key: 'A', text: 'Every single day' },
      { key: 'B', text: 'A few times a week' },
      { key: 'C', text: 'Once a week or less' },
      { key: 'D', text: 'Rarely or not at all' },
    ],
  },
  {
    key: 'q3',
    question: (name) => `${name}, when you revise, how quickly does the memorization come back?`,
    options: [
      { key: 'A', text: 'Instantly — flows right away' },
      { key: 'B', text: 'Within a few minutes of reading' },
      { key: 'C', text: 'Takes effort and repetition' },
      { key: 'D', text: 'Feels like relearning from scratch' },
    ],
  },
  {
    key: 'q4',
    question: (name) => `${name}, what time of day works best for your revision?`,
    options: [
      { key: 'A', text: 'After Fajr — early morning' },
      { key: 'B', text: 'After Asr — late afternoon' },
      { key: 'C', text: 'After Maghrib / Isha — evening' },
      { key: 'D', text: 'Flexible — any time works for me' },
    ],
  },
]

export default function Onboarding() {
  const navigate  = useNavigate()
  const { register } = useAuth()
  const fileRef   = useRef()

  const [step,    setStep]    = useState(0)     // 0=name, 1-4=questions, 5=start, 6=dates, 7=juz, 8=account
  const [name,    setName]    = useState('')
  const [answers, setAnswers] = useState({})
  const [startSurah, setStartSurah] = useState(1)
  const [startAyah,  setStartAyah]  = useState(1)
  const [startDate,  setStartDate]  = useState(today())
  const [weekendDays, setWD]  = useState(['Friday','Saturday'])
  const [juzRatings,  setJR]  = useState(
    JUZ.map(j => ({ juz: j.number, level: 'medium', pages: 20 }))
  )
  const [username, setUsername] = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPass]     = useState('')
  const [photoFile, setPhoto]      = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [cropSrc, setCropSrc]      = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const TOTAL_STEPS = 9
  const progress = ((step) / (TOTAL_STEPS - 1)) * 100

  function today() {
    return new Date().toISOString().split('T')[0]
  }

  function toggleWD(day) {
    setWD(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  function setJuzLevel(juzNum, field, value) {
    setJR(prev => prev.map(r => r.juz === juzNum ? { ...r, [field]: value } : r))
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setCropSrc(ev.target.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function handleCropConfirm(croppedFile, previewUrl) {
    setPhoto(croppedFile)
    setPhotoPreview(previewUrl)
    setCropSrc(null)
  }

  async function handleSubmit() {
    if (!username || !email || !password) { setError('Please fill all fields.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    setError('')
    try {
      const score      = calcPerformanceScore(answers)
      const startPage  = SURAHS.find(s => s.number === startSurah)?.pages[0] || 1
      const plan       = buildSchedule({
        startPage,
        startDate,
        weekendDays,
        juzRatings,
        performanceScore: score,
      })
      const onboardingData = { answers, startSurah, startAyah, startDate, weekendDays, juzRatings, score }
      await register({ email, password, username, displayName: name, photoFile, onboardingData, plan })
      navigate('/plan-reveal')
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const surah = SURAHS.find(s => s.number === startSurah)

  return (
    <div className="page-no-tabs" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ padding: '56px 20px 0', background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
          {step > 0 ? (
            <button onClick={() => setStep(s => s - 1)} style={{ background: 'none', border: 'none', color: 'var(--brown)', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>←</button>
          ) : <div style={{ width: 24 }} />}
          <span className="text-sm text-muted fw-600">Step {step + 1} of {TOTAL_STEPS}</span>
          <div style={{ width: 24 }} />
        </div>
        <div className="progress-bar-wrap" style={{ marginBottom: 12 }}>
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="page-content" style={{ paddingTop: 28 }}>
        {/* Step 0: Name */}
        {step === 0 && (
          <div className="slide-up">
            <p className="text-sm text-muted" style={{ marginBottom: 4 }}>Let's get started</p>
            <h2 style={{ color: 'var(--brown)', marginBottom: 24 }}>What's your name?</h2>
<div className="input-group">
              <label>Your name</label>
              <input
                className="input"
                type="text"
                placeholder="e.g. Abdullah"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
                style={{ fontSize: '1.1rem', textAlign: 'center' }}
              />
            </div>
            <p className="text-sm text-muted text-center" style={{ marginTop: 12 }}>
              We'll use your name throughout the app to personalise your journey
            </p>
            <button
              className="btn btn-primary"
              style={{ marginTop: 32 }}
              disabled={!name.trim()}
              onClick={() => setStep(1)}
            >
              Continue →
            </button>
          </div>
        )}

        {/* Steps 1–4: Questions */}
        {step >= 1 && step <= 4 && (
          <div className="slide-up">
            <QStep
              q={QUESTIONS[step - 1]}
              name={name}
              value={answers[QUESTIONS[step - 1].key]}
              onChange={val => setAnswers(prev => ({ ...prev, [QUESTIONS[step - 1].key]: val }))}
              onNext={() => setStep(s => s + 1)}
            />
          </div>
        )}

        {/* Step 5: Start position */}
        {step === 5 && (
          <div className="slide-up">
            <p className="text-sm text-muted" style={{ marginBottom: 4 }}>Step 5 of 9</p>
            <h2 style={{ color: 'var(--brown)', marginBottom: 6 }}>Where would you like to start, {name}?</h2>
            <p className="text-sm text-muted" style={{ marginBottom: 24 }}>Choose the surah and ayah where your new lesson begins</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="input-group">
                <label>Surah</label>
                <select
                  className="input"
                  value={startSurah}
                  onChange={e => { setStartSurah(Number(e.target.value)); setStartAyah(1) }}
                >
                  {SURAHS.map(s => (
                    <option key={s.number} value={s.number}>
                      {s.number}. {s.name} — {s.arabic}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Starting Ayah</label>
                <select
                  className="input"
                  value={startAyah}
                  onChange={e => setStartAyah(Number(e.target.value))}
                >
                  {Array.from({ length: surah?.ayahs || 1 }, (_, i) => i + 1).map(n => (
                    <option key={n} value={n}>Ayah {n}</option>
                  ))}
                </select>
              </div>

              {surah && (
                <div className="card card-cream text-center">
                  <p className="text-xs text-muted" style={{ marginBottom: 4 }}>Selected</p>
                  <p className="arabic" style={{ fontSize: '1.5rem', color: 'var(--brown)' }}>{surah.arabic}</p>
                  <p className="text-sm fw-600" style={{ color: 'var(--brown)', marginTop: 4 }}>{surah.name} : {startAyah}</p>
                  <p className="text-xs text-muted" style={{ marginTop: 4 }}>
                    Page {surah.pages[0]} · Juz {surah.juz[0]}
                  </p>
                </div>
              )}
            </div>

            <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => setStep(6)}>
              Continue →
            </button>
          </div>
        )}

        {/* Step 6: Dates */}
        {step === 6 && (
          <div className="slide-up">
            <p className="text-sm text-muted" style={{ marginBottom: 4 }}>Step 6 of 9</p>
            <h2 style={{ color: 'var(--brown)', marginBottom: 6 }}>Plan your schedule, {name}</h2>
            <p className="text-sm text-muted" style={{ marginBottom: 24 }}>Set your start date and days off</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label>Start Date</label>
                <input
                  className="input"
                  type="date"
                  value={startDate}
                  min={today()}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: 10 }}>
                  Weekend / Rest Days
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {DAYS.map(day => (
                    <button
                      key={day}
                      onClick={() => toggleWD(day)}
                      className={weekendDays.includes(day) ? 'chip chip-brown' : ''}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '100px',
                        border: `1.5px solid ${weekendDays.includes(day) ? 'var(--brown)' : 'var(--border)'}`,
                        background: weekendDays.includes(day) ? 'var(--cream)' : 'var(--surface)',
                        color: weekendDays.includes(day) ? 'var(--brown)' : 'var(--text-2)',
                        font: 'inherit',
                        fontSize: '0.85rem',
                        fontWeight: weekendDays.includes(day) ? 600 : 400,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button className="btn btn-primary" style={{ marginTop: 28 }} onClick={() => setStep(7)}>
              Continue →
            </button>
          </div>
        )}

        {/* Step 7: Juz Ratings */}
        {step === 7 && (
          <div className="slide-up">
            <p className="text-sm text-muted" style={{ marginBottom: 4 }}>Step 7 of 9</p>
            <h2 style={{ color: 'var(--brown)', marginBottom: 6 }}>{name}, rate each Juz</h2>
            <p className="text-sm text-muted" style={{ marginBottom: 20 }}>
              For each Juz, select your current level and how many pages you can recite from memory
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {JUZ.map(j => {
                const r = juzRatings.find(x => x.juz === j.number) || {}
                return (
                  <div key={j.number} className="card" style={{ padding: '14px 16px' }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                      <div className="flex items-center gap-8">
                        <div className="juz-num">{j.number}</div>
                        <div>
                          <p className="text-sm fw-600" style={{ color: 'var(--brown)' }}>Juz {j.number}</p>
                          <p className="text-xs text-muted">{j.name}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {['poor','medium','high'].map(lvl => (
                          <button
                            key={lvl}
                            onClick={() => setJuzLevel(j.number, 'level', lvl)}
                            className="btn-sm"
                            style={{
                              padding: '4px 10px',
                              border: `1.5px solid ${r.level === lvl ? 'var(--brown)' : 'var(--border)'}`,
                              borderRadius: '8px',
                              background: r.level === lvl ? 'var(--cream)' : 'transparent',
                              color: r.level === lvl ? 'var(--brown)' : 'var(--text-2)',
                              fontSize: '0.72rem',
                              fontWeight: r.level === lvl ? 700 : 400,
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                              textTransform: 'capitalize',
                            }}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                )
              })}
            </div>

            <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => setStep(8)}>
              Create My Plan →
            </button>
          </div>
        )}

        {/* Step 8: Account creation */}
        {step === 8 && (
          <div className="slide-up">
            <p className="text-sm text-muted" style={{ marginBottom: 4 }}>Final Step</p>
            <h2 style={{ color: 'var(--brown)', marginBottom: 6 }}>Create your account, {name}</h2>
            <p className="text-sm text-muted" style={{ marginBottom: 24 }}>Your progress will be saved securely across all devices</p>

            {/* Photo upload */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  width: 90, height: 90,
                  borderRadius: '50%',
                  background: 'var(--cream)',
                  border: '2px dashed var(--brown)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden',
                }}
              >
                {photoPreview
                  ? <img src={photoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ color: 'var(--brown)', fontSize: '1.8rem' }}>+</span>
                }
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
              <p className="text-xs text-muted" style={{ marginTop: 6 }}>Profile photo (optional)</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="input-group">
                <label>Username</label>
                <input
                  className="input"
                  type="text"
                  placeholder="e.g. abdullahx"
                  value={username}
                  onChange={e => setUsername(e.target.value.replace(/\s/g, ''))}
                />
              </div>
              <div className="input-group">
                <label>Email</label>
                <input className="input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Password</label>
                <input className="input" type="password" placeholder="Min 6 characters" value={password} onChange={e => setPass(e.target.value)} />
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginTop: 12 }}>
                <p style={{ color: '#c0392b', fontSize: '0.875rem' }}>{error}</p>
              </div>
            )}

            <button
              className="btn btn-gold"
              style={{ marginTop: 24, fontSize: '1.05rem' }}
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? 'Setting up your plan…' : '✦ Complete & Start Journey'}
            </button>
          </div>
        )}
      </div>

      {cropSrc && (
        <ImageCropper
          imageSrc={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropSrc(null)}
        />
      )}
    </div>
  )
}

function QStep({ q, name, value, onChange, onNext }) {
  return (
    <>
      <h2 style={{ color: 'var(--brown)', marginBottom: 28, lineHeight: 1.4 }}>{q.question(name)}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {q.options.map(opt => (
          <button
            key={opt.key}
            className={`option-btn${value === opt.key ? ' selected' : ''}`}
            onClick={() => onChange(opt.key)}
          >
            <div className="option-dot">
              {value === opt.key && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span>{opt.text}</span>
          </button>
        ))}
      </div>
      <button
        className="btn btn-primary"
        style={{ marginTop: 28 }}
        disabled={!value}
        onClick={onNext}
      >
        Continue →
      </button>
    </>
  )
}
