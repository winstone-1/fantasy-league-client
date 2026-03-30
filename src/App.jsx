import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Search from './pages/Search'
import Standings from './pages/Standings'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/search"    element={<ProtectedRoute><Search /></ProtectedRoute>} />
        <Route path="/standings" element={<ProtectedRoute><Standings /></ProtectedRoute>} />
        <Route path="*"          element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App