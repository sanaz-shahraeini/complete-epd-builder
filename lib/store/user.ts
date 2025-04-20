import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: number
  username?: string
  first_name: string
  last_name: string
  email: string
  user_type: 'regular' | 'company' | 'admin'
  profile_picture_url?: string
  company_name?: string
  city?: string
  country?: string
}

interface UserStore {
  user: User | null
  setUser: (user: User) => void
  clearUser: () => void
  updateUser: (updates: Partial<User>) => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => {
        console.log('Setting user in store:', user)
        set({ user })
      },
      clearUser: () => {
        console.log('Clearing user from store')
        set({ user: null })
      },
      updateUser: (updates) => {
        console.log('Updating user in store:', updates)
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }))
      },
    }),
    {
      name: 'user-store',
      version: 1,
      onRehydrateStorage: () => (state) => {
        console.log('Hydrated state:', state)
      },
    }
  )
)
