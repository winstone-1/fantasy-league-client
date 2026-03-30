import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <Navbar />
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">🏆 Fantasy League</h1>
          <button
            onClick={handleLogout}
            className="bg-gray-800 hover:bg-gray-700 text-sm px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>

        {/* Welcome card */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-6">
          <div className="flex items-center gap-4">
            {user?.photo && (
              <img src={user.photo} className="w-14 h-14 rounded-full" />
            )}
            <div>
              <h2 className="text-xl font-semibold">
                Welcome, {user?.username || user?.email} 👋
              </h2>
              <p className="text-gray-400 text-sm">{user?.email}</p>
              <span className="text-xs bg-indigo-600 px-2 py-0.5 rounded-full mt-1 inline-block">
                {user?.isGoogle ? 'Google Account' : 'Member'}
              </span>
            </div>
          </div>
        </div>

        {/* Nav cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={() => navigate('/search')}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 cursor-pointer hover:border-indigo-500 transition"
          >
            <div className="text-3xl mb-2">🔍</div>
            <h3 className="font-semibold">Search Players</h3>
            <p className="text-gray-400 text-sm mt-1">Find real NBA and EPL players</p>
          </div>

          <div
            onClick={() => navigate('/standings')}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 cursor-pointer hover:border-indigo-500 transition"
          >
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-semibold">Standings</h3>
            <p className="text-gray-400 text-sm mt-1">View your league standings</p>
          </div>

          <div
            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 cursor-pointer hover:border-indigo-500 transition"
          >
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-semibold">Live Matches</h3>
            <p className="text-gray-400 text-sm mt-1">Track live scores</p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Dashboard