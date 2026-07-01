const TABS = [
  { key: 'home',     label: 'Home',     icon: HomeIcon },
  { key: 'barnamaj', label: 'Barnamaj', icon: CalIcon },
  { key: 'quran',    label: 'Quran',    icon: BookIcon },
  { key: 'profile',  label: 'Profile',  icon: UserIcon },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav style={{
      background: 'var(--surface)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'stretch',
      flexShrink: 0,
      boxShadow: '0 -4px 20px rgba(155,118,84,0.08)',
      paddingBottom: 'env(safe-area-inset-bottom)',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      touchAction: 'manipulation',
    }}>
      {TABS.map(tab => {
        const isActive = active === tab.key
        const Icon = tab.icon
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            style={{
              flex: 1,
              height: 'var(--tab-h)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              color: isActive ? 'var(--brown)' : 'var(--text-2)',
              transition: 'color 0.2s',
              position: 'relative',
              padding: '8px 0 4px',
            }}
          >
            {isActive && (
              <div style={{
                position: 'absolute',
                top: 0, left: '50%',
                transform: 'translateX(-50%)',
                width: 32, height: 3,
                background: 'var(--brown)',
                borderRadius: '0 0 3px 3px',
              }} />
            )}
            <Icon size={22} active={isActive} />
            <span style={{ fontSize: '0.65rem', fontWeight: isActive ? 700 : 400, letterSpacing: '0.02em' }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

function HomeIcon({ size, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}
function CalIcon({ size, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}
function BookIcon({ size, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
    </svg>
  )
}
function UserIcon({ size, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
}
