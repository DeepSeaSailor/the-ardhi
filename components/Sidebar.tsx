'use client'
import Logo from './Logo'
import { LogOut } from 'lucide-react'

interface SidebarProps {
  nav: { key: string; icon: React.ReactNode; label: string; badge?: number }[]
  tab: string
  setTab: (t: string) => void
  onSignOut: () => void
  accentColor?: string
  role?: string
}

export default function Sidebar({ nav, tab, setTab, onSignOut, accentColor = '#1B3A2D', role = 'Landlord' }: SidebarProps) {
  return (
    <div className="sidebar" style={{ display: 'none' }}>
      {/* Logo */}
      <div style={{ padding: '0 20px 28px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Logo size={38} />
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 6, fontWeight: 500 }}>{role} Portal</div>
      </div>

      {/* Nav items */}
      <div style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {nav.map(n => (
          <button
            key={n.key}
            onClick={() => setTab(n.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', borderRadius: 12, border: 'none',
              background: tab === n.key ? 'rgba(255,255,255,0.12)' : 'transparent',
              color: tab === n.key ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
              cursor: 'pointer', fontFamily: 'inherit', fontWeight: tab === n.key ? 700 : 500,
              fontSize: 14, textAlign: 'left', width: '100%', position: 'relative',
              transition: 'all 0.15s',
            }}
          >
            {tab === n.key && (
              <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 24, background: '#C8922A', borderRadius: '0 4px 4px 0' }} />
            )}
            <span style={{ color: tab === n.key ? '#C8922A' : 'rgba(255,255,255,0.4)' }}>{n.icon}</span>
            {n.label}
            {(n.badge ?? 0) > 0 && (
              <div style={{ marginLeft: 'auto', background: '#D64045', color: '#fff', borderRadius: 20, minWidth: 18, height: 18, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>{n.badge}</div>
            )}
          </button>
        ))}
      </div>

      {/* Sign out */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button onClick={onSignOut} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12, border: 'none', background: 'rgba(214,64,69,0.15)', color: '#FC8181', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: 14, width: '100%' }}>
          <LogOut size={16}/> Sign Out
        </button>
      </div>
    </div>
  )
}
