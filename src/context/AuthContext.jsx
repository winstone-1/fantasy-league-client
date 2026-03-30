import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'
import { auth, provider, signInWithPopup } from '../firebase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      api.get('/auth/me')
        .then(res => setUser(res.data))
        .catch(() => logout())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', res.data.token)
    setToken(res.data.token)
    setUser(res.data)
    return res.data
  }
  
  const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, provider)
  const idToken = await result.user.getIdToken()
  const res = await api.post('/auth/google', { idToken })
  localStorage.setItem('token', res.data.token)
  setToken(res.data.token)
  setUser(res.data)
  return res.data
}

  const register = async (username, email, password) => {
    const res = await api.post('/auth/register', { username, email, password })
    localStorage.setItem('token', res.data.token)
    setToken(res.data.token)
    setUser(res.data)
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
   <AuthContext.Provider value={{ user, token, loading, login, register, logout, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>

  )
}

export const useAuth = () => useContext(AuthContext)