import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  profile_picture: string | null
  created_at?: string
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  isLoggedIn: boolean
  isAuthenticated: boolean
  setAuth: (user: AuthUser, token: string) => void
  setUser: (user: AuthUser) => void
  clearAuth: () => void
  logout: () => void
}

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days in seconds

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      isAuthenticated: false,

      setAuth: (user, token) => {
        // Cookie with 7-day expiry so middleware can always read it
        document.cookie = `token=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
        set({ user, token, isLoggedIn: true, isAuthenticated: true })
      },

      setUser: (user) => set({ user }),

      clearAuth: () => {
        document.cookie = 'token=; path=/; max-age=0; SameSite=Lax'
        set({ user: null, token: null, isLoggedIn: false, isAuthenticated: false })
      },

      logout: () => {
        document.cookie = 'token=; path=/; max-age=0; SameSite=Lax'
        set({ user: null, token: null, isLoggedIn: false, isAuthenticated: false })
      },
    }),
    {
      name: 'auth',
      // localStorage persists across tabs and refreshes (unlike sessionStorage)
      storage: {
        getItem: (key) => {
          const value = localStorage.getItem(key)
          return value ? JSON.parse(value) : null
        },
        setItem: (key, value) =>
          localStorage.setItem(key, JSON.stringify(value)),
        removeItem: (key) => localStorage.removeItem(key),
      },
    }
  )
)