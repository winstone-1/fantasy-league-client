import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaTrophy } from 'react-icons/fa'
import { Link } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const links = [
    { label: 'Dashboard',  path: '/' },
    { label: 'My Leagues', path: '/leagues' },
    { label: 'My Team',    path: '/teams' },
    { label: 'Players',    path: '/search' },
    { label: 'Standings',  path: '/standings' },
    { label: 'Live Scores', path: '/livematches' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="border-b border-gray-800 bg-gray-950 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-8 py-4 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <span className="text-green-400 text-xl"><FaTrophy /></span>
          <span className="text-green-400 font-bold text-lg">FantasyLeague</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-1">
          {links.map(link => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                location.pathname === link.path
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* User */}
        <div className="flex items-center gap-3">
          {user?.photo && (
            <img src={user.photo} className="w-8 h-8 rounded-full" alt="User" />
          )}
          <Link to="/profile" className="text-white hover:text-green-400 transition text-sm">
            {user?.username || user?.email?.split('@')[0]}
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-400 transition px-3 py-1.5 rounded-lg hover:bg-red-500/10"
          >
            Logout
          </button>
        </div>

      </div>
    </nav>
  )
}

export default Navbar