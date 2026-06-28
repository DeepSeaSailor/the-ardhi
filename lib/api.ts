// Client-side API helper that passes auth token
export async function apiFetch(url: string, options: RequestInit = {}) {
  const session = typeof window !== 'undefined' ? sessionStorage.getItem('ardhi_user') : null
  const user = session ? JSON.parse(session) : null
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }
  
  if (user?.id) headers['x-user-id'] = user.id
  
  return fetch(url, { ...options, headers })
}
