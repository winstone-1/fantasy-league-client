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

  const register = async (username, email, password) => {
    const res = await api.post('/auth/register', { username, email, password })
    localStorage.setItem('token', res.data.token)
    setToken(res.data.token)
    setUser(res.data)
    return res.data
  }

  const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, provider)
  const firebaseUser = result.user

  const res = await api.post('/auth/google', {
    email:    firebaseUser.email,
    username: firebaseUser.displayName?.replace(/\s+/g, '').toLowerCase(),
    photo:    firebaseUser.photoURL
  })

  // use MongoDB user, not Firebase user
  localStorage.setItem('token', res.data.token)
  localStorage.removeItem('googleUser')
  setToken(res.data.token)
  setUser(res.data)
  return res.data
}

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('googleUser')
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