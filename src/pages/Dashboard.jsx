import { useState } from 'react'
import HomeTab     from '../components/tabs/HomeTab'
import BarnamajTab from '../components/tabs/BarnamajTab'
import QuranTab    from '../components/tabs/QuranTab'
import ProfileTab  from '../components/tabs/ProfileTab'
import BottomNav   from '../components/BottomNav'

export default function Dashboard() {
  const [tab, setTab] = useState('home')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {tab === 'home'     && <HomeTab />}
        {tab === 'barnamaj' && <BarnamajTab />}
        {tab === 'quran'    && <QuranTab />}
        {tab === 'profile'  && <ProfileTab />}
      </div>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}
