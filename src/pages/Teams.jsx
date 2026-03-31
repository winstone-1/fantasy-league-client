import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import api from '../api/axios'

const SOCCER_POSITIONS_433 = [
  { id: 'GK', label: 'GK', row: 0 },
  { id: 'LB', label: 'LB', row: 1 },
  { id: 'CB1', label: 'CB', row: 1 },
  { id: 'CB2', label: 'CB', row: 1 },
  { id: 'RB', label: 'RB', row: 1 },
  { id: 'CM1', label: 'CM', row: 2 },
  { id: 'CM2', label: 'CM', row: 2 },
  { id: 'CM3', label: 'CM', row: 2 },
  { id: 'LW', label: 'LW', row: 3 },
  { id: 'ST', label: 'ST', row: 3 },
  { id: 'RW', label: 'RW', row: 3 },
]

const NBA_POSITIONS = [
  { id: 'PG', label: 'Point Guard', short: 'PG', bench: false },
  { id: 'SG', label: 'Shooting Guard', short: 'SG', bench: false },
  { id: 'SF', label: 'Small Forward', short: 'SF', bench: false },
  { id: 'PF', label: 'Power Forward', short: 'PF', bench: false },
  { id: 'C',  label: 'Center', short: 'C', bench: false },
  { id: 'B1', label: 'Bench', short: 'BN', bench: true },
  { id: 'B2', label: 'Bench', short: 'BN', bench: true },
  { id: 'B3', label: 'Bench', short: 'BN', bench: true },
]

function PlayerSlot({ position, player, sport, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center gap-1 cursor-pointer group"
    >
      <div className={`relative w-14 h-14 rounded-full border-2 flex items-center justify-center transition ${
        player
          ? 'border-green-500 bg-gray-800'
          : 'border-dashed border-gray-600 bg-gray-900/50 hover:border-green-500'
      }`}>
        {player ? (
          <>
            {player.photo ? (
              <img
                src={player.photo}
                alt={player.name}
                className="w-full h-full rounded-full object-cover"
                onError={e => e.target.style.display = 'none'}
              />
            ) : (
              <span className="text-xl">{sport === 'basketball' ? '🏀' : '⚽'}</span>
            )}
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-gray-950 font-bold">✓</span>
            </div>
          </>
        ) : (
          <span className="text-gray-600 text-xl">+</span>
        )}
      </div>

      <div className="text-center">
        <div className="bg-gray-900 border border-gray-700 rounded px-2 py-0.5">
          <span className="text-xs font-bold text-gray-300">{position.label || position.short}</span>
        </div>
        {player && (
          <p className="text-xs text-white mt-0.5 max-w-16 truncate">{player.name.split(' ').pop()}</p>
        )}
      </div>
    </div>
  )
}

function SoccerPitch({ positions, players, onSlotClick }) {
  const rows = [0, 1, 2, 3]

  return (
    <div className="relative w-full rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(180deg, #166534 0%, #15803d 25%, #16a34a 50%, #15803d 75%, #166534 100%)', minHeight: '420px' }}>
      {/* Pitch markings */}
      <div className="absolute inset-0 flex flex-col justify-between py-4 pointer-events-none">
        <div className="w-32 h-16 border-2 border-white/20 mx-auto rounded-b-lg"/>
        <div className="w-full border-t border-white/20"/>
        <div className="w-24 h-24 border-2 border-white/20 rounded-full mx-auto"/>
        <div className="w-full border-t border-white/20"/>
        <div className="w-32 h-16 border-2 border-white/20 mx-auto rounded-t-lg"/>
      </div>

      {/* Players by row */}
      <div className="relative z-10 flex flex-col justify-around h-full py-6 px-4" style={{ minHeight: '420px' }}>
        {rows.map(row => {
          const rowPositions = positions.filter(p => p.row === row)
          return (
            <div key={row} className="flex justify-around items-center">
              {rowPositions.map(pos => (
                <PlayerSlot
                  key={pos.id}
                  position={pos}
                  player={players[pos.id]}
                  sport="soccer"
                  onClick={() => onSlotClick(pos)}
                />
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function NBAcourt({ positions, players, onSlotClick }) {
  const starters = positions.filter(p => !p.bench)
  const bench    = positions.filter(p => p.bench)

  return (
    <div className="space-y-4">
      {/* Court */}
      <div
        className="relative w-full rounded-2xl overflow-hidden p-6"
        style={{ background: 'linear-gradient(180deg, #92400e 0%, #b45309 50%, #92400e 100%)', minHeight: '200px' }}
      >
        {/* Court lines */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-32 h-32 border-2 border-white/20 rounded-full"/>
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-20 border-2 border-t-0 border-white/20 rounded-t-full pointer-events-none"/>

        {/* Starters */}
        <div className="relative z-10 flex justify-around items-center h-full">
          {starters.map(pos => (
            <PlayerSlot
              key={pos.id}
              position={{ ...pos, label: pos.short }}
              player={players[pos.id]}
              sport="basketball"
              onClick={() => onSlotClick(pos)}
            />
          ))}
        </div>
      </div>

      {/* Bench */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Bench</p>
        <div className="flex gap-6 justify-around">
          {bench.map(pos => (
            <PlayerSlot
              key={pos.id}
              position={{ ...pos, label: pos.short }}
              player={players[pos.id]}
              sport="basketball"
              onClick={() => onSlotClick(pos)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function MyTeam() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [sport, setSport]           = useState('soccer')
  const [leagues, setLeagues]       = useState([])
  const [soccerTeam, setSoccerTeam] = useState(null)
  const [nbaTeam, setNbaTeam]       = useState(null)
  const [soccerPlayers, setSoccerPlayers] = useState({})
  const [nbaPlayers, setNbaPlayers]       = useState({})
  const [selectedSlot, setSelectedSlot]   = useState(null)
  const [availablePlayers, setAvailablePlayers] = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => { fetchTeams() }, [])

  const fetchTeams = async () => {
    try {
      const leaguesRes = await api.get('/leagues')
      setLeagues(leaguesRes.data)

      for (const league of leaguesRes.data) {
        const teamsRes = await api.get(`/leagues/${league._id}/teams`)
        const myTeam = teamsRes.data.find(t =>
          t.owner?._id === user?._id || t.owner?.email === user?.email
        )
        if (myTeam) {
          if (league.sport === 'soccer') setSoccerTeam({ ...myTeam, leagueId: league._id })
          if (league.sport === 'basketball') setNbaTeam({ ...myTeam, leagueId: league._id })
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSlotClick = async (pos) => {
    setSelectedSlot(pos)
    try {
      const sport_ = sport
      const res = await api.get(`/players/sport/${sport_ === 'soccer' ? 'soccer' : 'basketball'}`)
      setAvailablePlayers(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const assignPlayer = (pos, player) => {
    if (sport === 'soccer') {
      setSoccerPlayers(prev => ({ ...prev, [pos.id]: player }))
    } else {
      setNbaPlayers(prev => ({ ...prev, [pos.id]: player }))
    }
    setSelectedSlot(null)
  }

  const currentTeam    = sport === 'soccer' ? soccerTeam : nbaTeam
  const currentPlayers = sport === 'soccer' ? soccerPlayers : nbaPlayers
  const positions      = sport === 'soccer' ? SOCCER_POSITIONS_433 : NBA_POSITIONS

  const totalValue = Object.values(currentPlayers).length

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <div className="max-w-3xl mx-auto px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">My Team</h1>
            <p className="text-gray-400 text-sm mt-1">
              {sport === 'soccer' ? '4-3-3 Formation' : '5 Starters + 3 Bench'} · {totalValue} players assigned
            </p>
          </div>

          {/* Sport toggle */}
          <div className="flex gap-2 bg-gray-900 p-1 rounded-xl border border-gray-800">
            <button
              onClick={() => setSport('soccer')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                sport === 'soccer' ? 'bg-green-500 text-gray-950' : 'text-gray-400 hover:text-white'
              }`}
            >
              ⚽ Soccer
            </button>
            <button
              onClick={() => setSport('basketball')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                sport === 'basketball' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              🏀 NBA
            </button>
          </div>
        </div>

        {/* No team state */}
        {!currentTeam && !loading && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center mb-6">
            <div className="text-5xl mb-4">{sport === 'soccer' ? '⚽' : '🏀'}</div>
            <h2 className="text-lg font-semibold mb-2">
              No {sport === 'soccer' ? 'soccer' : 'NBA'} team yet
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Join a {sport === 'soccer' ? 'soccer' : 'basketball'} league first, then create your team
            </p>
            <button
              onClick={() => navigate('/leagues')}
              className="bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-6 py-2.5 rounded-xl transition text-sm"
            >
              Go to Leagues
            </button>
          </div>
        )}

        {/* Pitch / Court */}
        {currentTeam && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">{currentTeam.name}</p>
                <p className="text-gray-400 text-xs">Click a slot to assign a player</p>
              </div>
              <button
                onClick={() => navigate('/search')}
                className="bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-4 py-2 rounded-xl text-sm transition flex items-center gap-2"
              >
                + Make Transfer
              </button>
            </div>

            {sport === 'soccer' ? (
              <SoccerPitch
                positions={SOCCER_POSITIONS_433}
                players={currentPlayers}
                onSlotClick={handleSlotClick}
              />
            ) : (
              <NBAcourt
                positions={NBA_POSITIONS}
                players={currentPlayers}
                onSlotClick={handleSlotClick}
              />
            )}
          </>
        )}

        {/* Player picker modal */}
        {selectedSlot && (
          <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md max-h-96 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <p className="font-semibold">
                  Pick player for <span className="text-green-400">{selectedSlot.label || selectedSlot.short}</span>
                </p>
                <button onClick={() => setSelectedSlot(null)} className="text-gray-400 hover:text-white text-xl">×</button>
              </div>

              <div className="overflow-y-auto max-h-72 p-2">
                {availablePlayers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">No players cached yet</p>
                    <button
                      onClick={() => { setSelectedSlot(null); navigate('/search') }}
                      className="mt-3 text-green-400 text-sm hover:text-green-300"
                    >
                      Search for players first →
                    </button>
                  </div>
                ) : (
                  availablePlayers.map(player => (
                    <div
                      key={player._id}
                      onClick={() => assignPlayer(selectedSlot, player)}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800 cursor-pointer transition"
                    >
                      {player.photo ? (
                        <img src={player.photo} className="w-10 h-10 rounded-full object-cover" onError={e => e.target.style.display='none'}/>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                          {sport === 'basketball' ? '🏀' : '⚽'}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{player.name}</p>
                        <p className="text-xs text-gray-400">{player.team} · {player.position}</p>
                      </div>
                      <span className="text-green-400 text-sm">+</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}