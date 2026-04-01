import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import api from '../api/axios'

// ── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??'

const avatarColor = (name = '') => {
  const colors = [
    'from-green-500 to-emerald-700',
    'from-blue-500 to-indigo-700',
    'from-purple-500 to-violet-700',
    'from-amber-500 to-orange-700',
    'from-rose-500 to-red-700',
    'from-cyan-500 to-teal-700',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

const sportLabel = (sport) => {
  const map = { soccer: '⚽ EPL', basketball: '🏀 NBA', football: '🏈 NFL', baseball: '⚾ MLB' }
  return map[sport] || sport
}

// ── Sub-components ────────────────────────────────────────────────────────────

const StatPill = ({ label, value, accent = 'text-white' }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
    <p className={`text-2xl font-bold ${accent}`}>{value}</p>
    <p className="text-gray-500 text-xs mt-1">{label}</p>
  </div>
)

const LeagueCard = ({ league, userId, standings }) => {
  const isCommissioner = league.commissioner?._id === userId ||
                         league.commissioner === userId

  const myEntry = standings?.find(s =>
    s.owner?._id === userId || s.owner?.email === userId
  )
 const rank = myEntry?.rank ?? (standings?.findIndex(
  s => s.owner?._id === userId || s.owner?.email === userId
) + 1 || null);
  return (
    <div className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-2xl p-5 transition-all duration-200">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-white font-semibold truncate">{league.name}</p>
            {isCommissioner && (
              <span className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded-full shrink-0">
                👑 Commissioner
              </span>
            )}
          </div>
          <p className="text-gray-500 text-xs mt-0.5">Season {league.season ?? '—'}</p>
        </div>
        <span className="text-xs bg-gray-800 text-gray-400 px-2.5 py-1 rounded-full shrink-0">
          {sportLabel(league.sport)}
        </span>
      </div>

      <div className="flex items-center gap-4 mt-4">
        {/* Rank */}
        <div className="flex items-center gap-1.5">
          <span className="text-gray-600 text-xs">Rank</span>
          <span className="text-white font-bold text-sm">
            {rank > 0 ? `#${rank}` : '—'}
          </span>
        </div>

        <div className="w-px h-4 bg-gray-800" />

        {/* Members */}
        <div className="flex items-center gap-1.5">
          <span className="text-gray-600 text-xs">Members</span>
          <span className="text-white font-bold text-sm">{league.members?.length ?? 0}</span>
        </div>

        <div className="w-px h-4 bg-gray-800" />

        {/* Privacy */}
        <div className="flex items-center gap-1.5">
          <span className={`text-xs ${league.isPrivate ? 'text-red-400' : 'text-green-400'}`}>
            {league.isPrivate ? '🔒 Private' : '🌐 Public'}
          </span>
        </div>

        {/* Invite code — only shown to commissioner */}
        {isCommissioner && league.inviteCode && (
          <>
            <div className="w-px h-4 bg-gray-800" />
            <div className="flex items-center gap-1.5">
              <span className="text-gray-600 text-xs">Code</span>
              <span className="text-green-400 font-mono font-bold text-xs tracking-widest">
                {league.inviteCode}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

function UserProfile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [leagues,    setLeagues]    = useState([])
  const [standings,  setStandings]  = useState({}) // { leagueId: [...] }
  const [loading,    setLoading]    = useState(true)
  const [editMode,   setEditMode]   = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [saving,     setSaving]     = useState(false)
  const [saveMsg,    setSaveMsg]    = useState('')

  useEffect(() => {
    setDisplayName(user?.username || '')
    fetchLeagues()
  }, [user])

  const fetchLeagues = async () => {
    try {
      const res = await api.get('/leagues')
      setLeagues(res.data)

      // Fetch standings for each league in parallel
      const standingsMap = {}
      await Promise.all(
        res.data.map(async (league) => {
          try {
            const s = await api.get(`/leagues/${league._id}/standings`)
            standingsMap[league._id] = s.data.standings || []
          } catch {
            standingsMap[league._id] = []
          }
        })
      )
      setStandings(standingsMap)
    } catch {
      // silently fail — leagues section just shows empty
    } finally {
      setLoading(false)
    }
  }

  const handleSaveName = async () => {
    if (!displayName.trim() || displayName === user?.username) {
      setEditMode(false)
      return
    }
    setSaving(true)
    try {
      await api.put('/auth/me', { username: displayName.trim() })
      setSaveMsg('Name updated!')
      setEditMode(false)
      setTimeout(() => setSaveMsg(''), 3000)
    } catch {
      setSaveMsg('Failed to update')
      setTimeout(() => setSaveMsg(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Derived stats
  const commissionerCount = leagues.filter(l =>
    l.commissioner?._id === user?._id || l.commissioner === user?._id
  ).length

  const totalPoints = Object.entries(standings).reduce((sum, [leagueId, entries]) => {
    const me = entries.find(s => s.owner?._id === user?._id || s.owner?.email === user?.email)
    return sum + (me?.totalPoints ?? 0)
  }, 0)

  const gradient = avatarColor(user?.username || user?.email || '')

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-8 space-y-6">

        {/* ── Avatar + Identity ── */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">

            {/* Avatar */}
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl font-black text-white shrink-0 shadow-lg`}>
              {getInitials(user?.username || user?.email)}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              {editMode ? (
                <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                  <input
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-green-500 transition"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={saving}
                    className="text-xs bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                  >
                    {saving ? '...' : 'Save'}
                  </button>
                  <button
                    onClick={() => { setEditMode(false); setDisplayName(user?.username || '') }}
                    className="text-xs text-gray-500 hover:text-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                  <h1 className="text-xl font-bold text-white">
                    {user?.username || user?.email?.split('@')[0]}
                  </h1>
                  <button
                    onClick={() => setEditMode(true)}
                    className="text-gray-600 hover:text-gray-400 transition text-sm"
                    title="Edit name"
                  >
                    ✏️
                  </button>
                </div>
              )}

              {saveMsg && (
                <p className="text-green-400 text-xs mb-1">{saveMsg}</p>
              )}

              <p className="text-gray-400 text-sm">{user?.email}</p>

              <div className="flex items-center gap-2 justify-center sm:justify-start mt-2 flex-wrap">
                {/* Role badge */}
                <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${
                  user?.role === 'admin'
                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                    : 'bg-green-500/10 text-green-400 border-green-500/20'
                }`}>
                  {user?.role === 'admin' ? '⚙️ Admin' : '🏅 Member'}
                </span>

                {/* Joined date */}
                <span className="text-xs text-gray-600">
                  Joined {formatDate(user?.createdAt)}
                </span>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="shrink-0 text-xs text-gray-500 hover:text-red-400 border border-gray-800 hover:border-red-500/30 px-4 py-2 rounded-xl transition"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-3">
          <StatPill label="Leagues"       value={leagues.length}    accent="text-white" />
          <StatPill label="Commissioner"  value={commissionerCount} accent="text-yellow-400" />
          <StatPill label="Total Points"  value={totalPoints}       accent="text-green-400" />
        </div>

        {/* ── Leagues ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold text-base">My Leagues</h2>
            <button
              onClick={() => navigate('/leagues')}
              className="text-green-400 text-sm hover:text-green-300 transition"
            >
              Manage →
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 animate-pulse">
                  <div className="h-4 bg-gray-800 rounded w-1/3 mb-3" />
                  <div className="h-3 bg-gray-800 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : leagues.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
              <p className="text-4xl mb-3">🏟️</p>
              <p className="text-gray-400 text-sm">You haven't joined any leagues yet</p>
              <button
                onClick={() => navigate('/leagues')}
                className="mt-4 bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-6 py-2 rounded-xl transition text-sm"
              >
                Browse Leagues
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {leagues.map(league => (
                <LeagueCard
                  key={league._id}
                  league={league}
                  userId={user?._id}
                  standings={standings[league._id]}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Quick actions ── */}
        <div className="grid grid-cols-2 gap-3 pb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-900 border border-gray-800 hover:border-green-500 rounded-2xl p-4 text-left transition"
          >
            <div className="text-2xl mb-1">🏠</div>
            <p className="text-sm font-medium text-white">Dashboard</p>
          </button>
          <button
            onClick={() => navigate('/standings')}
            className="bg-gray-900 border border-gray-800 hover:border-green-500 rounded-2xl p-4 text-left transition"
          >
            <div className="text-2xl mb-1">📊</div>
            <p className="text-sm font-medium text-white">Standings</p>
          </button>
        </div>

      </div>

      <Footer />
    </div>
  )
}

export default UserProfile