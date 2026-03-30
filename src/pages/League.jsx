import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

function League() {
  const [leagues, setLeagues]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [showCreate, setShowCreate]   = useState(false)
  const [showJoin, setShowJoin]       = useState(false)
  const [inviteCode, setInviteCode]   = useState('')
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState('')

  const [form, setForm] = useState({
    name: '', sport: 'soccer', maxTeams: 8, isPrivate: false, season: '2025'
  })

  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchLeagues()
  }, [])

  const fetchLeagues = async () => {
    try {
      const res = await api.get('/leagues')
      setLeagues(res.data)
    } catch (err) {
      setError('Failed to load leagues')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/leagues', form)
      setSuccess('League created!')
      setShowCreate(false)
      fetchLeagues()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create league')
    }
  }

  const handleJoin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await api.get('/leagues')
      const allLeagues = res.data
      const target = allLeagues.find(l => l.inviteCode === inviteCode.toUpperCase())
      if (!target) return setError('Invalid invite code')
      await api.post(`/leagues/${target._id}/join`, { inviteCode })
      setSuccess('Joined league!')
      setShowJoin(false)
      fetchLeagues()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join league')
    }
  }

  return (
   
    <div className="min-h-screen bg-gray-950 text-white">

        <Navbar />

      <div className="max-w-4xl mx-auto px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Leagues</h1>
            <p className="text-gray-400 mt-1">Create or join a fantasy league</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setShowJoin(true); setShowCreate(false); setError('') }}
              className="px-5 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:border-green-500 hover:text-green-400 text-sm font-medium transition"
            >
              + Join League
            </button>
            <button
              onClick={() => { setShowCreate(true); setShowJoin(false); setError('') }}
              className="px-5 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-gray-950 text-sm font-bold transition"
            >
              + Create League
            </button>
          </div>
        </div>

        {/* Success */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl mb-6 text-sm">
            {success}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Create League Form */}
        {showCreate && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Create a new league</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">League Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Winstone's Premier League"
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Sport</label>
                  <select
                    value={form.sport}
                    onChange={e => setForm({ ...form, sport: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition"
                  >
                    <option value="soccer">⚽ Soccer / EPL</option>
                    <option value="basketball">🏀 Basketball / NBA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Max Teams</label>
                  <select
                    value={form.maxTeams}
                    onChange={e => setForm({ ...form, maxTeams: Number(e.target.value) })}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition"
                  >
                    {[4, 6, 8, 10, 12].map(n => (
                      <option key={n} value={n}>{n} teams</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={form.isPrivate}
                  onChange={e => setForm({ ...form, isPrivate: e.target.checked })}
                  className="w-4 h-4 accent-green-500"
                />
                <label htmlFor="isPrivate" className="text-sm text-gray-400">
                  Private league (invite code required to join)
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-6 py-2.5 rounded-xl transition text-sm"
                >
                  Create League
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="text-gray-400 hover:text-white px-6 py-2.5 rounded-xl transition text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Join League Form */}
        {showJoin && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Join a league</h2>
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Invite Code</label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={e => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="e.g. AD7F61BC"
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition font-mono tracking-widest"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-6 py-2.5 rounded-xl transition text-sm"
                >
                  Join League
                </button>
                <button
                  type="button"
                  onClick={() => setShowJoin(false)}
                  className="text-gray-400 hover:text-white px-6 py-2.5 rounded-xl transition text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Leagues list */}
        {loading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 animate-pulse">
                <div className="h-5 bg-gray-800 rounded w-1/3 mb-2"/>
                <div className="h-4 bg-gray-800 rounded w-1/4"/>
              </div>
            ))}
          </div>
        )}

        {!loading && leagues.length === 0 && !showCreate && !showJoin && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🏟️</div>
            <p className="text-gray-400 text-lg">You're not in any leagues yet</p>
            <p className="text-gray-600 text-sm mt-1">Create one or join with an invite code</p>
          </div>
        )}

        {!loading && leagues.length > 0 && (
          <div className="space-y-3">
            {leagues.map(league => (
              <div
                key={league._id}
                onClick={() => navigate(`/leagues/${league._id}`)}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-green-500 transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-2xl">
                      {league.sport === 'soccer' ? '⚽' : '🏀'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{league.name}</h3>
                      <p className="text-gray-400 text-sm">
                        {league.members?.length} members · Season {league.season}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {league.commissioner?._id === user?._id && (
                      <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/30 px-2 py-1 rounded-full">
                        Commissioner
                      </span>
                    )}
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Invite Code</p>
                      <p className="font-mono text-green-400 text-sm font-bold">{league.inviteCode}</p>
                    </div>
                    <span className="text-gray-600">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default League