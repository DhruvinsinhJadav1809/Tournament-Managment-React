import type { AuthUser } from '@/types'

const AUTH_KEY = 'auth_user'

export const authStore = {
  get: (): AuthUser | null => {
    try {
      const raw = localStorage.getItem(AUTH_KEY)
      return raw ? (JSON.parse(raw) as AuthUser) : null
    } catch {
      return null
    }
  },

  set: (user: AuthUser): void => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user))
  },

  clear: (): void => {
    localStorage.removeItem(AUTH_KEY)
  },
}
