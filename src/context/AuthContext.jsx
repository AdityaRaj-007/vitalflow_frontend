import { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null)
  const navigate = useNavigate()

  const login = (role) => {
    setAuth({
      role,
      name: role === 'doctor' ? 'Dr. Sarah Chen' : 'James Park',
      id:   role === 'doctor' ? 'DOC-1042' : 'P-20391',
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
