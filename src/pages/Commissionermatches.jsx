import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import api from '../api/axios'
import { FaCalendarAlt, FaFutbol, FaBasketballBall, FaTrash, FaEdit } from 'react-icons/fa'

export default function CommissionerMatches() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [myLeagues, setMyLeagues]   = useState([])
  const [selectedLeague, setSelectedLeague] = useState(null)
  const [teams, setTeams]           = useState([])
  const [matches, setMatches]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [creating, setCreating]     = useState(false)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState('')

  // Form state
  const [homeTeam, setHomeTeam]     = useState('')
  const [awayTeam, setAwayTeam]     = useState('')
  const [week, setWeek]             = useState(1)
  const [startTime, setStartTime]   = useState('')

  useEffect(() => { fetchMyLeagues() }, [user])
  useEffect(() => { if (selectedLeague) fetchLeagueData(selectedLeague._id) }, [selectedLeague])

  const fetchMyLeagues = async () => {
    try {
      setLoading(true)
      const res = await api.get('/leagues')
      const commissioned = res.data.filter(l =>
        l.commissioner?._id === user?._id || l.commissioner?.email === user?.email
      )
      setMyLeagues(commissioned)
      if (commissioned.length > 0) setSelectedLeague(commissioned[0])
      else setLoading(false)
    } catch (err) {
      setError('Failed to load leagues')
      setLoading(false)
    }
  }

  const fetchLeagueData = async (leagueId) => {
    try {
      setLoading(true)
      const [teamsRes, matchesRes] = await Promise.all([
        api.get(`/leagues/${leagueId}/teams`),
        api.get(`/leagues/${leagueId}/matches`),
      ])
      setTeams(teamsRes.data)
      setMatches(matchesRes.data || [])
    } catch (err) {
      setError('Failed to load league data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    if (homeTeam === awayTeam) { setError('Home and away teams must be different'); return }
    try {
      setCreating(true)
      await api.post(`/leagues/${selectedLeague._id}/matches`, {
        homeTeam, awayTeam, week: Number(week), startTime
      })
      setSuccess('Match scheduled!')
      setHomeTeam(''); setAwayTeam(''); setWeek(1); setStartTime('')
      setTimeout(() => setSuccess(''), 3000)
      fetchLeagueData(selectedLeague._id)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create match')
    } finally {
      setCreating(false)
    }
  }

  const handleUpdateStatus = async (matchId, status) => {
    try {
      await api.patch(`/matches/${matchId}/status`, { status })
      fetchLeagueData(selectedLeague._id)
    } catch (err) {
      setError('Failed to update match status')
    }
  }

  const handleUpdateScore = async (matchId, homeScore, awayScore) => {
    try {
      await api.put(`/matches/${matchId}/score`, {
        homeScore: Number(homeScore),
        awayScore: Number(awayScore)
      })
      fetchLeagueData(selectedLeague._id)
    } catch (err) {
      setError('Failed to update score')
    }
  }

  const groupedMatches = matches.reduce((acc, m) => {
    const w = m.week || 1
    if (!acc[w]) acc[w] = []
    acc[w].push(m)
    return acc
  }, {})

  const statusColor = (status) => {
    if (status === 'live')      return 'bg-green-500/20 text-green-400 border-green-500/30'
    if (status === 'ft' || status === 'completed') return 'bg-gray-700/50 text-gray-400 border-gray-600/30'
    if (status === 'ht')        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    if (status === 'cancelled') return 'bg-red-500/20 text-red-400 border-red-500/30'
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  }

  const statusLabel = (status) => {
    const labels = { scheduled: '📅 Scheduled', live: '🔴 Live', ht: '⏸ Half Time', ft: '✓ Full Time', completed: '✓ Completed', cancelled: '✗ Cancelled' }
    return labels[status] || status
  }

  if (loading && myLeagues.length === 0) return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="inline-block w-10 h-10 border-4 border-white/20 border-t-green-500 rounded-full animate-spin" />
      </div>
    </div>
  )

  if (myLeagues.length === 0) return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-400 text-lg mb-4">You are not a commissioner of any league.</p>
        <button onClick={() => navigate('/leagues')} className="text-green-400 hover:text-green-300 underline underline-offset-4">
          Browse Leagues →
        </button>
      </div>
      <Footer />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-8">

        {/* Back */}
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-2 transition">
          ← Back
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
              <FaCalendarAlt className="text-green-500" /> Match Schedule
            </h1>
            <p className="text-gray-500 text-sm mt-1">Create and manage fixtures for your league.</p>
          </div>

          {/* League switcher */}
          {myLeagues.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {myLeagues.map(l => (
                <button key={l._id} onClick={() => setSelectedLeague(l)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    selectedLeague?._id === l._id
                      ? 'bg-green-500 text-gray-950 border-green-500'
                      : 'border-gray-700 text-gray-400 hover:text-white'
                  }`}>
                  {l.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl mb-4 text-sm">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Create Match Form ── */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 sticky top-6">
              <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                {selectedLeague?.sport === 'basketball' ? <FaBasketballBall className="text-orange-500" /> : <FaFutbol className="text-green-500" />}
                Schedule Fixture
              </h2>

              {teams.length < 2 ? (
                <p className="text-gray-500 text-sm">Need at least 2 teams in the league to schedule a match.</p>
              ) : (
                <form onSubmit={handleCreate} className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Home Team</label>
                    <select value={homeTeam} onChange={e => setHomeTeam(e.target.value)} required
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500">
                      <option value="">Select home team...</option>
                      {teams.map(t => (
                        <option key={t._id} value={t._id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Away Team</label>
                    <select value={awayTeam} onChange={e => setAwayTeam(e.target.value)} required
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500">
                      <option value="">Select away team...</option>
                      {teams.filter(t => t._id !== homeTeam).map(t => (
                        <option key={t._id} value={t._id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Gameweek</label>
                      <input type="number" min="1" max="38" value={week} onChange={e => setWeek(e.target.value)} required
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Date & Time</label>
                      <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} required
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500" />
                    </div>
                  </div>

                  <button type="submit" disabled={creating}
                    className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-gray-950 font-black py-3 rounded-xl text-sm transition mt-2 flex items-center justify-center gap-2">
                    {creating ? <div className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" /> : '+ '}
                    {creating ? 'Scheduling...' : 'Schedule Match'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* ── Match List ── */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="text-base font-bold text-gray-300">
              {matches.length} Match{matches.length !== 1 ? 'es' : ''} · {selectedLeague?.name}
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-white/20 border-t-green-500 rounded-full animate-spin" />
              </div>
            ) : matches.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
                <p className="text-gray-500 text-sm">No matches scheduled yet.</p>
                <p className="text-gray-600 text-xs mt-1">Use the form to create your first fixture.</p>
              </div>
            ) : (
              Object.keys(groupedMatches).sort((a, b) => Number(a) - Number(b)).map(weekNum => (
                <div key={weekNum}>
                  <p className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-2 px-1">
                    Gameweek {weekNum}
                  </p>
                  <div className="space-y-3">
                    {groupedMatches[weekNum].map(match => (
                      <MatchCard
                        key={match._id}
                        match={match}
                        onUpdateStatus={handleUpdateStatus}
                        onUpdateScore={handleUpdateScore}
                        statusColor={statusColor}
                        statusLabel={statusLabel}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
      <Footer />
    </div>
  )
}

// ── Match Card with inline score + status editing ──────────────────────
function MatchCard({ match, onUpdateStatus, onUpdateScore, statusColor, statusLabel }) {
  const [editingScore, setEditingScore] = useState(false)
  const [home, setHome] = useState(match.homeScore ?? 0)
  const [away, setAway] = useState(match.awayScore ?? 0)

  const handleScoreSave = () => {
    onUpdateScore(match._id, home, away)
    setEditingScore(false)
  }

  const matchDate = match.startTime
    ? new Date(match.startTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : 'TBD'

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3">
      {/* Status + time */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{matchDate}</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusColor(match.status)}`}>
          {statusLabel(match.status)}
        </span>
      </div>

      {/* Teams + score */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-bold text-sm text-white">{match.homeTeam?.name || 'TBD'}</p>
        </div>
        {editingScore ? (
          <div className="flex items-center gap-2 px-2">
            <input type="number" min="0" value={home} onChange={e => setHome(e.target.value)}
              className="w-12 text-center bg-gray-800 border border-gray-600 text-white rounded-lg py-1 text-sm focus:outline-none focus:border-green-500" />
            <span className="text-gray-500 font-bold">–</span>
            <input type="number" min="0" value={away} onChange={e => setAway(e.target.value)}
              className="w-12 text-center bg-gray-800 border border-gray-600 text-white rounded-lg py-1 text-sm focus:outline-none focus:border-green-500" />
          </div>
        ) : (
          <div className="text-center px-4">
            <p className="text-xl font-black text-white">{match.homeScore ?? 0} – {match.awayScore ?? 0}</p>
          </div>
        )}
        <div className="flex-1 text-right">
          <p className="font-bold text-sm text-white">{match.awayTeam?.name || 'TBD'}</p>
        </div>
      </div>

      {/* Commissioner controls */}
      <div className="border-t border-gray-800 pt-3 flex flex-wrap gap-2">
        {/* Status controls */}
        {match.status === 'scheduled' && (
          <button onClick={() => onUpdateStatus(match._id, 'live')}
            className="text-xs bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg transition font-bold">
            ▶ Start
          </button>
        )}
        {match.status === 'live' && (
          <>
            <button onClick={() => onUpdateStatus(match._id, 'ht')}
              className="text-xs bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 px-3 py-1.5 rounded-lg transition font-bold">
              ⏸ Half Time
            </button>
            <button onClick={() => onUpdateStatus(match._id, 'ft')}
              className="text-xs bg-gray-700/50 hover:bg-gray-700 text-gray-300 border border-gray-600/30 px-3 py-1.5 rounded-lg transition font-bold">
              ✓ Full Time
            </button>
          </>
        )}
        {match.status === 'ht' && (
          <button onClick={() => onUpdateStatus(match._id, 'live')}
            className="text-xs bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg transition font-bold">
            ▶ Resume
          </button>
        )}
        {(match.status === 'scheduled' || match.status === 'live' || match.status === 'ht') && (
          <button onClick={() => onUpdateStatus(match._id, 'cancelled')}
            className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg transition font-bold">
            ✗ Cancel
          </button>
        )}

        {/* Score edit */}
        {editingScore ? (
          <>
            <button onClick={handleScoreSave}
              className="text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-lg transition font-bold">
              Save Score
            </button>
            <button onClick={() => setEditingScore(false)}
              className="text-xs text-gray-500 hover:text-gray-300 border border-gray-700 px-3 py-1.5 rounded-lg transition">
              Cancel
            </button>
          </>
        ) : (
          <button onClick={() => setEditingScore(true)}
            className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700 px-3 py-1.5 rounded-lg transition flex items-center gap-1 font-bold">
            <FaEdit className="text-xs" /> Edit Score
          </button>
        )}
      </div>
    </div>
  )
}