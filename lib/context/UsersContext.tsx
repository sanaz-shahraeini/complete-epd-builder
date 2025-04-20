"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getCompanyUsers, type UserProfile } from '@/lib/api/auth'

interface User extends UserProfile {}

interface UsersContextType {
  users: User[]
  isLoading: boolean
  error: Error | null
  refetchUsers: () => Promise<void>
}

const UsersContext = createContext<UsersContextType | undefined>(undefined)

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const data = await getCompanyUsers()
      setUsers(data)
    } catch (error) {
      setError(error as Error)
      console.error('Error fetching users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <UsersContext.Provider value={{ users, isLoading, error, refetchUsers: fetchUsers }}>
      {children}
    </UsersContext.Provider>
  )
}

export function useUsers() {
  const context = useContext(UsersContext)
  if (context === undefined) {
    throw new Error('useUsers must be used within a UsersProvider')
  }
  return context
}
