import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Search from './pages/Search'
import Standings from './pages/Standings'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute'
import League from './pages/League'
import MyTeam from './pages/Teams'
import LeagueDetail from './pages/LeagueDetail'
import LiveMatches from './pages/Livematches'
import UserProfile from './pages/userProfile'
import MatchManagement from './pages/MatchManagement'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/leagues"   element={<ProtectedRoute><League /></ProtectedRoute>} />
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/search"    element={<ProtectedRoute><Search /></ProtectedRoute>} />
        <Route path="/standings" element={<ProtectedRoute><Standings /></ProtectedRoute>} />
        <Route path="/livematches" element={<ProtectedRoute><LiveMatches /></ProtectedRoute>} />
        <Route path="/teams" element={<ProtectedRoute><MyTeam /></ProtectedRoute>} />
        <Route path="/leagues/:id" element={<ProtectedRoute><LeagueDetail /></ProtectedRoute>} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/commissioner/matches" element={<MatchManagement />} />
        <Route path="*"          element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App