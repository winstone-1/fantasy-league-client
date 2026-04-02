import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import api from '../api/axios'
import Footer from '../components/Footer'
import { FaTrophy, FaHandSparkles, FaFutbol } from 'react-icons/fa'

function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [league, setLeague]         = useState(null)
  const [standings, setStandings]   = useState([])
  const [matches, setMatches]       = useState([])
  const [myTeam, setMyTeam]         = useState(null)
  const [topPlayers, setTopPlayers] = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const leaguesRes = await api.get('/leagues')
      if (leaguesRes.data.length === 0) { setLoading(false); return }
      const firstLeague = leaguesRes.data[0]
      setLeague(firstLeague)

      const [standingsRes, matchesRes] = await Promise.all([
        api.get(`/leagues/${firstLeague._id}/standings`),
        api.get(`/leagues/${firstLeague._id}/matches`)
      ])

      const standingsData = standingsRes.data.standings || []
      setStandings(standingsData)
      const me = standingsData.find(s =>
        s.owner?._id === user?._id || s.owner?.email === user?.email
      )
      setMyTeam(me)
      setMatches(matchesRes.data || [])

      const playersRes = await api.get('/players/sport/soccer')
      setTopPlayers(playersRes.data.slice(0, 5))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const myRank = standings.findIndex(s =>
    s.owner?._id === user?._id || s.owner?.email === user?.email
  ) + 1

  const liveMatch    = matches.find(m => m.status === 'live')
  const upcomingMatch = matches.find(m => m.status === 'scheduled')
  const featuredMatch = liveMatch || upcomingMatch
  const sports = { soccer, basketball }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      

      <div className="max-w-5xl mx-auto px-8 py-8">

        {/* Welcome */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {user?.username || user?.email?.split('@')[0]} <FaHandSparkles className="inline ml-1" />
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {league ? `${league.name} · Season ${league.season}` : 'No league yet'}
            </p>
          </div>
          {league && (
            <span className="text-sm bg-gray-900 border border-gray-800 px-4 py-2 rounded-xl text-gray-300 flex items-center gap-1">
              {sports[league.sport] ? (league.sport === 'soccer' ? <FaTrophy /> : <FaTrophy />) : <FaTrophy />} {league.sport === 'soccer' ? 'Premier League' : 'NBA'}
            </span>
          )}
        </div>

        {/* No league state */}
        {!league && !loading && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center mb-8">
            <div className="text-5xl mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">You're not in a league yet</h2>
            <p className="text-gray-400 text-sm mb-6">Create or join a league to get started</p>
            <button
              onClick={() => navigate('/leagues')}
              className="bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-8 py-3 rounded-xl transition"
            >
              Get Started
            </button>
          </div>
        )}

        {league && (
          <>
            {/* Live Match Card */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-gray-400 uppercase tracking-wider">
                  {featuredMatch ? `Gameweek ${featuredMatch.week}` : 'No matches scheduled'}
                </span>
                {liveMatch && (
                  <span className="flex items-center gap-1.5 text-xs text-green-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
                    LIVE
                  </span>
                )}
              </div>

              {featuredMatch ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col items-center gap-3 flex-1">
                      <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center text-3xl bg-gray-800 ${liveMatch ? 'border-green-500' : 'border-gray-700'}`}></div>
                      <div className={`text-4xl font-bold ${liveMatch ? 'text-green-400' : 'text-white'}`}>{featuredMatch.homeScore ?? 0}</div>
                      <p className="text-white font-semibold text-center text-sm">{featuredMatch.homeTeam?.name || 'Home Team'}</p>
                    </div>
                    <div className="text-gray-600 text-2xl font-bold px-6">VS</div>
                    <div className="flex flex-col items-center gap-3 flex-1">
                      <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center text-3xl bg-gray-800 ${liveMatch ? 'border-red-500' : 'border-gray-700'}`}></div>
                      <div className={`text-4xl font-bold ${liveMatch ? 'text-red-400' : 'text-white'}`}>{featuredMatch.awayScore ?? 0}</div>
                      <p className="text-white font-semibold text-center text-sm">{featuredMatch.awayTeam?.name || 'Away Team'}</p>
                    </div>
                  </div>

                  {liveMatch && (
                    <div className="mt-6">
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-green-500 to-purple-500"
                          style={{ width: `${Math.min(((featuredMatch.homeScore ?? 0) / Math.max((featuredMatch.homeScore ?? 0) + (featuredMatch.awayScore ?? 0), 1)) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>{(featuredMatch.homeScore ?? 0) > (featuredMatch.awayScore ?? 0) ? "You're winning!" : 'Keep pushing!'}</span>
                        <span>{Math.abs((featuredMatch.homeScore ?? 0) - (featuredMatch.awayScore ?? 0))} pts difference</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">No upcoming matches — commissioner needs to schedule one</div>
              )}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <p className="text-gray-400 text-sm mb-1">Total Points</p>
                <p className="text-3xl font-bold text-white">{myTeam?.totalPoints ?? 0}</p>
                <p className="text-green-400 text-xs mt-1">+{myTeam?.totalPoints ?? 0} this season</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <p className="text-gray-400 text-sm mb-1">League Rank</p>
                <p className="text-3xl font-bold text-white">{myRank > 0 ? `#${myRank}` : '—'}</p>
                <p className="text-gray-500 text-xs mt-1">of {standings.length} teams</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <p className="text-gray-400 text-sm mb-1">My Players</p>
                <p className="text-3xl font-bold text-white">{myTeam?.players ?? 0}</p>
                <p className="text-gray-500 text-xs mt-1">in squad</p>
              </div>
            </div>

            {/* Best performers */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-lg">Best Performers This Week</h2>
                <button onClick={() => navigate('/search')} className="text-green-400 text-sm hover:text-green-300 transition">View All →</button>
              </div>

              {topPlayers.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {topPlayers.map((player, i) => (
                    <div key={player._id} className={`flex-shrink-0 w-36 bg-gray-800 rounded-2xl p-4 text-center border-2 transition ${i === 0 ? 'border-green-500' : 'border-transparent hover:border-gray-600'}`}>
                      <div className="relative mx-auto w-14 h-14 mb-3">
                        {player.photo ? (
                          <img src={player.photo} alt={player.name} className="w-14 h-14 rounded-full object-cover border-2 border-gray-700" onError={e => e.target.style.display = 'none'}/>
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center text-xl"><FaFutbol /></div>
                        )}  
                      </div>
                      <p className="font-semibold text-xs text-white leading-tight">{player.name}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{player.team?.slice(0, 3).toUpperCase() || '???'} · {player.position || 'MID'}</p>
                      <div className="mt-3 bg-gray-900 rounded-xl py-2">
                        <p className="text-green-400 font-bold text-lg">{(i + 1) * 4 + 12}</p>
                        <p className="text-gray-500 text-xs">POINTS</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">Search for players to see performers</p>
                  <button onClick={() => navigate('/search')} className="mt-3 bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-6 py-2 rounded-xl transition text-sm">Search Players</button>
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'My Leagues', path: '/leagues' },
                { label: 'Search Players',  path: '/search' },
                { label: 'Standings',  path: '/standings' },
                { label: 'Live Matches', path: '/matches' },
              ].map(action => (
                <button key={action.path} onClick={() => navigate(action.path)} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:border-green-500 transition text-left">
                  <div className="text-2xl mb-2">{action.icon}</div>
                  <p className="text-sm font-medium text-white">{action.label}</p>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default Dashboard