import { useState, useEffect, useRef, useCallback } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { FaFutbol, FaBasketballBall } from 'react-icons/fa'

// ─── Constants ───────────────────────────────────────────────────────────────

const POLL_INTERVAL = 30000

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getStatusPill = (status, minute, sport) => {
  const s = status?.toLowerCase()

  if (s === 'ht')
    return { label: 'HT', bg: 'bg-purple-600', dot: false }

  if (s === 'ft' || s === 'final')
    return { label: 'Final', bg: 'bg-gray-600', dot: false }

  if (s === 'live' || s === 'in_play' || s === '1h' || s === '2h') {
    const label = sport === 'basketball' && minute
      ? `${minute}`
      : minute
        ? `${minute}'`
        : 'LIVE'
    return { label, bg: 'bg-green-500', dot: true }
  }

  if (s === 'scheduled' || s === 'ns' || s === 'tbd')
    return { label: 'Soon', bg: 'bg-gray-700', dot: false }

  return { label: status ?? '—', bg: 'bg-gray-700', dot: false }
}

const sportIcon = (sport) =>
  sport === 'basketball' ? <FaBasketballBall /> : <FaFutbol />

const teamInitials = (name = '') =>
  name.slice(0, 3).toUpperCase()

const teamColor = (name = '') => {
  const palette = [
    'bg-red-700', 'bg-blue-700', 'bg-emerald-700',
    'bg-violet-700', 'bg-amber-700', 'bg-cyan-700',
    'bg-rose-700', 'bg-indigo-700',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return palette[Math.abs(hash) % palette.length]
}

const getTeamName = (team) => {
  if (typeof team === 'string') return team
  return team.name
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const TickerCard = ({ match, active, onClick }) => {
  const pill = getStatusPill(match.status, match.minute, match.sport)
  const homeTeamName = getTeamName(match.homeTeam)
  const awayTeamName = getTeamName(match.awayTeam)

  return (
    <button
      onClick={onClick}
      className={`shrink-0 w-44 rounded-2xl p-3.5 text-left transition-all duration-200 border
        ${active
          ? 'bg-gray-800 border-green-500/60 shadow-lg shadow-green-500/10'
          : 'bg-gray-900 border-gray-800 hover:border-gray-600'
        }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-lg">{sportIcon(match.sport)}</span>
        <span className={`flex items-center gap-1.5 text-xs font-bold text-white px-2 py-0.5 rounded-full ${pill.bg}`}>
          {pill.dot && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
          {pill.label}
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-white text-xs font-semibold">{teamInitials(homeTeamName)}</span>
          <span className="text-white text-sm font-bold">{match.homeScore ?? 0}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-xs font-semibold">{teamInitials(awayTeamName)}</span>
          <span className="text-gray-300 text-sm font-bold">{match.awayScore ?? 0}</span>
        </div>
      </div>
    </button>
  )
}

const TeamAvatar = ({ name, size = 'lg' }) => {
  const color = teamColor(name)
  const sizeClass = size === 'lg'
    ? 'w-20 h-20 text-xl'
    : 'w-10 h-10 text-sm'

  return (
    <div className={`${sizeClass} ${color} rounded-full flex items-center justify-center font-bold text-white shrink-0 overflow-hidden`}>
      {teamInitials(name)}
    </div>
  )
}

const PlayerRow = ({ player }) => {
  const color = teamColor(player.team)
  return (
    <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-2xl px-4 py-3">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${color} rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0`}>
          {teamInitials(player.team)}
        </div>
        <div>
          <p className="text-white font-semibold text-sm">{player.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-green-400 text-xs">Playing</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="text-green-400 font-bold text-xl leading-none">{player.points ?? 0}</p>
        <p className="text-gray-500 text-xs mt-0.5">pts</p>
      </div>
    </div>
  )
}

const MatchCard = ({ match }) => {
  const pill = getStatusPill(match.status, match.minute, match.sport)
  const myPlayers = match.myPlayers ?? []
  const homeTeamName = getTeamName(match.homeTeam)
  const awayTeamName = getTeamName(match.awayTeam)

  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-3xl overflow-hidden">

      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{sportIcon(match.sport)}</span>
          <div>
            <p className="text-white font-semibold text-sm">
              {match.sport === 'basketball' ? 'NBA' : 'Premier League'}
            </p>
            <p className="text-gray-500 text-xs">
              {myPlayers.length} of your player{myPlayers.length !== 1 ? 's' : ''} active
            </p>
          </div>
        </div>

        <span className={`flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1 rounded-full ${pill.bg}`}>
          {pill.dot && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
          {pill.label}
        </span>
      </div>

      <div className="flex items-center justify-between px-10 py-8">
        <div className="flex flex-col items-center gap-3">
          <TeamAvatar name={homeTeamName} size="lg" />
          <p className="text-white font-semibold text-sm tracking-wide">{teamInitials(homeTeamName)}</p>
          <p className="text-white font-black text-5xl leading-none">{match.homeScore ?? 0}</p>
        </div>

        <span className="text-gray-700 font-black text-2xl tracking-widest">VS</span>

        <div className="flex flex-col items-center gap-3">
          <TeamAvatar name={awayTeamName} size="lg" />
          <p className="text-white font-semibold text-sm tracking-wide">{teamInitials(awayTeamName)}</p>
          <p className="text-white font-black text-5xl leading-none">{match.awayScore ?? 0}</p>
        </div>
      </div>

      {myPlayers.length > 0 && (
        <div className="px-5 pb-5">
          <div className="border-t border-gray-800 pt-4 mb-3">
            <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
              <span className="text-green-500">⚡</span>
              Your Players in This Game
            </div>
          </div>
          <div className="space-y-2">
            {myPlayers.map((p, i) => (
              <PlayerRow key={i} player={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 animate-pulse space-y-4">
    <div className="h-4 bg-gray-800 rounded w-1/3" />
    <div className="flex items-center justify-between px-10">
      <div className="flex flex-col items-center gap-2">
        <div className="w-20 h-20 rounded-full bg-gray-800" />
        <div className="h-3 bg-gray-800 rounded w-12" />
        <div className="h-10 bg-gray-800 rounded w-16" />
      </div>
      <div className="h-6 bg-gray-800 rounded w-10" />
      <div className="flex flex-col items-center gap-2">
        <div className="w-20 h-20 rounded-full bg-gray-800" />
        <div className="h-3 bg-gray-800 rounded w-12" />
        <div className="h-10 bg-gray-800 rounded w-16" />
      </div>
    </div>
  </div>
)

// ─── Main Page ────────────────────────────────────────────────────────────────

function LiveMatches() {
  const [matches, setMatches] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastPoll, setLastPoll] = useState(null)
  const intervalRef = useRef(null)
  const { user } = useAuth()

  const fetchMatches = useCallback(async () => {
    try {
      const res = await api.get('/matches/live')
      const data = res.data?.matches ?? res.data ?? []
      setMatches(data)
      setLastPoll(new Date())
      setError('')
      setSelected(prev => prev ?? data[0]?._id ?? null)
    } catch (err) {
      setError('Could not fetch live matches. Retrying…')
      console.error('Error fetching matches:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMatches()
    intervalRef.current = setInterval(fetchMatches, POLL_INTERVAL)
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchMatches])

  const liveCount = matches.filter(m => 
    ['live', 'in_play', '1h', '2h'].includes(m.status?.toLowerCase())
  ).length
  
  const activeMatch = matches.find(m => m._id === selected)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">Live Scores</h1>
              {liveCount > 0 && (
                <span className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  LIVE
                </span>
              )}
            </div>
            <p className="text-gray-500 mt-1 text-sm">Real-time updates for your fantasy players</p>
          </div>

          {lastPoll && (
            <p className="text-gray-600 text-xs mt-1">
              Updated {lastPoll.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {!loading && matches.length > 0 && (
          <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-green-400 text-lg">⚡</span>
              <h2 className="text-white font-bold text-base">Live Ticker</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {matches.map(match => (
                <TickerCard
                  key={match._id}
                  match={match}
                  active={match._id === selected}
                  onClick={() => setSelected(match._id)}
                />
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {!loading && matches.length === 0 && !error && (
          <div className="text-center py-24">
            <div className="text-5xl mb-4"><FaFutbol /></div>
            <p className="text-gray-400 text-lg font-medium">No live matches right now</p>
            <p className="text-gray-600 text-sm mt-1">Check back when your gameweek starts</p>
          </div>
        )}

        {!loading && matches.length > 0 && (
          <div className="space-y-4">
            {[
              ...(activeMatch ? [activeMatch] : []),
              ...matches.filter(m => m._id !== selected),
            ].map(match => (
              <MatchCard key={match._id} match={match} />
            ))}
          </div>
        )}

        {!loading && matches.length > 0 && (
          <p className="text-gray-700 text-xs text-center pb-4">
            Scores refresh every 30 seconds · tap a match in the ticker to jump to it
          </p>
        )}

      </div>
      <Footer />
    </div>
  )
}

export default LiveMatches