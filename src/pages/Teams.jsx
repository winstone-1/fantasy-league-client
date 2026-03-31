import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import api from '../api/axios'

// ── Soccer formations ──────────────────────────────────────
const FORMATIONS = {
  '4-3-3': [
    { id: 'GK',  label: 'GK',  row: 0 },
    { id: 'LB',  label: 'LB',  row: 1 },
    { id: 'CB1', label: 'CB',  row: 1 },
    { id: 'CB2', label: 'CB',  row: 1 },
    { id: 'RB',  label: 'RB',  row: 1 },
    { id: 'CM1', label: 'CM',  row: 2 },
    { id: 'CM2', label: 'CM',  row: 2 },
    { id: 'CM3', label: 'CM',  row: 2 },
    { id: 'LW',  label: 'LW',  row: 3 },
    { id: 'ST',  label: 'ST',  row: 3 },
    { id: 'RW',  label: 'RW',  row: 3 },
  ],
  '4-4-2': [
    { id: 'GK',  label: 'GK',  row: 0 },
    { id: 'LB',  label: 'LB',  row: 1 },
    { id: 'CB1', label: 'CB',  row: 1 },
    { id: 'CB2', label: 'CB',  row: 1 },
    { id: 'RB',  label: 'RB',  row: 1 },
    { id: 'LM',  label: 'LM',  row: 2 },
    { id: 'CM1', label: 'CM',  row: 2 },
    { id: 'CM2', label: 'CM',  row: 2 },
    { id: 'RM',  label: 'RM',  row: 2 },
    { id: 'ST1', label: 'ST',  row: 3 },
    { id: 'ST2', label: 'ST',  row: 3 },
  ],
}

// ── NBA lineups ────────────────────────────────────────────
const NBA_LINEUPS = {
  'Standard': [
    { id: 'NBA_PG', label: 'PG', bench: false },
    { id: 'NBA_SG', label: 'SG', bench: false },
    { id: 'NBA_SF', label: 'SF', bench: false },
    { id: 'NBA_PF', label: 'PF', bench: false },
    { id: 'NBA_C',  label: 'C',  bench: false },
    { id: 'NBA_B1', label: 'BN', bench: true  },
    { id: 'NBA_B2', label: 'BN', bench: true  },
    { id: 'NBA_B3', label: 'BN', bench: true  },
  ],
  'Small Ball': [
    { id: 'NBA_PG',  label: 'PG', bench: false },
    { id: 'NBA_SG',  label: 'SG', bench: false },
    { id: 'NBA_SF1', label: 'SF', bench: false },
    { id: 'NBA_SF2', label: 'SF', bench: false },
    { id: 'NBA_PF',  label: 'PF', bench: false },
    { id: 'NBA_B1',  label: 'BN', bench: true  },
    { id: 'NBA_B2',  label: 'BN', bench: true  },
    { id: 'NBA_B3',  label: 'BN', bench: true  },
  ],
}

// ── Sub-Components ─────────────────────────────────────────
function PlayerSlot({ position, player, sport, onDragOver, onDrop, onDragStart, onClick }) {
  return (
    <div
      className="flex flex-col items-center gap-1 cursor-pointer group"
      onDragOver={e => { e.preventDefault(); onDragOver && onDragOver(position) }}
      onDrop={e => { e.preventDefault(); onDrop && onDrop(position) }}
      onClick={() => onClick && onClick(position)}
    >
      <div
        draggable={!!player}
        onDragStart={() => onDragStart && onDragStart(position, player)}
        className={`relative w-14 h-14 rounded-full border-2 flex items-center justify-center transition ${
          player
            ? 'border-green-500 bg-gray-800 hover:border-green-400'
            : 'border-dashed border-gray-600 bg-black/20 hover:border-green-500'
        }`}
      >
        {player ? (
          <>
            {player.photo ? (
              <img
                src={player.photo}
                alt={player.name}
                className="w-full h-full rounded-full object-cover"
                onError={e => { e.target.style.display = 'none' }}
              />
            ) : (
              <span className="text-xl">{sport === 'basketball' ? '🏀' : '⚽'}</span>
            )}
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-gray-950 font-bold">✓</span>
            </div>
          </>
        ) : (
          <span className="text-gray-500 text-xl">+</span>
        )}
      </div>
      <div className="text-center">
        <div className="bg-black/40 rounded px-2 py-0.5">
          <span className="text-xs font-bold text-gray-200">{position.label}</span>
        </div>
        {player && (
          <p className="text-xs text-white mt-0.5 max-w-[64px] truncate">
            {player.name.split(' ').pop()}
          </p>
        )}
      </div>
    </div>
  )
}

function SoccerPitch({ positions, players, onSlotClick, onDragStart, onDragOver, onDrop }) {
  const rows = [...new Set(positions.map(p => p.row))].sort((a, b) => b - a)
  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-green-900 border border-green-800" style={{ minHeight: '460px', background: 'linear-gradient(180deg, #14532d 0%, #15803d 50%, #14532d 100%)' }}>
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 border-2 border-white rounded-b-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-20 border-2 border-white rounded-t-3xl" />
        <div className="absolute top-1/2 left-0 right-0 border-t-2 border-white" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white rounded-full" />
      </div>
      <div className="relative z-10 flex flex-col justify-around py-6" style={{ minHeight: '460px' }}>
        {rows.map(row => (
          <div key={row} className="flex justify-around items-center">
            {positions.filter(p => p.row === row).map(pos => (
              <PlayerSlot key={pos.id} position={pos} player={players[pos.id]} sport="soccer" onClick={onSlotClick} onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function NBACourt({ positions, players, onSlotClick, onDragStart, onDragOver, onDrop }) {
  const starters = positions.filter(p => !p.bench)
  const bench = positions.filter(p => p.bench)
  return (
    <div className="space-y-4">
      <div className="relative w-full rounded-2xl overflow-hidden p-8 bg-orange-900 border border-orange-800" style={{ minHeight: '220px', background: 'linear-gradient(180deg, #7c2d12 0%, #9a3412 50%, #7c2d12 100%)' }}>
        <div className="relative z-10 flex justify-around items-center h-full">
          {starters.map(pos => (
            <PlayerSlot key={pos.id} position={pos} player={players[pos.id]} sport="basketball" onClick={onSlotClick} onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} />
          ))}
        </div>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <p className="text-xs text-gray-500 uppercase mb-3">Bench</p>
        <div className="flex gap-4 justify-center">
          {bench.map(pos => (
            <PlayerSlot key={pos.id} position={pos} player={players[pos.id]} sport="basketball" onClick={onSlotClick} onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────
export default function Teams() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [sport, setSport] = useState('soccer')
  const [soccerFormation, setSoccerFormation] = useState('4-3-3')
  const [nbaLineup, setNbaLineup] = useState('Standard')
  const [soccerTeam, setSoccerTeam] = useState(null)
  const [nbaTeam, setNbaTeam] = useState(null)
  const [soccerPlayers, setSoccerPlayers] = useState({})
  const [nbaPlayers, setNbaPlayers] = useState({})
  const [availablePlayers, setAvailablePlayers] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [dragSource, setDragSource] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchTeams() }, [user])

  const fetchTeams = async () => {
    if (!user) return;
    try {
      const leaguesRes = await api.get('/leagues')
      for (const league of leaguesRes.data) {
        const teamsRes = await api.get(`/leagues/${league._id}/teams`)
        const myTeam = teamsRes.data.find(t => t.owner?._id === user?._id || t.owner === user?._id)

        if (myTeam) {
          const mapped = {}
          myTeam.players?.forEach(p => { if (p.position) mapped[p.position] = p.player })
          
          if (league.sport === 'soccer') {
            setSoccerTeam({ ...myTeam, leagueId: league._id })
            setSoccerPlayers(mapped)
          } else {
            setNbaTeam({ ...myTeam, leagueId: league._id })
            setNbaPlayers(mapped)
          }
        }
      }
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const handleCreateTeam = async () => {
    try {
      const targetSport = sport === 'soccer' ? 'soccer' : 'basketball'
      const leaguesRes = await api.get('/leagues')
      const targetLeague = leaguesRes.data.find(l => l.sport === targetSport)

      if (!targetLeague) {
        alert(`Please join a ${targetSport} league first!`)
        return navigate('/leagues')
      }

      const res = await api.post(`/leagues/${targetLeague._id}/teams`, {
        name: `${user.username || 'My'} ${sport === 'soccer' ? 'FC' : 'Squad'}`
      })

      await fetchTeams()
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create team.")
    }
  }

  const openPicker = async (pos) => {
    setSelectedSlot(pos)
    try {
      const res = await api.get(`/players/sport/${sport === 'soccer' ? 'soccer' : 'basketball'}`)
      setAvailablePlayers(res.data)
    } catch (err) { console.error(err) }
  }

  const assignPlayer = async (pos, player) => {
    const currentTeam = sport === 'soccer' ? soccerTeam : nbaTeam
    if (!currentTeam) return

    try {
      await api.post(`/leagues/${currentTeam.leagueId}/teams/${currentTeam._id}/players`, {
        playerId: player._id,
        position: pos.id
      })
      
      const setter = sport === 'soccer' ? setSoccerPlayers : setNbaPlayers
      setter(prev => ({ ...prev, [pos.id]: player }))
      setSelectedSlot(null)
    } catch (err) { console.error(err) }
  }

  const handleDragStart = (pos, player) => setDragSource({ pos, player })
  const handleDrop = (targetPos) => {
    if (!dragSource) return
    const setter = sport === 'soccer' ? setSoccerPlayers : setNbaPlayers
    setter(prev => {
      const next = { ...prev }
      const targetPlayer = next[targetPos.id]
      next[targetPos.id] = dragSource.player
      next[dragSource.pos.id] = targetPlayer || undefined
      return next
    })
    setDragSource(null)
  }

  const currentTeam = sport === 'soccer' ? soccerTeam : nbaTeam
  const currentPlayers = sport === 'soccer' ? soccerPlayers : nbaPlayers
  const positions = sport === 'soccer' ? FORMATIONS[soccerFormation] : NBA_LINEUPS[nbaLineup]

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-20">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-8">
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">My Team</h1>
          <div className="flex gap-2 bg-gray-900 p-1 rounded-xl border border-gray-800">
            <button onClick={() => setSport('soccer')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${sport === 'soccer' ? 'bg-green-500 text-gray-950' : 'text-gray-400'}`}>⚽ Soccer</button>
            <button onClick={() => setSport('basketball')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${sport === 'basketball' ? 'bg-orange-500 text-white' : 'text-gray-400'}`}>🏀 NBA</button>
          </div>
        </div>

        {!currentTeam && !loading ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
            <div className="text-5xl mb-4">{sport === 'soccer' ? '⚽' : '🏀'}</div>
            <h2 className="text-lg font-semibold mb-2">No {sport} team yet</h2>
            <button onClick={handleCreateTeam} className="bg-green-500 text-gray-950 font-bold px-6 py-2.5 rounded-xl mt-4">Initialize Team</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                {(sport === 'soccer' ? Object.keys(FORMATIONS) : Object.keys(NBA_LINEUPS)).map(f => (
                  <button key={f} onClick={() => sport === 'soccer' ? setSoccerFormation(f) : setNbaLineup(f)} className={`px-3 py-1 rounded-lg text-xs border ${ (sport === 'soccer' ? soccerFormation : nbaLineup) === f ? 'bg-green-500 text-gray-950 border-green-500' : 'border-gray-700 text-gray-400'}`}>{f}</button>
                ))}
              </div>
              <button onClick={() => navigate('/search')} className="bg-green-500 text-gray-950 font-bold px-4 py-2 rounded-xl text-xs">+ Transfer</button>
            </div>

            {sport === 'soccer' ? (
              <SoccerPitch positions={positions} players={currentPlayers} onSlotClick={openPicker} onDragStart={handleDragStart} onDrop={handleDrop} />
            ) : (
              <NBACourt positions={positions} players={currentPlayers} onSlotClick={openPicker} onDragStart={handleDragStart} onDrop={handleDrop} />
            )}
          </>
        )}

        {selectedSlot && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden">
              <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                <p className="font-bold">Pick {selectedSlot.label}</p>
                <button onClick={() => setSelectedSlot(null)} className="text-2xl">&times;</button>
              </div>
              <div className="p-2 max-h-80 overflow-y-auto">
                {availablePlayers.length === 0 ? (
                  <p className="text-center py-10 text-gray-500">No players found. Go to search!</p>
                ) : (
                  availablePlayers.map(p => (
                    <div key={p._id} onClick={() => assignPlayer(selectedSlot, p)} className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-xl cursor-pointer">
                      <div className="w-10 h-10 bg-gray-800 rounded-full overflow-hidden">
                        {p.photo && <img src={p.photo} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.team} · {p.position}</p>
                      </div>
                      <span className="text-green-500 text-xl">+</span>
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