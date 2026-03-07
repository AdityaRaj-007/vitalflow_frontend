import { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null)
  const navigate = useNavigate()

  const login = (role, data = {}) => {
    setAuth({
      role,
      name: data.name ?? (role === 'doctor' ? 'Dr. Sarah Chen' : 'James Park'),
      id:   data.id ?? (role === 'doctor' ? 'DOC-1042' : 'P-20391'),
      email: data.email,
    })
  }

  const logout = () => {setAuth(null)
    navigate('/', { replace: true })
  }

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
