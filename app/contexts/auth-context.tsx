"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  email: string
  name: string
  role: string
  avatar?: string 
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => boolean
  logout: () => void
  isAdmin: boolean
}

// Simulated user database with expanded user information
const USERS = [
  { 
    username: 'Akash', 
    password: 'Test@123', 
    role: 'admin',
    email: 'akash@test.com',
    name: 'Akash',
    avatar: '/akash_profile.png' 
  },
  { 
    username: 'Akshai', 
    password: 'Test@123', 
    role: 'user',
    email: 'akshai@test.com',
    name: 'Akshai',
    avatar: '/akshai_profile.png' 
  },
  { 
    username: 'Jennifer', 
    password: 'Test@123', 
    role: 'user',
    email: 'jennifer@test.com',
    name: 'Jennifer',
    avatar: '/jennifer_profile.png' 
  },
  { 
    username: 'Alsherin', 
    password: 'Test@123', 
    role: 'user',
    email: 'alsherin@test.com',
    name: 'Alsherin',
    avatar: '/alsherin_profile.png' 
  }
]

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => false,
  logout: () => {},
  isAdmin: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const login = (username: string, password: string) => {
    const foundUser = USERS.find(u => 
      u.username.toLowerCase() === username.toLowerCase() && 
      u.password === password
    )
  
    if (foundUser) {
      const userData: User = {
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role,
       avatar: foundUser.avatar
      }
      
      // Set cookie for authentication
      document.cookie = `user=${JSON.stringify(userData)}; path=/; max-age=86400`
      
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)