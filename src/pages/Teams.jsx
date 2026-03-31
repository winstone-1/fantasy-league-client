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
  '3-5-2': [
    { id: 'GK',  label: 'GK',  row: 0 },
    { id: 'CB1', label: 'CB',  row: 1 },
    { id: 'CB2', label: 'CB',  row: 1 },
    { id: 'CB3', label: 'CB',  row: 1 },
    { id: 'LM',  label: 'LM',  row: 2 },
    { id: 'CM1', label: 'CM',  row: 2 },
    { id: 'CM2', label: 'CM',  row: 2 },
    { id: 'CM3', label: 'CM',  row: 2 },
    { id: 'RM',  label: 'RM',  row: 2 },
    { id: 'ST1', label: 'ST',  row: 3 },
    { id: 'ST2', label: 'ST',  row: 3 },
  ],
}

// ── NBA lineups ────────────────────────────────────────────
const NBA_LINEUPS = {
  'Standard': [
    { id: 'PG', label: 'PG', bench: false },
    { id: 'SG', label: 'SG', bench: false },
    { id: 'SF', label: 'SF', bench: false },
    { id: 'PF', label: 'PF', bench: false },
    { id: 'C',  label: 'C',  bench: false },
    { id: 'B1', label: 'BN', bench: true  },
    { id: 'B2', label: 'BN', bench: true  },
    { id: 'B3', label: 'BN', bench: true  },
  ],
  'Small Ball': [
    { id: 'PG',  label: 'PG', bench: false },
    { id: 'SG',  label: 'SG', bench: false },
    { id: 'SF1', label: 'SF', bench: false },
    { id: 'SF2', label: 'SF', bench: false },
    { id: 'PF',  label: 'PF', bench: false },
    { id: 'B1',  label: 'BN', bench: true  },
    { id: 'B2',  label: 'BN', bench: true  },
    { id: 'B3',  label: 'BN', bench: true  },
  ],
  'Twin Towers': [
    { id: 'PG', label: 'PG', bench: false },
    { id: 'SG', label: 'SG', bench: false },
    { id: 'SF', label: 'SF', bench: false },
    { id: 'C1', label: 'C',  bench: false },
    { id: 'C2', label: 'C',  bench: false },
    { id: 'B1', label: 'BN', bench: true  },
    { id: 'B2', label: 'BN', bench: true  },
    { id: 'B3', label: 'BN', bench: true  },
  ],
}

// ── Player Slot ────────────────────────────────────────────
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
          <span className="text-gray-500 text-xl">+</span>
        )}
      </div>
      <div className="text-center">
        <div className="bg-black/40 rounded px-2 py-0.5">
          <span className="text-xs font-bold text-gray-200">{position.label}</span>
        </div>
        {player && (
          <p className="text-xs text-white mt-0.5 max-w-16 truncate">
            {player.name.split(' ').pop()}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Soccer Pitch ───────────────────────────────────────────
function SoccerPitch({ positions, players, onSlotClick, onDragStart, onDragOver, onDrop }) {
  const rows = [...new Set(positions.map(p => p.row))].sort((a, b) => b - a)
  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #14532d 0%, #166534 30%, #15803d 50%, #166534 70%, #14532d 100%)',
        minHeight: '460px'
      }}
    >
      {/* Pitch lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-16 border-2 border-white/20 rounded-b-xl"/>
        <div className="absolute top-1/2 left-4 right-4 border-t border-white/15"/>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border-2 border-white/15 rounded-full"/>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-16 border-2 border-white/20 rounded-t-xl"/>
      </div>

      <div className="relative z-10 flex flex-col justify-around py-6 px-4" style={{ minHeight: '460px' }}>
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
                  onClick={onSlotClick}
                  onDragStart={onDragStart}
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                />
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── NBA Court ──────────────────────────────────────────────
function NBACourt({ positions, players, onSlotClick, onDragStart, onDragOver, onDrop }) {
  const starters = positions.filter(p => !p.bench)
  const bench    = positions.filter(p => p.bench)

  return (
    <div className="space-y-4">
      <div
        className="relative w-full rounded-2xl overflow-hidden p-8"
        style={{
          background: 'linear-gradient(180deg, #7c2d12 0%, #9a3412 40%, #7c2d12 100%)',
          minHeight: '220px'
        }}
      >
        {/* Court markings */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border-2 border-white/20 rounded-full"/>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-20 border-2 border-b-0 border-white/20 rounded-t-full"/>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 border-2 border-t-0 border-white/20 rounded-b-full"/>
        </div>
        <div className="relative z-10 flex justify-around items-center h-full">
          {starters.map(pos => (
            <PlayerSlot
              key={pos.id}
              position={pos}
              player={players[pos.id]}
              sport="basketball"
              onClick={onSlotClick}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
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
              position={pos}
              player={players[pos.id]}
              sport="basketball"
              onClick={onSlotClick}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
            />
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

  const [sport, setSport]               = useState('soccer')
  const [soccerFormation, setSoccerFormation] = useState('4-3-3')
  const [nbaLineup, setNbaLineup]       = useState('Standard')
  const [soccerTeam, setSoccerTeam]     = useState(null)
  const [nbaTeam, setNbaTeam]           = useState(null)
  const [soccerPlayers, setSoccerPlayers] = useState({})
  const [nbaPlayers, setNbaPlayers]     = useState({})
  const [availablePlayers, setAvailablePlayers] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [dragSource, setDragSource]     = useState(null)
  const [loading, setLoading]           = useState(true)

  useEffect(() => { fetchTeams() }, [])

  // Inside fetchTeams function
const fetchTeams = async () => {
  try {
    const leaguesRes = await api.get('/leagues');
    for (const league of leaguesRes.data) {
      const teamsRes = await api.get(`/leagues/${league._id}/teams`);
      const myTeam = teamsRes.data.find(t => t.owner?._id === user?._id);

      if (myTeam) {
        if (league.sport === 'soccer') {
          setSoccerTeam({ ...myTeam, leagueId: league._id });
          // Map backend roster [ {position: 'GK', player: {...}} ] to local state { GK: player }
          const mapped = {};
          myTeam.players?.forEach(p => mapped[p.position] = p.player);
          setSoccerPlayers(mapped);
        } else {
          setNbaTeam({ ...myTeam, leagueId: league._id });
          const mapped = {};
          myTeam.players?.forEach(p => mapped[p.position] = p.player);
          setNbaPlayers(mapped);
        }
      }
    }
  } catch (err) { console.error(err); } finally { setLoading(false); }
};

  const openPicker = async (pos) => {
    setSelectedSlot(pos)
    try {
      const res = await api.get(`/players/sport/${sport === 'soccer' ? 'soccer' : 'basketball'}`)
      setAvailablePlayers(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const assignPlayer = async (pos, player) => {
  const currentTeamId = sport === 'soccer' ? soccerTeam?._id : nbaTeam?._id;
  const currentLeagueId = sport === 'soccer' ? soccerTeam?.leagueId : nbaTeam?.leagueId;
  
  if (!currentTeamId || !currentLeagueId) return;

  try {
    // Match your backend: POST /api/leagues/:id/teams/:teamId/players
    await api.post(`/leagues/${currentLeagueId}/teams/${currentTeamId}/players`, {
      playerId: player._id,
      position: pos.id // Ensure your Team model supports storing the specific slot ID
    });

    // Update local UI state
    if (sport === 'soccer') setSoccerPlayers(p => ({ ...p, [pos.id]: player }));
    else setNbaPlayers(p => ({ ...p, [pos.id]: player }));
    
    setSelectedSlot(null);
  } catch (err) {
    console.error("Failed to save player:", err.response?.data?.message || err.message);
  }
};

  // Drag and drop handlers
  const handleDragStart = (pos, player) => setDragSource({ pos, player })

  const handleDrop = (targetPos) => {
    if (!dragSource) return
    const setter = sport === 'soccer' ? setSoccerPlayers : setNbaPlayers
    setter(prev => {
      const next = { ...prev }
      const targetPlayer = next[targetPos.id]
      next[targetPos.id]        = dragSource.player
      next[dragSource.pos.id]   = targetPlayer || undefined
      return next
    })
    setDragSource(null)
  }
const handleCreateTeam = async () => {
  try {
    // 1. Identify which sport we are trying to initialize
    const targetSport = sport === 'soccer' ? 'soccer' : 'basketball';

    // 2. Find a league you've joined that matches this sport
    const leaguesRes = await api.get('/leagues');
    const targetLeague = leaguesRes.data.find(l => l.sport === targetSport);

    if (!targetLeague) {
      alert(`Please join a ${targetSport} league first!`);
      return navigate('/leagues');
    }

    // 3. Create the team using the league ID in the URL as required by your backend
    const res = await api.post(`/leagues/${targetLeague._id}/teams`, {
      name: `${user.username || 'My'} ${sport === 'soccer' ? 'FC' : 'Squad'}`
    });

    // 4. Update state and re-sync
    if (sport === 'soccer') setSoccerTeam(res.data);
    else setNbaTeam(res.data);
    
    await fetchTeams(); 
  } catch (err) {
    console.error("Error creating team:", err.response?.data?.message || err.message);
    alert(err.response?.data?.message || "Failed to create team.");
  }
};

  const currentTeam    = sport === 'soccer' ? soccerTeam : nbaTeam
  const currentPlayers = sport === 'soccer' ? soccerPlayers : nbaPlayers
  const positions      = sport === 'soccer'
    ? FORMATIONS[soccerFormation]
    : NBA_LINEUPS[nbaLineup]

  const assigned = Object.values(currentPlayers).filter(Boolean).length

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">My Team</h1>
            <p className="text-gray-400 text-sm mt-1">
              {sport === 'soccer' ? soccerFormation : nbaLineup} · {assigned} players assigned
            </p>
          </div>

          {/* Sport toggle */}
          <div className="flex gap-2 bg-gray-900 p-1 rounded-xl border border-gray-800">
            <button
              onClick={() => setSport('soccer')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${sport === 'soccer' ? 'bg-green-500 text-gray-950' : 'text-gray-400 hover:text-white'}`}
            >⚽ Soccer</button>
            <button
              onClick={() => setSport('basketball')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${sport === 'basketball' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}
            >🏀 NBA</button>
          </div>
        </div>

        {/* Formation/Lineup switcher */}
        {currentTeam && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-gray-500 uppercase tracking-wider">
              {sport === 'soccer' ? 'Formation' : 'Lineup'}:
            </span>
            {(sport === 'soccer' ? Object.keys(FORMATIONS) : Object.keys(NBA_LINEUPS)).map(f => (
              <button
                key={f}
                onClick={() => {
                  if (sport === 'soccer') setSoccerFormation(f)
                  else setNbaLineup(f)
                }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition border ${
                  (sport === 'soccer' ? soccerFormation : nbaLineup) === f
                    ? 'bg-green-500 text-gray-950 border-green-500'
                    : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                }`}
              >{f}</button>
            ))}
          </div>
        )}

        {/* No team state */}
{!currentTeam && !loading && (
  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
    <div className="text-5xl mb-4">{sport === 'soccer' ? '⚽' : '🏀'}</div>
    <h2 className="text-lg font-semibold mb-2">
      No {sport === 'soccer' ? 'soccer' : 'NBA'} team yet
    </h2>
    <p className="text-gray-400 text-sm mb-6">
      You are in a league, but you need to initialize your team roster.
    </p>
    <div className="flex flex-col gap-3 max-w-xs mx-auto">
      {/* THIS BUTTON TRIGGERS THE NEW handleCreateTeam LOGIC */}
      <button
        onClick={handleCreateTeam}
        className={`${sport === 'soccer' ? 'bg-green-500' : 'bg-orange-500'} hover:opacity-90 text-gray-950 font-bold px-6 py-2.5 rounded-xl transition text-sm`}
      >
        Initialize {sport === 'soccer' ? 'Winstone FC' : 'NBA Squad'}
      </button>
      
      <button
        onClick={() => navigate('/leagues')}
        className="text-gray-500 hover:text-white text-xs transition underline"
      >
        Switch Leagues
      </button>
    </div>
  </div>
)}
        {/* Pitch / Court */}
        {currentTeam && (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-400">
                💡 Click a slot to assign · Drag to swap players
              </p>
              <button
                onClick={() => navigate('/search')}
                className="bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-4 py-2 rounded-xl text-sm transition"
              >+ Make Transfer</button>
            </div>

            {sport === 'soccer' ? (
              <SoccerPitch
                positions={positions}
                players={currentPlayers}
                onSlotClick={openPicker}
                onDragStart={handleDragStart}
                onDragOver={() => {}}
                onDrop={handleDrop}
              />
            ) : (
              <NBACourt
                positions={positions}
                players={currentPlayers}
                onSlotClick={openPicker}
                onDragStart={handleDragStart}
                onDragOver={() => {}}
                onDrop={handleDrop}
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
                  Pick player for <span className="text-green-400">{selectedSlot.label}</span>
                </p>
                <button onClick={() => setSelectedSlot(null)} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
              </div>
              <div className="overflow-y-auto max-h-72 p-2">
                {availablePlayers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">No players cached yet</p>
                    <button
                      onClick={() => { setSelectedSlot(null); navigate('/search') }}
                      className="mt-3 text-green-400 text-sm hover:text-green-300"
                    >Search for players first →</button>
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
                        <p className="text-sm font-medium">{player.name}</p>
                        <p className="text-xs text-gray-400">{player.team} · {player.position}</p>
                      </div>
                      <span className="text-green-400">+</span>
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