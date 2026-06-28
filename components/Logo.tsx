export default function Logo({ size = 40, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {/* The Ardhi Logo — A shaped as a house roofline */}
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="10" fill="#1B3A2D"/>
        {/* House/A shape */}
        <path d="M20 8L7 19H10V32H17V24H23V32H30V19H33L20 8Z" fill="#C8922A"/>
        {/* Door */}
        <rect x="17" y="24" width="6" height="8" rx="1" fill="#C8922A" opacity="0.4"/>
        {/* Windows */}
        <rect x="12" y="20" width="4" height="4" rx="1" fill="white" opacity="0.7"/>
        <rect x="24" y="20" width="4" height="4" rx="1" fill="white" opacity="0.7"/>
      </svg>
      {showText && (
        <div>
          <div style={{ fontWeight: 900, fontSize: size * 0.45, color: '#1B3A2D', letterSpacing: '-0.5px', lineHeight: 1 }}>
            The Ardhi
          </div>
          {size > 30 && (
            <div style={{ fontSize: size * 0.25, color: '#8A8A82', fontWeight: 500, letterSpacing: '0.02em' }}>
              Property Management
            </div>
          )}
        </div>
      )}
    </div>
  )
}
