import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { SURAHS, JUZ, getJuzForPage } from '../../utils/quranData'
import { getTodaySchedule } from '../../utils/scheduleCalculator'

const QURAN_API = 'https://api.alquran.cloud/v1/page'

export default function QuranTab() {
  const { userData } = useAuth()
  const [page, setPage]      = useState(1)
  const [ayahs, setAyahs]    = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]    = useState('')
  const [fontSize, setFontSize] = useState(22)
  const [jumpMode, setJumpMode] = useState(false)
  const [jumpPage, setJumpPage] = useState('')
  const scrollRef = useRef()

  const plan         = userData?.plan
  const startDate    = plan?.schedule?.[0]?.date
  const todayEntry   = plan?.schedule ? getTodaySchedule(plan.schedule, startDate) : null

  const todayNewStart   = todayEntry?.newLesson?.startPage
  const todayMurajaStart = todayEntry?.muraja?.startPage

  useEffect(() => {
    fetchPage(page)
  }, [page])

  async function fetchPage(p) {
    setLoading(true)
    setError('')
    try {
      const res  = await fetch(`${QURAN_API}/${p}/quran-uthmani`)
      const data = await res.json()
      if (data.code !== 200) throw new Error('Failed to load page')
      setAyahs(data.data.ayahs || [])
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setError('Could not load Quran page. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  function jumpTo(p) {
    const n = parseInt(p)
    if (n >= 1 && n <= 604) { setPage(n); setJumpMode(false); setJumpPage('') }
  }

  const juzInfo = getJuzForPage(page)

  // Group ayahs by surah for display
  const surahGroups = []
  for (const a of ayahs) {
    const last = surahGroups[surahGroups.length - 1]
    if (!last || last.surahNum !== a.surah.number) {
      surahGroups.push({ surahNum: a.surah.number, surahName: a.surah.englishName, surahArabic: a.surah.name, ayahs: [a] })
    } else {
      last.ayahs.push(a)
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '52px 16px 12px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <h3 style={{ color: 'var(--brown)' }}>Quran Reader</h3>
            <p className="text-xs text-muted">{juzInfo ? `Juz ${juzInfo.number} — ${juzInfo.name}` : ''}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => setFontSize(f => Math.max(16, f - 2))} style={fontBtn}>A-</button>
            <button onClick={() => setFontSize(f => Math.min(32, f + 2))} style={fontBtn}>A+</button>
          </div>
        </div>

        {/* Page nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" style={{ flex: 'none', padding: '8px 14px' }} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            ←
          </button>

          {jumpMode ? (
            <div style={{ flex: 1, display: 'flex', gap: 6 }}>
              <input
                className="input"
                type="number"
                min={1} max={604}
                placeholder="Page 1–604"
                value={jumpPage}
                onChange={e => setJumpPage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && jumpTo(jumpPage)}
                style={{ flex: 1, padding: '8px 12px', fontSize: '0.9rem' }}
                autoFocus
              />
              <button className="btn btn-primary btn-sm" style={{ flex: 'none' }} onClick={() => jumpTo(jumpPage)}>Go</button>
              <button className="btn btn-ghost btn-sm" style={{ flex: 'none' }} onClick={() => setJumpMode(false)}>✕</button>
            </div>
          ) : (
            <button
              onClick={() => setJumpMode(true)}
              style={{ flex: 1, background: 'var(--cream)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px', fontWeight: 600, color: 'var(--brown)', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              Page {page} / 604
            </button>
          )}

          <button className="btn btn-ghost btn-sm" style={{ flex: 'none', padding: '8px 14px' }} disabled={page >= 604} onClick={() => setPage(p => p + 1)}>
            →
          </button>
        </div>

        {/* Quick jump chips */}
        <div style={{ display: 'flex', gap: 6, marginTop: 10, overflowX: 'auto', paddingBottom: 2 }}>
          {todayNewStart && (
            <button onClick={() => setPage(todayNewStart)} className="chip chip-gold" style={{ cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
              📖 New: Pg {todayNewStart}
            </button>
          )}
          {todayMurajaStart && (
            <button onClick={() => setPage(todayMurajaStart)} className="chip chip-teal" style={{ cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
              🔄 Muraja: Pg {todayMurajaStart}
            </button>
          )}
        </div>
      </div>

      {/* Quran content */}
      <div ref={scrollRef} style={{ flex: 1, overflow: 'auto', background: '#FDFAF3' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div className="spinner" />
          </div>
        ) : error ? (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <p style={{ color: '#c0392b', marginBottom: 12 }}>{error}</p>
            <button className="btn btn-outline btn-sm" style={{ width: 'auto' }} onClick={() => fetchPage(page)}>Retry</button>
          </div>
        ) : (
          <div style={{ padding: '12px 16px 40px' }}>
            {surahGroups.map(group => (
              <div key={group.surahNum}>
                {/* Surah header */}
                <div className="surah-header">
                  <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius)', padding: '12px 20px', display: 'inline-block', minWidth: 180, textAlign: 'center' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-2)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                      {group.surahNum}. {group.surahName}
                    </p>
                    <p className="arabic surah-name-ar">{group.surahArabic}</p>
                  </div>
                </div>
                {group.surahNum !== 1 && group.surahNum !== 9 && group.ayahs[0]?.numberInSurah === 1 && (
                  <p className="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
                )}
                {/* Ayahs as continuous text */}
                <div className="quran-page">
                  {group.ayahs.map(a => (
                    <span key={a.number} className="quran-ayah">
                      {a.text}{' '}
                      <span className="ayah-num">{toArabicNum(a.numberInSurah)}</span>
                      {' '}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const fontBtn = {
  background: 'var(--cream)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  padding: '4px 10px',
  cursor: 'pointer',
  fontSize: '0.8rem',
  fontWeight: 700,
  color: 'var(--brown)',
}

function toArabicNum(n) {
  return n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d])
}
