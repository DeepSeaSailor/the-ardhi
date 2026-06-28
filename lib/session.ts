// Client-side session management
export function saveSession(user: any, role: string) {
  if (typeof window === 'undefined') return
  sessionStorage.setItem('ardhi_user', JSON.stringify({ ...user, role }))
}

export function getSession() {
  if (typeof window === 'undefined') return null
  try {
    const s = sessionStorage.getItem('ardhi_user')
    return s ? JSON.parse(s) : null
  } catch { return null }
}

export function clearSession() {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem('ardhi_user')
}

export function getUserId(): string | null {
  return getSession()?.id || null
}
