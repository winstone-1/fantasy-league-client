import { Link } from 'react-router-dom'
import { FaTrophy, FaFutbol, FaBasketballBall } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className="border-t border-gray-800 bg-gray-950 mt-auto">
      <div className="max-w-5xl mx-auto px-8 py-10">

        <div className="flex flex-wrap justify-between items-start gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-green-400 text-xl"><FaTrophy /></span>
              <span className="text-green-400 font-bold text-lg">FantasyLeague</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Your all-in-one fantasy league<br />dashboard for EPL &amp; NBA.
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-6">
            {[
              { label: 'Dashboard',   path: '/' },
              { label: 'Standings',   path: '/standings' },
              { label: 'Live Scores', path: '/livematches' },
              { label: 'Players',     path: '/search' },
              { label: 'Profile',     path: '/profile' },
            ].map(({ label, path }) => (
              <Link
                key={path}
                to={path}
                className="text-gray-400 text-sm hover:text-white transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-wrap justify-between items-center gap-4">
          <p className="text-gray-600 text-xs">
            © 2026 FantasyLeague · Built for the capstone 
          </p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 rounded-full px-3 py-1 text-xs text-gray-400">
              <FaFutbol className="text-green-400" /> EPL
            </span>
            <span className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 rounded-full px-3 py-1 text-xs text-gray-400">
              <FaBasketballBall className="text-orange-400" /> NBA
            </span>
            <span className="text-gray-600 text-xs">Season 2026</span>
          </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer