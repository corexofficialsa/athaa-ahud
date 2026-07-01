import HomeTab     from '../components/tabs/HomeTab'
import BarnamajTab from '../components/tabs/BarnamajTab'
import QuranTab    from '../components/tabs/QuranTab'
import ProfileTab  from '../components/tabs/ProfileTab'
import BottomNav   from '../components/BottomNav'
import { useState } from 'react'

const TABS = [
  { key: 'home',     Comp: HomeTab },
  { key: 'barnamaj', Comp: BarnamajTab },
  { key: 'quran',    Comp: QuranTab },
  { key: 'profile',  Comp: ProfileTab },
]

export default function Dashboard() {
  const [tab, setTab] = useState('home')

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      // subtract safe-area-top to match #root's padded content area exactly
      height: 'calc(100dvh - env(safe-area-inset-top, 0px))',
      overflow: 'hidden',
    }}>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {TABS.map(({ key, Comp }) => (
          <div
            key={key}
            style={{
              position: 'absolute',
              inset: 0,
              // visibility keeps layout intact (height:100% resolves) but hides content
              visibility: tab === key ? 'visible' : 'hidden',
              pointerEvents: tab === key ? 'auto' : 'none',
            }}
          >
            <Comp />
          </div>
        ))}
      </div>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}
