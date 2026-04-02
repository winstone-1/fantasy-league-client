import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import api from '../api/axios'
import { FaFutbol, FaBasketballBall, FaFootballBall, FaTrophy, FaLock, FaEdit, FaCalendarAlt } from 'react-icons/fa'

export default function LeagueDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [league, setLeague]           = useState(null)
  const [teams, setTeams]             = useState([])
  const [standings, setStandings]     = useState([])
  const [matches, setMatches]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [activeTab, setActiveTab]     = useState('overview')
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [teamName, setTeamName]       = useState('')
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState('')

  useEffect(() => { fetchAll() }, [id])

  const fetchAll = async () => {
    try {
      const [leagueRes, teamsRes, standingsRes, matchesRes] = await Promise.all([
        api.get(`/leagues/${id}`),
        api.get(`/leagues/${id}/teams`),
        api.get(`/leagues/${id}/standings`),
        api.get(`/leagues/${id}/matches`)
      ])
      setLeague(leagueRes.data)
      setTeams(teamsRes.data)
      setStandings(standingsRes.data.standings || [])
      setMatches(matchesRes.data || [])
    } catch (err) {
      setError('Failed to load league')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTeam = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post(`/leagues/${id}/teams`, { name: teamName })
      setSuccess('Team created!')
      setShowCreateTeam(false)
      setTeamName('')
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create team')
    }
  }

  const myTeam = teams.find(t =>
    t.owner?._id === user?._id || t.owner?.email === user?.email
  )

  const isCommissioner = league?.commissioner?._id === user?._id ||
    league?.commissioner?.email === user?.email

  const sports = {
    soccer: <FaFutbol />,
    basketball: <FaBasketballBall />,
    football: <FaFootballBall />
  }

  const getRankStyle = (rank) => {
    if (rank === 1) return 'bg-yellow-500 text-white'
    if (rank === 2) return 'bg-gray-400 text-white'
    if (rank === 3) return 'bg-amber-600 text-white'
    return 'bg-gray-800 text-gray-400'
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-8 py-16 text-center">
        <div className="text-gray-400 animate-pulse">Loading league...</div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-4xl mx-auto w-full px-8 py-8">

        {/* Back */}
        <button
          onClick={() => navigate('/leagues')}
          className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-2 transition"
        >
          ← Back to Leagues
        </button>

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

        {/* League header */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center text-3xl">
                {sports[league?.sport] || <FaTrophy />}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{league?.name}</h1>
                <p className="text-gray-400 text-sm mt-1">
                  {league?.sport} · Season {league?.season} · {teams.length}/{league?.maxTeams} teams
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {isCommissioner && (
                    <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <FaEdit className="text-xs" /> Commissioner
                    </span>
                  )}
                  {league?.isPrivate && (
                    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <FaLock /> Private
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right">
              {/* Commissioner action — contextual, not in navbar */}
              {isCommissioner && (
                <button
                  onClick={() => navigate('/commissioner/matches')}
                  className="mb-3 bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-4 py-2 rounded-xl text-sm transition flex items-center gap-2"
                >
                  <FaCalendarAlt /> Manage Matches
                </button>
              )}
              <p className="text-xs text-gray-500 mb-1">Invite Code</p>
              <p className="font-mono text-green-400 text-lg font-bold tracking-widest">
                {league?.inviteCode}
              </p>
            </div>
          </div>

          {/* Create team CTA */}
          {!myTeam && (
            <div className="mt-4 pt-4 border-t border-gray-800">
              {!showCreateTeam ? (
                <button
                  onClick={() => setShowCreateTeam(true)}
                  className="bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-5 py-2 rounded-xl text-sm transition"
                >
                  + Create My Team
                </button>
              ) : (
                <form onSubmit={handleCreateTeam} className="flex gap-3">
                  <input
                    type="text"
                    value={teamName}
                    onChange={e => setTeamName(e.target.value)}
                    placeholder="e.g. Winstone FC"
                    required
                    className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-green-500"
                  />
                  <button type="submit" className="bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-5 py-2 rounded-xl text-sm transition">
                    Create
                  </button>
                  <button type="button" onClick={() => setShowCreateTeam(false)} className="text-gray-400 hover:text-white px-3 py-2 text-sm">
                    Cancel
                  </button>
                </form>
              )}
            </div>
          )}

          {myTeam && (
            <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-sm">⚡</div>
                <div>
                  <p className="text-sm font-semibold text-white">{myTeam.name}</p>
                  <p className="text-xs text-gray-400">{myTeam.players?.length || 0} players · {myTeam.totalPoints || 0} pts</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/teams')}
                className="text-green-400 text-sm hover:text-green-300 transition"
              >
                Manage Team →
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-gray-900 p-1 rounded-xl border border-gray-800 mb-6">
          {['overview', 'standings', 'matches'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition ${
                activeTab === tab
                  ? 'bg-green-500 text-gray-950'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'overview' ? 'Overview' : tab === 'standings' ? 'Standings' : 'Matches'}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Teams ({teams.length})</h2>
            {teams.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No teams yet — be the first to create one!
              </div>
            ) : (
              <div className="space-y-3">
                {teams.map(team => {
                  const isMe = team.owner?._id === user?._id || team.owner?.email === user?.email
                  return (
                    <div
                      key={team._id}
                      className={`bg-gray-900 border rounded-2xl p-5 transition ${
                        isMe ? 'border-green-500 bg-green-500/5' : 'border-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-lg">
                            {sports[league?.sport] || '⚡'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-white">{team.name}</p>
                              {isMe && (
                                <span className="text-xs bg-green-500 text-gray-950 font-bold px-1.5 py-0.5 rounded-full">You</span>
                              )}
                            </div>
                            <p className="text-gray-400 text-xs mt-0.5">
                              {team.owner?.username || team.owner?.email} · {team.players?.length || 0} players
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">{team.totalPoints}</p>
                          <p className="text-gray-500 text-xs">points</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Standings tab */}
        {activeTab === 'standings' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">League Standings</h2>
            {standings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No standings yet</div>
            ) : (
              <>
                <div className="grid grid-cols-6 text-xs text-gray-500 uppercase tracking-wider px-5 mb-2">
                  <span>Rank</span>
                  <span className="col-span-3">Team</span>
                  <span className="text-center">Players</span>
                  <span className="text-right">Points</span>
                </div>
                <div className="space-y-2">
                  {standings.map(entry => {
                    const isMe = entry.owner?._id === user?._id || entry.owner?.email === user?.email
                    return (
                      <div
                        key={entry.teamId}
                        className={`relative bg-gray-900 border rounded-2xl p-4 transition ${
                          isMe ? 'border-green-500 bg-green-500/5' : 'border-gray-800'
                        }`}
                      >
                        {isMe && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-green-500 rounded-r-full"/>}
                        <div className="grid grid-cols-6 items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankStyle(entry.rank)}`}>
                            {entry.rank}
                          </div>
                          <div className="col-span-3 flex items-center gap-2">
                            <p className="font-semibold text-sm">{entry.name}</p>
                            {isMe && <span className="text-xs bg-green-500 text-gray-950 font-bold px-1.5 py-0.5 rounded-full">You</span>}
                          </div>
                          <div className="text-center text-gray-400 text-sm">{entry.players}</div>
                          <div className="text-right font-bold text-white">{entry.totalPoints}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Matches tab */}
        {activeTab === 'matches' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Matches</h2>
              {isCommissioner && (
                <button
                  onClick={() => navigate('/commissioner/matches')}
                  className="text-sm bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                >
                  <FaCalendarAlt className="text-xs" /> Manage
                </button>
              )}
            </div>
            {matches.length === 0 ? (
              <div className="text-center py-12 bg-gray-900 rounded-2xl border border-gray-800">
                <p className="text-gray-500">No matches scheduled yet</p>
                {isCommissioner && (
                  <button
                    onClick={() => navigate('/commissioner/matches')}
                    className="mt-4 bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-5 py-2 rounded-xl transition text-sm"
                  >
                    Create First Match →
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {matches.map(match => (
                  <div key={match._id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-500">Week {match.week || 1}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        match.status === 'live'
                          ? 'bg-green-500/20 text-green-400'
                          : match.status === 'ft' || match.status === 'final'
                          ? 'bg-gray-700 text-gray-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {match.status === 'live' ? '🔴 LIVE' : match.status === 'ft' || match.status === 'final' ? '✓ Final' : '📅 Scheduled'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-sm">{match.homeTeam?.name || 'TBD'}</p>
                        <p className="text-2xl font-bold text-white mt-1">{match.homeScore ?? 0}</p>
                      </div>
                      <div className="text-gray-600 text-xl font-bold px-6">VS</div>
                      <div className="flex-1 text-right">
                        <p className="font-semibold text-sm">{match.awayTeam?.name || 'TBD'}</p>
                        <p className="text-2xl font-bold text-white mt-1">{match.awayScore ?? 0}</p>
                      </div>
                    </div>
                    {match.minute > 0 && match.status === 'live' && (
                      <div className="mt-3 text-center">
                        <span className="text-xs text-yellow-500">{match.minute}'</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
      <Footer />
    </div>
  )
}