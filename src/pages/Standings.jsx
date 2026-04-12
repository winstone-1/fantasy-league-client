import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { FaFutbol, FaBasketballBall, FaChartBar, FaMedal } from 'react-icons/fa'

// ─── Helpers ────────────────────────────────────────────────────────────────

const getRankBadge = (rank) => {
  if (rank === 1) return { bg: 'bg-yellow-500',  label: <FaMedal className="text-white" /> }
  if (rank === 2) return { bg: 'bg-gray-400',    label: <FaMedal className="text-white" /> }
  if (rank === 3) return { bg: 'bg-amber-600',   label: <FaMedal className="text-white" /> }
  return           { bg: 'bg-gray-700',           label: rank  }
}

const getTrend = (currentRank, previousRank) => {
  if (previousRank == null || previousRank === currentRank)
    return { icon: '—', color: 'text-gray-600' }
  if (currentRank < previousRank)
    return { icon: '↑', color: 'text-green-400' }
  return { icon: '↓', color: 'text-red-400' }
}

const enrichEntry = (entry) => {
  const wins         = entry.wins         ?? 0
  const losses       = entry.losses       ?? 0
  const draws        = entry.draws        ?? 0
  const weeklyPoints = entry.weeklyPoints ?? null
  const name         = entry.name         ?? entry.teamName ?? 'Unknown'
  return { ...entry, name, wins, losses, draws, weeklyPoints }
}

// ─── Skeleton row ───────────────────────────────────────────────────────────

const SkeletonRow = () => (
  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-5 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-9 h-9 rounded-full bg-gray-800 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-800 rounded w-1/3" />
        <div className="h-3 bg-gray-800 rounded w-1/4" />
      </div>
      <div className="h-5 bg-gray-800 rounded w-16" />
    </div>
  </div>
)

// ─── Main component ─────────────────────────────────────────────────────────

function Standings() {
  const [leagues,   setLeagues]   = useState([])
  const [league,    setLeague]    = useState(null)
  const [standings, setStandings] = useState([])
  const [prevRanks, setPrevRanks] = useState({})
  const [loading,   setLoading]   = useState(true)
  const [switching, setSwitching] = useState(false)
  const [error,     setError]     = useState('')

  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const init = async () => {
      try {
        const res = await api.get('/leagues')
        if (res.data.length === 0) { setLoading(false); return }
        setLeagues(res.data)
        setLeague(res.data[0])
      } catch {
        setError('Failed to load leagues')
        setLoading(false)
      }
    }
    init()
  }, [])

  const fetchStandings = useCallback(async (selectedLeague) => {
    if (!selectedLeague) return
    try {
      const res = await api.get(`/leagues/${selectedLeague._id}/standings`)
      const raw = res.data.standings || []

      const storageKey = `standings_prev_${selectedLeague._id}`
      const stored = JSON.parse(localStorage.getItem(storageKey) || '{}')
      setPrevRanks(stored)

      const currentRanks = {}
      raw.forEach(e => { currentRanks[e.teamId] = e.rank })
      localStorage.setItem(storageKey, JSON.stringify(currentRanks))

      setStandings(raw.map(e => enrichEntry(e)))
      setError('')
    } catch {
      setError('Failed to load standings')
    }
  }, [])

  useEffect(() => {
    if (!league) return
    const run = async () => {
      await fetchStandings(league)
      setLoading(false)
    }
    run()
  }, [league, fetchStandings])

  const handleLeagueSwitch = async (leagueId) => {
    const selected = leagues.find(l => l._id === leagueId)
    if (!selected || selected._id === league?._id) return
    setSwitching(true)
    setStandings([])
    setLeague(selected)
    await fetchStandings(selected)
    setSwitching(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">League Standings</h1>
            {league && (
              <p className="text-gray-400 mt-1 text-sm">
                {league.name} · {league.sport} · Season {league.season ?? '—'}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {league && (
              <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-full shrink-0">
                {league.sport === 'soccer' ? <FaFutbol className="inline mr-1" /> : <FaBasketballBall className="inline mr-1" />}{league.sport === 'soccer' ? 'EPL' : 'NBA'}
              </span>
            )}
            {leagues.length > 1 && (
              <select
                value={league?._id ?? ''}
                onChange={e => handleLeagueSwitch(e.target.value)}
                className="bg-gray-900 border border-gray-700 text-white text-sm rounded-xl px-3 py-2
                           focus:outline-none focus:border-green-500 transition cursor-pointer"
              >
                {leagues.map(l => (
                  <option key={l._id} value={l._id}>{l.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !league && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4"><FaChartBar /></div>
            <p className="text-gray-400 text-lg">You're not in any league yet</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-6 py-2 rounded-xl transition"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {/* ── Loading skeleton ── */}
        {(loading || switching) && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        )}

        {/* ── Table ── */}
        {!loading && !switching && standings.length > 0 && (
          <>
            {/* Desktop column headers */}
            <div className="hidden sm:grid grid-cols-12 text-xs text-gray-500 uppercase tracking-wider px-5 mb-2">
              <span className="col-span-1">Rank</span>
              <span className="col-span-3">Team</span>
              <span className="col-span-2 text-center">Record</span>
              <span className="col-span-2 text-center">This GW</span>
              <span className="col-span-2 text-center">Total Pts</span>
              <span className="col-span-2 text-right">Owner</span>
            </div>

            {/* Rows */}
            <div className="space-y-3">
              {standings.map((entry) => {
                const badge = getRankBadge(entry.rank)
                const trend = getTrend(entry.rank, prevRanks[entry.teamId])
                const isMe  = entry.owner?.toString() === user?._id?.toString()
                           || entry.owner === user?._id

                return (
                  <div
                    key={entry.teamId}
                    className={`relative bg-gray-900 border rounded-2xl p-4 sm:p-5 transition-all duration-200 ${
                      isMe
                        ? 'border-green-500 bg-green-500/5'
                        : 'border-gray-800 hover:border-gray-600'
                    }`}
                  >
                    {isMe && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-green-500 rounded-r-full" />
                    )}

                    {/* Mobile layout */}
                    <div className="sm:hidden flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${badge.bg} flex items-center justify-center text-sm font-bold text-white shrink-0`}>
                        {badge.label}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-white text-sm truncate">{entry.name}</p>
                          {isMe && (
                            <span className="text-xs bg-green-500 text-gray-950 font-bold px-1.5 py-0.5 rounded-full shrink-0">
                              You
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs">
                          <span className="text-green-400 font-semibold">{entry.wins}W</span>
                          <span className="text-gray-600">·</span>
                          <span className="text-red-400 font-semibold">{entry.losses}L</span>
                          {entry.weeklyPoints != null && (
                            <>
                              <span className="text-gray-600">·</span>
                              <span className="text-blue-400">GW: +{entry.weeklyPoints}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-white font-bold text-lg">{entry.totalPoints}</span>
                        <p className="text-gray-600 text-xs">pts</p>
                      </div>
                    </div>

                    {/* Desktop layout */}
                    <div className="hidden sm:grid grid-cols-12 items-center gap-1">
                      <div className="col-span-1 flex items-center gap-1.5">
                        <div className={`w-9 h-9 rounded-full ${badge.bg} flex items-center justify-center text-sm font-bold text-white shrink-0`}>
                          {badge.label}
                        </div>
                        <span className={`text-base font-bold leading-none ${trend.color}`}>
                          {trend.icon}
                        </span>
                      </div>

                      <div className="col-span-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm shrink-0">
                            ⚡
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white text-sm truncate">{entry.name}</p>
                            {isMe && (
                              <span className="text-xs bg-green-500 text-gray-950 font-bold px-1.5 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="col-span-2 text-center">
                        <div className="flex items-center justify-center gap-1 text-sm font-mono">
                          <span className="text-green-400 font-semibold">{entry.wins}W</span>
                          <span className="text-gray-600">·</span>
                          <span className="text-red-400 font-semibold">{entry.losses}L</span>
                          {entry.draws > 0 && (
                            <>
                              <span className="text-gray-600">·</span>
                              <span className="text-gray-400 font-semibold">{entry.draws}D</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="col-span-2 text-center">
                        {entry.weeklyPoints != null ? (
                          <span className="text-blue-400 font-semibold text-sm">
                            +{entry.weeklyPoints}
                          </span>
                        ) : (
                          <span className="text-gray-600 text-sm">—</span>
                        )}
                      </div>

                      <div className="col-span-2 text-center">
                        <span className="text-white font-bold text-lg">{entry.totalPoints}</span>
                      </div>

                      <div className="col-span-2 text-right">
                        <span className="text-gray-400 text-sm truncate block">
                          {isMe ? 'You' : entry.owner?.username || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <p className="text-gray-600 text-xs text-center mt-6">
              Trend arrows reflect rank change since your last visit · GW = gameweek points
            </p>
          </>
        )}

      </div>
      <Footer />
    </div>
  )
}

export default Standings