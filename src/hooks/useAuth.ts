import { useEffect, useState } from 'react'
import { AUTH_EVENT, getStoredUser, type AuthUser } from '../utils/auth'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser())

  useEffect(() => {
    const refreshUser = () => setUser(getStoredUser())
    window.addEventListener(AUTH_EVENT, refreshUser)
    window.addEventListener('storage', refreshUser)

    return () => {
      window.removeEventListener(AUTH_EVENT, refreshUser)
      window.removeEventListener('storage', refreshUser)
    }
  }, [])

  return { user, isLoggedIn: Boolean(user) }
}