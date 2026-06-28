interface LogoProps {
  size?: number
  showText?: boolean
  variant?: 'light' | 'dark'
}

export default function Logo({ size = 40, showText = true, variant = 'light' }: LogoProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <img
        src="/ardhi-logo.png"
        alt="The Ardhi"
        style={{ width: size, height: size, objectFit: 'contain' }}
      />
      {showText && (
        <div>
          <div style={{
            fontWeight: 900,
            fontSize: size * 0.45,
            color: variant === 'dark' ? '#1B3A2D' : '#FFFFFF',
            letterSpacing: '-0.5px',
            lineHeight: 1,
          }}>
            The Ardhi
          </div>
          {size > 30 && (
            <div style={{
              fontSize: size * 0.22,
              color: variant === 'dark' ? '#8A8A82' : 'rgba(255,255,255,0.6)',
              fontWeight: 500,
              letterSpacing: '0.02em',
              marginTop: 1,
            }}>
              Property Management
            </div>
          )}
        </div>
      )}
    </div>
  )
}
