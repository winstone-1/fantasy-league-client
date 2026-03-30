import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

function Standings() {
  const [standings, setStandings] = useState([])
  const [league, setLeague]       = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const leaguesRes = await api.get('/leagues')
        if (leaguesRes.data.length === 0) {
          setLoading(false)
          return
        }
        const firstLeague = leaguesRes.data[0]
        setLeague(firstLeague)
        const standingsRes = await api.get(`/leagues/${firstLeague._id}/standings`)
        setStandings(standingsRes.data.standings || [])
      } catch (err) {
        setError('Failed to load standings')
      } finally {
        setLoading(false)
      }
    }
    fetchStandings()
  }, [])

  const getRankBadge = (rank) => {
    if (rank === 1) return { bg: 'bg-yellow-500', text: '🥇' }
    if (rank === 2) return { bg: 'bg-gray-400', text: '🥈' }
    if (rank === 3) return { bg: 'bg-amber-600', text: '🥉' }
    return { bg: 'bg-gray-700', text: rank }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      <Navbar />

      <div className="max-w-5xl mx-auto px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">League Standings</h1>
            {league && (
              <p className="text-gray-400 mt-1">{league.name} · {league.sport} · Season {league.season}</p>
            )}
          </div>
          {league && (
            <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-full">
              {league.sport === 'soccer' ? '⚽ EPL' : '🏀 NBA'}
            </span>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-800"/>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-800 rounded w-1/3 mb-2"/>
                    <div className="h-3 bg-gray-800 rounded w-1/4"/>
                  </div>
                  <div className="h-6 bg-gray-800 rounded w-16"/>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {/* No league */}
        {!loading && !league && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📊</div>
            <p className="text-gray-400 text-lg">You're not in any league yet</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-6 py-2 rounded-xl transition"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {/* Table header */}
        {!loading && standings.length > 0 && (
          <>
            <div className="grid grid-cols-6 text-xs text-gray-500 uppercase tracking-wider px-5 mb-2">
              <span className="col-span-1">Rank</span>
              <span className="col-span-2">Team</span>
              <span className="col-span-1 text-center">Players</span>
              <span className="col-span-1 text-center">Points</span>
              <span className="col-span-1 text-right">Owner</span>
            </div>

            {/* Standings rows */}
            <div className="space-y-3">
              {standings.map((entry) => {
                const badge = getRankBadge(entry.rank)
                const isMe = entry.owner?._id === user?._id || entry.owner?.email === user?.email

                return (
                  <div
                    key={entry.teamId}
                    className={`relative bg-gray-900 border rounded-2xl p-5 transition ${
                      isMe
                        ? 'border-green-500 bg-green-500/5'
                        : 'border-gray-800 hover:border-gray-600'
                    }`}
                  >
                    {/* Your team indicator */}
                    {isMe && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-green-500 rounded-r-full"/>
                    )}

                    <div className="grid grid-cols-6 items-center">

                      {/* Rank */}
                      <div className="col-span-1 flex items-center">
                        <div className={`w-9 h-9 rounded-full ${badge.bg} flex items-center justify-center text-sm font-bold text-white`}>
                          {typeof badge.text === 'number' ? badge.text : badge.text}
                        </div>
                      </div>

                      {/* Team name */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm">
                            ⚡
                          </div>
                          <div>
                            <p className="font-semibold text-white text-sm">{entry.name}</p>
                            {isMe && (
                              <span className="text-xs bg-green-500 text-gray-950 font-bold px-1.5 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Players */}
                      <div className="col-span-1 text-center">
                        <span className="text-gray-400 text-sm">{entry.players}</span>
                      </div>

                      {/* Points */}
                      <div className="col-span-1 text-center">
                        <span className="text-white font-bold text-lg">{entry.totalPoints}</span>
                      </div>

                      {/* Owner */}
                      <div className="col-span-1 text-right">
                        <span className="text-gray-400 text-sm">
                          {isMe ? 'You' : entry.owner?.username || 'Unknown'}
                        </span>
                      </div>

                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

      </div>
    </div>
  )
}

export default Standings