import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '../services/api'

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextData {
  user: User | null
  signIn: (token: string, user: User) => void
  signOut: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('cobrei:token')
    const storedUser = localStorage.getItem('cobrei:user')

    if (token && storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const signIn = (token: string, user: User) => {
    localStorage.setItem('cobrei:token', token)
    localStorage.setItem('cobrei:user', JSON.stringify(user))
    setUser(user)
  }

  const signOut = () => {
    localStorage.removeItem('cobrei:token')
    localStorage.removeItem('cobrei:user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
