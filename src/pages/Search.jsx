import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

function Search() {
  const [query, setQuery]       = useState('')
  const [sport, setSport]       = useState('basketball')
  const [players, setPlayers]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [searched, setSearched] = useState(false)

  const navigate = useNavigate()

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

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-green-400 text-2xl">🏆</span>
          <span className="text-green-400 font-bold text-xl">FantasySports</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <button onClick={() => navigate('/')} className="hover:text-white transition">Dashboard</button>
          <button className="text-white font-medium bg-gray-800 px-4 py-2 rounded-lg">Players</button>
          <button onClick={() => navigate('/standings')} className="hover:text-white transition">Standings</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Player Search</h1>
          <p className="text-gray-400 mt-1">Find real NBA and EPL players for your fantasy team</p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-3">

            {/* Sport toggle */}
            <div className="flex gap-2 bg-gray-900 p-1 rounded-xl border border-gray-800">
              <button
                type="button"
                onClick={() => setSport('basketball')}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
                  sport === 'basketball'
                    ? 'bg-green-500 text-gray-950'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🏀 NBA
              </button>
              <button
                type="button"
                onClick={() => setSport('soccer')}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
                  sport === 'soccer'
                    ? 'bg-green-500 text-gray-950'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                ⚽ EPL
              </button>
            </div>

            {/* Input */}
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

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
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
            <div className="text-5xl mb-4">
              {sport === 'basketball' ? '🏀' : '⚽'}
            </div>
            <p className="text-gray-400 text-lg">Search for your favourite players</p>
            <p className="text-gray-600 text-sm mt-1">
              {sport === 'basketball' ? 'Try searching LeBron, Curry, Durant...' : 'Try searching Salah, Haaland, De Bruyne...'}
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && players.length > 0 && (
          <>
            <p className="text-gray-400 text-sm mb-4">
              {players.length} player{players.length !== 1 ? 's' : ''} found
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {players.map(player => (
                <div
                  key={player._id}
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-green-500 transition cursor-pointer group"
                >
                  {/* Photo */}
                  <div className="relative mx-auto w-16 h-16 mb-3">
                    {player.photo ? (
                      <img
                        src={player.photo}
                        alt={player.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-700 group-hover:border-green-500 transition"
                        onError={e => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div
                      className="w-16 h-16 rounded-full bg-gray-800 border-2 border-gray-700 group-hover:border-green-500 transition items-center justify-center text-2xl"
                      style={{ display: player.photo ? 'none' : 'flex' }}
                    >
                      {sport === 'basketball' ? '🏀' : '⚽'}
                    </div>
                    {/* Sport badge */}
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
                      {player.nationality && (
                        <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                          {player.nationality}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add to team button */}
                  <button className="w-full mt-3 py-1.5 rounded-lg bg-gray-800 hover:bg-green-500 hover:text-gray-950 text-gray-400 text-xs font-medium transition">
                    + Add to Team
                  </button>
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