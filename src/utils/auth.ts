export interface AuthUser {
  name: string
  email: string
}

const AUTH_STORAGE_KEY = 'obc-sport-user'
const AUTH_EVENT = 'obc-auth-change'

export function getStoredUser(): AuthUser | null {
  const storedUser = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!storedUser) return null

  try {
    return JSON.parse(storedUser) as AuthUser
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export function saveUser(user: AuthUser) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
  window.dispatchEvent(new Event(AUTH_EVENT))
}

export function clearUser() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
  window.dispatchEvent(new Event(AUTH_EVENT))
}

export { AUTH_EVENT }