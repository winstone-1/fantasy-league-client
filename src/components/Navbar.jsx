import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaTrophy, FaBars, FaTimes } from 'react-icons/fa'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { label: 'Dashboard',   path: '/' },
    { label: 'My Leagues',  path: '/leagues' },
    { label: 'My Team',     path: '/teams' },
    { label: 'Players',     path: '/search' },
    { label: 'Standings',   path: '/standings' },
    { label: 'Live Scores', path: '/livematches' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
    setMenuOpen(false)
  }

  const handleNav = (path) => {
    navigate(path)
    setMenuOpen(false)
  }

  return (
    <>
      <nav className="border-b border-gray-800 bg-gray-950 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">

          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer shrink-0"
            onClick={() => handleNav('/')}
          >
            <span className="text-green-400 text-xl"><FaTrophy /></span>
            <span className="text-green-400 font-bold text-lg">FantasyLeague</span>
          </div>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1">
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

          {/* Desktop user */}
          <div className="hidden lg:flex items-center gap-3">
            {user?.photo && (
              <img src={user.photo} className="w-8 h-8 rounded-full" alt="User" />
            )}
            <Link
              to="/profile"
              className="text-white hover:text-green-400 transition text-sm"
            >
              {user?.username || user?.email?.split('@')[0]}
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-400 transition px-3 py-1.5 rounded-lg hover:bg-red-500/10"
            >
              Logout
            </button>
          </div>

          {/* Mobile right side — avatar + hamburger */}
          <div className="flex lg:hidden items-center gap-3">
            {user?.photo && (
              <img src={user.photo} className="w-8 h-8 rounded-full" alt="User" />
            )}
            <button
              onClick={() => setMenuOpen(prev => !prev)}
              className="text-gray-400 hover:text-white transition p-1"
              aria-label="Toggle menu"
            >
              {menuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>

        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setMenuOpen(false)}
          />

          {/* Slide-in panel */}
          <div className="fixed top-0 right-0 h-full w-72 bg-gray-950 border-l border-gray-800 z-50 lg:hidden flex flex-col shadow-2xl
            animate-in slide-in-from-right duration-200">

            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <span className="text-green-400"><FaTrophy /></span>
                <span className="text-green-400 font-bold">FantasyLeague</span>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="text-gray-400 hover:text-white transition p-1"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* User info */}
            <div className="px-5 py-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                {user?.photo
                  ? <img src={user.photo} className="w-10 h-10 rounded-full" alt="User" />
                  : (
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-sm">
                      {(user?.username || user?.email || '?')[0].toUpperCase()}
                    </div>
                  )
                }
                <div>
                  <p className="text-white font-semibold text-sm">
                    {user?.username || user?.email?.split('@')[0]}
                  </p>
                  <p className="text-gray-500 text-xs">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Nav links */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {links.map(link => (
                <button
                  key={link.path}
                  onClick={() => handleNav(link.path)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition flex items-center gap-3 ${
                    location.pathname === link.path
                      ? 'bg-gray-800 text-white border border-gray-700'
                      : 'text-gray-400 hover:text-white hover:bg-gray-900'
                  }`}
                >
                  {location.pathname === link.path && (
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                  )}
                  {link.label}
                </button>
              ))}
            </div>

            {/* Bottom actions */}
            <div className="px-3 py-4 border-t border-gray-800 space-y-2">
              <button
                onClick={() => handleNav('/profile')}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-900 transition"
              >
                My Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition"
              >
                Logout
              </button>
            </div>

          </div>
        </>
      )}
    </>
  )
}

export default Navbar