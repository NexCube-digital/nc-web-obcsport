import { useEffect, useState } from 'react'
import { AUTH_EVENT, getStoredUser, getStoredAccessToken, saveUser, type AuthUser } from '../utils/auth'
import type { CustomerProfileData } from '../services/accountService'

let cachedProfileToken: string | null = null
let cachedProfile: CustomerProfileData | null = null
let pendingProfileToken: string | null = null
let pendingProfileRequest: Promise<CustomerProfileData | null> | null = null
let failedProfileToken: string | null = null
let retryProfileAfter = 0

function loadProfileOnce(token: string): Promise<CustomerProfileData | null> {
  if (cachedProfileToken === token && cachedProfile) return Promise.resolve(cachedProfile)
  if (pendingProfileToken === token && pendingProfileRequest) return pendingProfileRequest
  if (failedProfileToken === token && Date.now() < retryProfileAfter) return Promise.resolve(null)

  const request = import('../services/accountService')
    .then(({ getProfile }) => getProfile())
    .then((profile) => {
      cachedProfileToken = token
      cachedProfile = profile
      failedProfileToken = null
      retryProfileAfter = 0
      return profile
    })
    .catch((error: unknown) => {
      failedProfileToken = token
      retryProfileAfter = Date.now() + 60_000
      console.warn('Gagal fetch profile untuk avatar. Akan dicoba lagi setelah cooldown.', error)
      return null
    })
    .finally(() => {
      if (pendingProfileRequest === request) {
        pendingProfileToken = null
        pendingProfileRequest = null
      }
    })

  pendingProfileToken = token
  pendingProfileRequest = request
  return request
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser())

  useEffect(() => {
    const refreshUser = () => {
      const storedUser = getStoredUser()
      const token = getStoredAccessToken()
      setUser(storedUser || (token ? { name: '', email: '' } : null))
    }
    
    window.addEventListener(AUTH_EVENT, refreshUser)
    window.addEventListener('storage', refreshUser)

    return () => {
      window.removeEventListener(AUTH_EVENT, refreshUser)
      window.removeEventListener('storage', refreshUser)
    }
  }, [])

  const token = getStoredAccessToken()

  // Fetch avatar once per token, shared by every component using this hook.
  useEffect(() => {
    if (!token || !user || user.avatarUrl) return
    let active = true

    loadProfileOnce(token).then((profile) => {
      if (!active || !profile || getStoredAccessToken() !== token) return

      const currentUser = getStoredUser() ?? user
      const updatedUser: AuthUser = {
        id: currentUser.id || profile.id,
        name: profile.name || currentUser.name,
        email: profile.email || currentUser.email,
        avatarUrl: profile.avatarUrl ?? undefined,
      }
      setUser(updatedUser)

      if (
        currentUser.id !== updatedUser.id ||
        currentUser.name !== updatedUser.name ||
        currentUser.email !== updatedUser.email ||
        currentUser.avatarUrl !== updatedUser.avatarUrl
      ) {
        saveUser(updatedUser)
      }
    })

    return () => { active = false }
  }, [token, user?.email, user?.avatarUrl])

  const isLoggedIn = Boolean(user) || Boolean(token)

  return { user, isLoggedIn }
}