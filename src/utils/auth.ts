export interface AuthUser {
  id?: string
  name: string
  email: string
  avatarUrl?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

const AUTH_STORAGE_KEY = 'obc-sport-user'
const TOKEN_STORAGE_KEY = 'obc-sport-tokens'
const AUTH_EVENT = 'obc-auth-change'

function readStoredValue<T>(key: string): T | null {
  for (const storage of [localStorage, sessionStorage]) {
    const storedValue = storage.getItem(key)
    if (!storedValue) continue

    try {
      return JSON.parse(storedValue) as T
    } catch {
      storage.removeItem(key)
    }
  }

  return null
}

export function getStoredUser(): AuthUser | null {
  return readStoredValue<AuthUser>(AUTH_STORAGE_KEY)
}

export function getStoredTokens(): AuthTokens | null {
  return readStoredValue<AuthTokens>(TOKEN_STORAGE_KEY)
}

export function getStoredAccessToken(): string | null {
  return getStoredTokens()?.accessToken ?? null
}

export function saveTokens(tokens: AuthTokens) {
  const storage = localStorage.getItem(TOKEN_STORAGE_KEY) !== null ? localStorage : sessionStorage
  storage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens))
}

export function saveSession(user: AuthUser, tokens: AuthTokens, rememberMe: boolean) {
  const storage = rememberMe ? localStorage : sessionStorage
  const otherStorage = rememberMe ? sessionStorage : localStorage

  storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
  storage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens))
  otherStorage.removeItem(AUTH_STORAGE_KEY)
  otherStorage.removeItem(TOKEN_STORAGE_KEY)
  window.dispatchEvent(new Event(AUTH_EVENT))
}

export function saveUser(user: AuthUser) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
  window.dispatchEvent(new Event(AUTH_EVENT))
}

export function clearUser() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  sessionStorage.removeItem(AUTH_STORAGE_KEY)
  sessionStorage.removeItem(TOKEN_STORAGE_KEY)
  window.dispatchEvent(new Event(AUTH_EVENT))
}

export { AUTH_EVENT }