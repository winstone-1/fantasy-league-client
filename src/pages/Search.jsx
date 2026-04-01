import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import api from '../api/axios'


function Search() {
  const [query, setQuery]       = useState('')
  const [sport, setSport]       = useState('basketball')
  const [players, setPlayers]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [searched, setSearched] = useState(false)
  const [myTeams, setMyTeams]   = useState([])
  const [adding, setAdding]     = useState(null)
  const [showPicker, setShowPicker] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')

  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { fetchMyTeams() }, [])

  const fetchMyTeams = async () => {
    try {
      const leaguesRes = await api.get('/leagues')
      const teams = []
      for (const league of leaguesRes.data) {
        const teamsRes = await api.get(`/leagues/${league._id}/teams`)
        const myTeam = teamsRes.data.find(t =>
          t.owner?._id === user?._id || t.owner?.email === user?.email
        )
        if (myTeam) {
          teams.push({ ...myTeam, leagueId: league._id, leagueName: league.name, sport: league.sport })
        }
      }
      setMyTeams(teams)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError('')
    setSearched(true)
    try {
      const res = await api.get(`/players/search?q=${query}&sport=${sport}`)
      setPlayers(res.data.players || [])
    } catch (err) {
      setError('Search failed — please try again')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToTeam = async (player, team) => {
    setAdding(player._id)
    try {
      await api.post(`/leagues/${team.leagueId}/teams/${team._id}/players`, {
        playerId: player._id
      })
      setSuccessMsg(`${player.name} added to ${team.name}!`)
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add player')
      setTimeout(() => setError(''), 3000)
    } finally {
      setAdding(null)
      setShowPicker(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-8 py-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Player Search</h1>
          <p className="text-gray-400 mt-1">Find real NBA and EPL players for your fantasy team</p>
        </div>

        {/* Success toast */}
        {successMsg && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2">
            <span>✓</span> {successMsg}
          </div>
        )}

        {/* Error toast */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Search bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2 bg-gray-900 p-1 rounded-xl border border-gray-800">
              <button
                type="button"
                onClick={() => setSport('basketball')}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
                  sport === 'basketball' ? 'bg-green-500 text-gray-950' : 'text-gray-400 hover:text-white'
                }`}
              >🏀 NBA</button>
              <button
                type="button"
                onClick={() => setSport('soccer')}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
                  sport === 'soccer' ? 'bg-green-500 text-gray-950' : 'text-gray-400 hover:text-white'
                }`}
              >⚽ EPL</button>
            </div>

            <div className="flex flex-1 gap-3">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={sport === 'basketball' ? 'Search e.g. LeBron James...' : 'Search e.g. Mohamed Salah...'}
                className="flex-1 bg-gray-900 border border-gray-800 text-white rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-green-500 transition"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-green-500 hover:bg-green-400 disabled:opacity-50 text-gray-950 font-bold px-8 py-3 rounded-xl transition"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </form>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 animate-pulse">
                <div className="w-16 h-16 rounded-full bg-gray-800 mx-auto mb-3"/>
                <div className="h-4 bg-gray-800 rounded mb-2"/>
                <div className="h-3 bg-gray-800 rounded w-2/3 mx-auto"/>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && searched && players.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-400 text-lg">No players found for "{query}"</p>
            <p className="text-gray-600 text-sm mt-1">Try a different name or switch sport</p>
          </div>
        )}

        {/* Default state */}
        {!loading && !searched && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">{sport === 'basketball' ? '🏀' : '⚽'}</div>
            <p className="text-gray-400 text-lg">Search for your favourite players</p>
            <p className="text-gray-600 text-sm mt-1">
              {sport === 'basketball' ? 'Try LeBron, Curry, Durant...' : 'Try Salah, Haaland, De Bruyne...'}
            </p>
          </div>
        )}

        {/* Results grid */}
        {!loading && players.length > 0 && (
          <>
            <p className="text-gray-400 text-sm mb-4">{players.length} player{players.length !== 1 ? 's' : ''} found</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {players.map(player => (
                <div
                  key={player._id}
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-green-500 transition group"
                >
                  {/* Photo */}
                  <div className="relative mx-auto w-16 h-16 mb-3">
                    {player.photo ? (
                      <img
                        src={player.photo}
                        alt={player.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-700 group-hover:border-green-500 transition"
                        onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                      />
                    ) : null}
                    <div
                      className="w-16 h-16 rounded-full bg-gray-800 border-2 border-gray-700 items-center justify-center text-2xl"
                      style={{ display: player.photo ? 'none' : 'flex' }}
                    >
                      {sport === 'basketball' ? '🏀' : '⚽'}
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gray-950 flex items-center justify-center text-xs">
                      {sport === 'basketball' ? '🏀' : '⚽'}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="text-center">
                    <h3 className="font-semibold text-white text-sm leading-tight">{player.name}</h3>
                    <p className="text-gray-400 text-xs mt-1">{player.team || 'Unknown'}</p>
                    <div className="flex justify-center gap-1 mt-2 flex-wrap">
                      {player.position && (
                        <span className="text-xs bg-gray-800 text-green-400 px-2 py-0.5 rounded-full">
                          {player.position}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add to team button */}
                  {myTeams.length > 0 ? (
                    <div className="relative mt-3">
                      <button
                        onClick={() => setShowPicker(showPicker === player._id ? null : player._id)}
                        disabled={adding === player._id}
                        className="w-full py-1.5 rounded-lg bg-gray-800 hover:bg-green-500 hover:text-gray-950 text-gray-300 text-xs font-medium transition disabled:opacity-50"
                      >
                        {adding === player._id ? 'Adding...' : '+ Add to Team'}
                      </button>

                      {/* Team picker dropdown */}
                      {showPicker === player._id && (
                        <div className="absolute bottom-full left-0 right-0 mb-1 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden z-10">
                          {myTeams.map(team => (
                            <button
                              key={team._id}
                              onClick={() => handleAddToTeam(player, team)}
                              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-700 transition border-b border-gray-700 last:border-0"
                            >
                              <p className="text-white font-medium">{team.name}</p>
                              <p className="text-gray-400">{team.leagueName} · {team.sport}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => navigate('/leagues')}
                      className="w-full mt-3 py-1.5 rounded-lg bg-gray-800 text-gray-500 text-xs transition hover:text-gray-300"
                    >
                      Create a team first
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      
    </div>
  )
}

export default Search