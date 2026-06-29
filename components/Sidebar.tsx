'use client'
import Logo from '@/components/Logo'
import { LogOut } from 'lucide-react'

interface NavItem {
  key: string
  icon: React.ReactNode
  label: string
  badge?: number
}

interface SidebarProps {
  nav: NavItem[]
  tab: string
  setTab: (t: string) => void
  onSignOut?: () => void
  role?: string
  dark?: boolean
}

export default function Sidebar({ nav, tab, setTab, onSignOut, role = 'Landlord', dark = false }: SidebarProps) {
  const bg = dark ? '#060D0A' : '#1B3A2D'
  const accent = dark ? '#00FF87' : '#C8922A'
  const activeAlpha = dark ? 'rgba(0,255,135,0.10)' : 'rgba(255,255,255,0.12)'
  const borderColor = dark ? 'rgba(0,255,135,0.08)' : 'rgba(255,255,255,0.10)'
  const mutedColor = dark ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.45)'
  const activeColor = dark ? '#00FF87' : '#FFFFFF'

  return (
    <div className="sidebar" style={{ display: 'none', flexDirection: 'column', background: bg, position: 'fixed', top: 0, bottom: 0, left: 0, width: 240, zIndex: 200, padding: '28px 0', overflowY: 'auto', borderRight: `1px solid ${borderColor}` }}>
      <div style={{ padding: '0 20px 24px', borderBottom: `1px solid ${borderColor}` }}>
        <Logo size={32}/>
        <div style={{ marginTop: 10, fontSize: 11, color: mutedColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{role} Portal</div>
      </div>
      <div style={{ padding: '16px 12px', flex: 1 }}>
        {nav.map(n => (
          <button key={n.key} onClick={() => setTab(n.key)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', border: 'none', borderRadius: 10,
            background: tab === n.key ? activeAlpha : 'transparent',
            color: tab === n.key ? activeColor : mutedColor,
            cursor: 'pointer', marginBottom: 4,
            fontWeight: tab === n.key ? 700 : 500, fontSize: 13,
            textAlign: 'left' as const,
            borderLeft: tab === n.key ? `2px solid ${accent}` : '2px solid transparent',
            transition: 'all 0.15s ease',
          }}>
            {n.icon}
            <span style={{ flex: 1 }}>{n.label}</span>
            {(n.badge ?? 0) > 0 && (
              <span style={{ background: '#D64045', color: '#fff', borderRadius: 10, minWidth: 18, height: 18, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                {n.badge}
              </span>
            )}
          </button>
        ))}
      </div>
      {onSignOut && (
        <div style={{ padding: '16px 12px', borderTop: `1px solid ${borderColor}` }}>
          <button onClick={onSignOut} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: `1px solid rgba(214,64,69,0.3)`, borderRadius: 10, background: 'rgba(214,64,69,0.08)', color: '#D64045', cursor: 'pointer', fontWeight: 700, fontSize: 13, textAlign: 'left' as const }}>
            <LogOut size={16}/> Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
