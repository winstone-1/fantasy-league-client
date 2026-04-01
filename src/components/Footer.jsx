import { useNavigate, useLocation } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'Dashboard',   path: '/dashboard',  icon: '🏠' },
  { label: 'Standings',   path: '/standings',  icon: '📊' },
  { label: 'Live',        path: '/matches',    icon: '⚡' },
  { label: 'Players',     path: '/search',     icon: '🔍' },
  { label: 'Profile',     path: '/profile',    icon: '👤' },
]

function Footer() {
  const navigate  = useNavigate()
  const location  = useLocation()

  return (
    <footer className="bg-gray-950 border-t border-gray-800 mt-16">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Top row — brand + nav */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-8 mb-8">

          {/* Brand */}
          <div className="shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-green-400 text-xl">⚡</span>
              <span className="text-white font-bold text-lg tracking-tight">FantasyDash</span>
            </div>
            <p className="text-gray-500 text-xs max-w-[200px] leading-relaxed">
              Your all-in-one fantasy league dashboard for EPL &amp; NBA.
            </p>
          </div>

          {/* Nav links */}
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {NAV_LINKS.map(link => {
              const active = location.pathname === link.path
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`flex items-center gap-1.5 text-sm transition-colors ${
                    active
                      ? 'text-green-400'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <span className="text-base">{link.icon}</span>
                  {link.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} FantasyDash · Built for the capstone 🎓
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-1 rounded-full">
              ⚽ EPL
            </span>
            <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full">
              🏀 NBA
            </span>
            <span className="text-xs text-gray-600">Season 2025</span>
          </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer