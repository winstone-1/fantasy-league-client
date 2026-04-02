import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import api from '../api/axios'
import { FaBasketballBall, FaFutbol } from 'react-icons/fa'

// ── Soccer formations (expanded) ──────────────────────────────────────
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
    { id: 'CDM', label: 'CDM', row: 2 },
    { id: 'LM',  label: 'LM',  row: 2 },
    { id: 'CM1', label: 'CM',  row: 2 },
    { id: 'CM2', label: 'CM',  row: 2 },
    { id: 'RM',  label: 'RM',  row: 2 },
    { id: 'ST1', label: 'ST',  row: 3 },
    { id: 'ST2', label: 'ST',  row: 3 },
  ],
  '4-2-3-1': [
    { id: 'GK',   label: 'GK',  row: 0 },
    { id: 'LB',   label: 'LB',  row: 1 },
    { id: 'CB1',  label: 'CB',  row: 1 },
    { id: 'CB2',  label: 'CB',  row: 1 },
    { id: 'RB',   label: 'RB',  row: 1 },
    { id: 'CDM1', label: 'CDM', row: 2 },
    { id: 'CDM2', label: 'CDM', row: 2 },
    { id: 'CAM',  label: 'CAM', row: 2 },
    { id: 'LW',   label: 'LW',  row: 3 },
    { id: 'ST',   label: 'ST',  row: 3 },
    { id: 'RW',   label: 'RW',  row: 3 },
  ],
  '5-3-2': [
    { id: 'GK',  label: 'GK',  row: 0 },
    { id: 'LWB', label: 'LWB', row: 1 },
    { id: 'CB1', label: 'CB',  row: 1 },
    { id: 'CB2', label: 'CB',  row: 1 },
    { id: 'CB3', label: 'CB',  row: 1 },
    { id: 'RWB', label: 'RWB', row: 1 },
    { id: 'CM1', label: 'CM',  row: 2 },
    { id: 'CM2', label: 'CM',  row: 2 },
    { id: 'CM3', label: 'CM',  row: 2 },
    { id: 'ST1', label: 'ST',  row: 3 },
    { id: 'ST2', label: 'ST',  row: 3 },
  ],
  '3-4-3': [
    { id: 'GK',  label: 'GK',  row: 0 },
    { id: 'CB1', label: 'CB',  row: 1 },
    { id: 'CB2', label: 'CB',  row: 1 },
    { id: 'CB3', label: 'CB',  row: 1 },
    { id: 'LM',  label: 'LM',  row: 2 },
    { id: 'CM1', label: 'CM',  row: 2 },
    { id: 'CM2', label: 'CM',  row: 2 },
    { id: 'RM',  label: 'RM',  row: 2 },
    { id: 'LW',  label: 'LW',  row: 3 },
    { id: 'ST',  label: 'ST',  row: 3 },
    { id: 'RW',  label: 'RW',  row: 3 },
  ],
  '4-5-1': [
    { id: 'GK',  label: 'GK',  row: 0 },
    { id: 'LB',  label: 'LB',  row: 1 },
    { id: 'CB1', label: 'CB',  row: 1 },
    { id: 'CB2', label: 'CB',  row: 1 },
    { id: 'RB',  label: 'RB',  row: 1 },
    { id: 'CDM', label: 'CDM', row: 2 },
    { id: 'LM',  label: 'LM',  row: 2 },
    { id: 'CM1', label: 'CM',  row: 2 },
    { id: 'CM2', label: 'CM',  row: 2 },
    { id: 'RM',  label: 'RM',  row: 2 },
    { id: 'ST',  label: 'ST',  row: 3 },
  ],
  '4-1-4-1': [
    { id: 'GK',  label: 'GK',  row: 0 },
    { id: 'LB',  label: 'LB',  row: 1 },
    { id: 'CB1', label: 'CB',  row: 1 },
    { id: 'CB2', label: 'CB',  row: 1 },
    { id: 'RB',  label: 'RB',  row: 1 },
    { id: 'CDM', label: 'CDM', row: 2 },
    { id: 'LM',  label: 'LM',  row: 2 },
    { id: 'CM',  label: 'CM',  row: 2 },
    { id: 'RM',  label: 'RM',  row: 2 },
    { id: 'CAM', label: 'CAM', row: 3 },
    { id: 'ST',  label: 'ST',  row: 4 },
  ],
  '3-3-3-1': [
    { id: 'GK',  label: 'GK',  row: 0 },
    { id: 'CB1', label: 'CB',  row: 1 },
    { id: 'CB2', label: 'CB',  row: 1 },
    { id: 'CB3', label: 'CB',  row: 1 },
    { id: 'CDM', label: 'CDM', row: 2 },
    { id: 'CM1', label: 'CM',  row: 2 },
    { id: 'CM2', label: 'CM',  row: 2 },
    { id: 'LW',  label: 'LW',  row: 3 },
    { id: 'CAM', label: 'CAM', row: 3 },
    { id: 'RW',  label: 'RW',  row: 3 },
    { id: 'ST',  label: 'ST',  row: 4 },
  ],
  '5-4-1': [
    { id: 'GK',  label: 'GK',  row: 0 },
    { id: 'LWB', label: 'LWB', row: 1 },
    { id: 'CB1', label: 'CB',  row: 1 },
    { id: 'CB2', label: 'CB',  row: 1 },
    { id: 'CB3', label: 'CB',  row: 1 },
    { id: 'RWB', label: 'RWB', row: 1 },
    { id: 'LM',  label: 'LM',  row: 2 },
    { id: 'CM1', label: 'CM',  row: 2 },
    { id: 'CM2', label: 'CM',  row: 2 },
    { id: 'RM',  label: 'RM',  row: 2 },
    { id: 'ST',  label: 'ST',  row: 3 },
  ],
}

// ── NBA lineups (expanded) ────────────────────────────────────────────
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
  'Big Ball': [
    { id: 'NBA_PG',  label: 'PG', bench: false },
    { id: 'NBA_SG',  label: 'SG', bench: false },
    { id: 'NBA_SF',  label: 'SF', bench: false },
    { id: 'NBA_PF1', label: 'PF', bench: false },
    { id: 'NBA_PF2', label: 'PF', bench: false },
    { id: 'NBA_C',   label: 'C',  bench: false },
    { id: 'NBA_B1',  label: 'BN', bench: true  },
    { id: 'NBA_B2',  label: 'BN', bench: true  },
  ],
  'Three Guards': [
    { id: 'NBA_PG1', label: 'PG', bench: false },
    { id: 'NBA_PG2', label: 'PG', bench: false },
    { id: 'NBA_SG',  label: 'SG', bench: false },
    { id: 'NBA_SF',  label: 'SF', bench: false },
    { id: 'NBA_PF',  label: 'PF', bench: false },
    { id: 'NBA_C',   label: 'C',  bench: false },
    { id: 'NBA_B1',  label: 'BN', bench: true  },
    { id: 'NBA_B2',  label: 'BN', bench: true  },
  ],
  'Shooting Focus': [
    { id: 'NBA_PG',  label: 'PG', bench: false },
    { id: 'NBA_SG1', label: 'SG', bench: false },
    { id: 'NBA_SG2', label: 'SG', bench: false },
    { id: 'NBA_SF',  label: 'SF', bench: false },
    { id: 'NBA_PF',  label: 'PF', bench: false },
    { id: 'NBA_C',   label: 'C',  bench: false },
    { id: 'NBA_B1',  label: 'BN', bench: true  },
    { id: 'NBA_B2',  label: 'BN', bench: true  },
  ],
  'Defensive': [
    { id: 'NBA_PG',  label: 'PG', bench: false },
    { id: 'NBA_SG',  label: 'SG', bench: false },
    { id: 'NBA_SF',  label: 'SF', bench: false },
    { id: 'NBA_PF',  label: 'PF', bench: false },
    { id: 'NBA_C1',  label: 'C',  bench: false },
    { id: 'NBA_C2',  label: 'C',  bench: false },
    { id: 'NBA_B1',  label: 'BN', bench: true  },
    { id: 'NBA_B2',  label: 'BN', bench: true  },
  ],
  'Deep Bench': [
    { id: 'NBA_PG', label: 'PG', bench: false },
    { id: 'NBA_SG', label: 'SG', bench: false },
    { id: 'NBA_SF', label: 'SF', bench: false },
    { id: 'NBA_PF', label: 'PF', bench: false },
    { id: 'NBA_C',  label: 'C',  bench: false },
    { id: 'NBA_B1', label: 'BN', bench: true  },
    { id: 'NBA_B2', label: 'BN', bench: true  },
    { id: 'NBA_B3', label: 'BN', bench: true  },
    { id: 'NBA_B4', label: 'BN', bench: true  },
    { id: 'NBA_B5', label: 'BN', bench: true  },
  ],
  'Positionless': [
    { id: 'NBA_G1', label: 'G', bench: false },
    { id: 'NBA_G2', label: 'G', bench: false },
    { id: 'NBA_F1', label: 'F', bench: false },
    { id: 'NBA_F2', label: 'F', bench: false },
    { id: 'NBA_F3', label: 'F', bench: false },
    { id: 'NBA_C',  label: 'C', bench: false },
    { id: 'NBA_B1', label: 'BN', bench: true  },
    { id: 'NBA_B2', label: 'BN', bench: true  },
  ],
}

// ── Sub-Components ─────────────────────────────────────────
function PlayerSlot({ position, player, sport, onDragOver, onDrop, onDragStart, onClick, onContextMenu }) {
  return (
    <div
      className="flex flex-col items-center gap-1 cursor-pointer group"
      onDragOver={e => { e.preventDefault(); onDragOver && onDragOver(position) }}
      onDrop={e => { e.preventDefault(); onDrop && onDrop(position) }}
      onClick={() => onClick && onClick(position)}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu && onContextMenu(position);
      }}
    >
      <div
        draggable={!!player}
        onDragStart={(e) => {
          if (player) {
            e.dataTransfer.setData('text/plain', JSON.stringify({ position: position, player: player }))
            onDragStart && onDragStart(position, player)
          } else {
            e.preventDefault()
          }
        }}
        className={`relative w-14 h-14 rounded-full border-2 flex items-center justify-center transition ${
          player
            ? 'border-green-500 bg-gray-800 hover:border-green-400 shadow-lg shadow-green-500/20'
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
              <span className="text-xl">{sport === 'basketball' ? <FaBasketballBall /> : <FaFutbol />}</span>
            )}
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-gray-950">
              <span className="text-[10px] text-gray-950 font-bold italic">✓</span>
            </div>
          </>
        ) : (
          <span className="text-gray-500 text-xl font-light">+</span>
        )}
      </div>
      <div className="text-center">
        <div className="bg-black/60 backdrop-blur-md rounded px-2 py-0.5 border border-white/10">
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">{position.label}</span>
        </div>
        {player && (
          <>
            <p className="text-[11px] font-medium text-white mt-1 max-w-[70px] truncate drop-shadow-md">
              {player?.name?.split(' ').pop() || 'Player'}
            </p>
            <p className="text-[9px] text-gray-400 mt-0.5">
              {player?.position || ''}
            </p>
          </>
        )}
      </div>
    </div>
  )
}

function SoccerPitch({ positions, players, onSlotClick, onDragStart, onDragOver, onDrop, onRemovePlayer }) {
  const rows = [...new Set(positions.map(p => p.row))].sort((a, b) => b - a)
  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-green-900 border-4 border-white/10 shadow-2xl" style={{ minHeight: '520px', background: 'linear-gradient(180deg, #14532d 0%, #166534 50%, #14532d 100%)' }}>
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 border-2 border-white rounded-b-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 border-2 border-white rounded-t-3xl" />
        <div className="absolute top-1/2 left-0 right-0 border-t-2 border-white" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 border-2 border-white rounded-full" />
      </div>
      <div className="relative z-10 flex flex-col justify-around py-8 h-full" style={{ minHeight: '520px' }}>
        {rows.map(row => (
          <div key={row} className="flex justify-around items-center px-4">
            {positions.filter(p => p.row === row).map(pos => (
              <PlayerSlot 
                key={pos.id} 
                position={pos} 
                player={players[pos.id]} 
                sport="soccer" 
                onClick={onSlotClick} 
                onDragStart={onDragStart} 
                onDragOver={onDragOver} 
                onDrop={onDrop}
                onContextMenu={onRemovePlayer}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function NBACourt({ positions, players, onSlotClick, onDragStart, onDragOver, onDrop, onRemovePlayer }) {
  const starters = positions.filter(p => !p.bench)
  const bench = positions.filter(p => p.bench)
  return (
    <div className="space-y-6">
      <div className="relative w-full rounded-3xl overflow-hidden p-10 bg-orange-950 border-4 border-white/10 shadow-2xl" style={{ minHeight: '260px', background: 'radial-gradient(circle, #9a3412 0%, #7c2d12 100%)' }}>
        <div className="absolute inset-0 pointer-events-none opacity-10">
           <div className="absolute top-0 left-0 bottom-0 w-1/2 border-r-2 border-white" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-white rounded-full" />
        </div>
        <div className="relative z-10 flex justify-around items-center h-full flex-wrap gap-4">
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
              onContextMenu={onRemovePlayer}
            />
          ))}
        </div>
      </div>
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 text-center">Interchange / Bench</p>
        <div className="flex gap-6 justify-center flex-wrap">
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
              onContextMenu={onRemovePlayer}
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
  const [saving, setSaving] = useState(false)

  useEffect(() => { 
    if (user) {
      fetchTeams() 
    }
  }, [user])

  const fetchTeams = async () => {
    try {
      setLoading(true)
      const leaguesRes = await api.get('/leagues');
      
      let soccerTeamFound = null
      let nbaTeamFound = null
      let soccerPlayersMap = {}
      let nbaPlayersMap = {}
      
      for (const league of leaguesRes.data) {
        try {
          const teamsRes = await api.get(`/leagues/${league._id}/teams`);
          const myTeam = teamsRes.data.find(t => t.owner?._id === user?._id);

          if (myTeam) {
            const mapped = {};
            if (myTeam.players && Array.isArray(myTeam.players)) {
              myTeam.players.forEach(item => {
                if (item.position && item.player) {
                  mapped[item.position] = item.player._id ? item.player : item.player;
                }
              });
            }

            if (league.sport === 'soccer') {
              soccerTeamFound = { ...myTeam, leagueId: league._id };
              soccerPlayersMap = mapped;
            } else if (league.sport === 'basketball') {
              nbaTeamFound = { ...myTeam, leagueId: league._id };
              nbaPlayersMap = mapped;
            }
          }
        } catch (err) {
          console.error(`Error fetching teams for league ${league._id}:`, err)
        }
      }
      
      setSoccerTeam(soccerTeamFound)
      setNbaTeam(nbaTeamFound)
      setSoccerPlayers(soccerPlayersMap)
      setNbaPlayers(nbaPlayersMap)
      
    } catch (err) { 
      console.error('Error fetching teams:', err); 
    } finally {
      setLoading(false)
    }
  };

  const handleCreateTeam = async () => {
    try {
      setLoading(true)
      const targetSport = sport === 'soccer' ? 'soccer' : 'basketball'
      const leaguesRes = await api.get('/leagues')
      const targetLeague = leaguesRes.data.find(l => l.sport === targetSport)

      if (!targetLeague) {
        alert(`Please join a ${targetSport} league first!`)
        return navigate('/leagues')
      }

      const response = await api.post(`/leagues/${targetLeague._id}/teams`, {
        name: `${user.username || 'My'} ${sport === 'soccer' ? 'FC' : 'Squad'}`
      })

      const positions = sport === 'soccer' ? FORMATIONS[soccerFormation] : NBA_LINEUPS[nbaLineup]
      const emptyRoster = positions.reduce((acc, pos) => {
        acc[pos.id] = null
        return acc
      }, {})

      if (sport === 'soccer') {
        setSoccerTeam({ ...response.data, leagueId: targetLeague._id })
        setSoccerPlayers(emptyRoster)
      } else {
        setNbaTeam({ ...response.data, leagueId: targetLeague._id })
        setNbaPlayers(emptyRoster)
      }

      await fetchTeams()
    } catch (err) {
      console.error('Create team error:', err)
      alert(err.response?.data?.message || "Failed to create team.")
    } finally {
      setLoading(false)
    }
  }

  const openPicker = async (pos) => {
    setSelectedSlot(pos)
    try {
      const res = await api.get(`/players/sport/${sport === 'soccer' ? 'soccer' : 'basketball'}`)
      setAvailablePlayers(res.data)
    } catch (err) { 
      console.error('Error fetching players:', err)
      alert('Failed to load available players')
    }
  }

  const assignPlayer = (pos, player) => {
    const setter = sport === 'soccer' ? setSoccerPlayers : setNbaPlayers;
    setter(prev => ({
      ...prev,
      [pos.id]: player
    }));
    setSelectedSlot(null);
  };

  const removePlayer = (pos) => {
    if (window.confirm(`Remove ${pos.label} from the roster?`)) {
      const setter = sport === 'soccer' ? setSoccerPlayers : setNbaPlayers;
      setter(prev => ({
        ...prev,
        [pos.id]: null
      }));
    }
  };

  const saveTeam = async () => {
    const currentTeam = sport === 'soccer' ? soccerTeam : nbaTeam;
    const currentPlayers = sport === 'soccer' ? soccerPlayers : nbaPlayers;

    if (!currentTeam) {
      alert("No team initialized!");
      return;
    }

    const roster = Object.entries(currentPlayers)
      .filter(([_, player]) => player && player._id)
      .map(([slotId, player]) => ({
        position: slotId,
        player: player._id
      }));

    if (roster.length === 0) {
      alert("Please add at least one player to your roster before saving.");
      return;
    }

    try {
      setSaving(true);
      await api.put(`/leagues/${currentTeam.leagueId}/teams/${currentTeam._id}`, {
        players: roster
      });
      
      await fetchTeams();
      alert("Team saved successfully!");
    } catch (err) {
      console.error('Save error:', err);
      alert(err.response?.data?.message || "Failed to save team.");
    } finally {
      setSaving(false);
    }
  };

  const handleFormationChange = (formation) => {
    if (sport === 'soccer') {
      // Preserve existing players that match position IDs
      const newPositions = FORMATIONS[formation]
      const currentPlayersMap = { ...soccerPlayers }
      const newPlayersMap = {}
      
      newPositions.forEach(pos => {
        // Try to keep existing player if position ID exists in old formation
        if (currentPlayersMap[pos.id]) {
          newPlayersMap[pos.id] = currentPlayersMap[pos.id]
        } else {
          newPlayersMap[pos.id] = null
        }
      })
      
      setSoccerPlayers(newPlayersMap)
      setSoccerFormation(formation)
    } else {
      const newPositions = NBA_LINEUPS[formation]
      const currentPlayersMap = { ...nbaPlayers }
      const newPlayersMap = {}
      
      newPositions.forEach(pos => {
        if (currentPlayersMap[pos.id]) {
          newPlayersMap[pos.id] = currentPlayersMap[pos.id]
        } else {
          newPlayersMap[pos.id] = null
        }
      })
      
      setNbaPlayers(newPlayersMap)
      setNbaLineup(formation)
    }
  }

  const handleDragStart = (pos, player) => {
    if (player) {
      setDragSource({ pos, player })
    }
  }
  
  const handleDrop = (targetPos) => {
    if (!dragSource) return
    if (dragSource.pos.id === targetPos.id) {
      setDragSource(null)
      return
    }
    
    const setter = sport === 'soccer' ? setSoccerPlayers : setNbaPlayers
    setter(prev => {
      const next = { ...prev }
      const targetPlayer = next[targetPos.id]
      const sourcePlayer = next[dragSource.pos.id]
      
      next[targetPos.id] = sourcePlayer
      next[dragSource.pos.id] = targetPlayer || null
      
      return next
    })
    setDragSource(null)
  }

  const currentTeam = sport === 'soccer' ? soccerTeam : nbaTeam
  const currentPlayers = sport === 'soccer' ? soccerPlayers : nbaPlayers
  const positions = sport === 'soccer' ? FORMATIONS[soccerFormation] : NBA_LINEUPS[nbaLineup]
  const playersCount = Object.keys(currentPlayers).filter(k => currentPlayers[k] && currentPlayers[k]._id).length;

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-32 selection:bg-green-500/30">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-1">Squad Management</h1>
            <p className="text-gray-500 font-medium italic">Configure your {sport} lineup for the next matchday.</p>
            <p className="text-xs text-gray-600 mt-2">💡 Right-click on a player to remove them</p>
          </div>
          <div className="flex p-1.5 bg-gray-900/80 backdrop-blur border border-gray-800 rounded-2xl shadow-inner">
            <button 
              onClick={() => setSport('soccer')} 
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${sport === 'soccer' ? 'bg-green-500 text-gray-950 shadow-lg shadow-green-500/20' : 'text-gray-400 hover:text-white'}`}
            >
              <FaFutbol /> Soccer
            </button>
            <button 
              onClick={() => setSport('basketball')} 
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${sport === 'basketball' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-gray-400 hover:text-white'}`}
            >
              <FaBasketballBall /> NBA
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-gray-900 border border-gray-800 rounded-[2rem] p-16 text-center shadow-2xl">
            <div className="inline-block w-12 h-12 border-4 border-white/30 border-t-green-500 rounded-full animate-spin"></div>
            <p className="text-gray-400 mt-4">Loading your teams...</p>
          </div>
        ) : !currentTeam ? (
          <div className="bg-gray-900 border border-gray-800 rounded-[2rem] p-16 text-center shadow-2xl">
            <div className="text-7xl mb-6 opacity-80 animate-bounce">{sport === 'soccer' ? <FaFutbol /> : <FaBasketballBall />}</div>
            <h2 className="text-2xl font-bold mb-3">No {sport} team detected</h2>
            <p className="text-gray-400 max-w-sm mx-auto mb-8">You haven't initialized a squad for this sport yet. Let's get your first team on the field!</p>
            <button onClick={handleCreateTeam} className="bg-white text-gray-950 font-black px-10 py-4 rounded-2xl hover:scale-105 active:scale-95 transition shadow-xl">Initialize Team</button>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2 p-1 bg-gray-900/50 rounded-xl border border-gray-800">
                {(sport === 'soccer' ? Object.keys(FORMATIONS) : Object.keys(NBA_LINEUPS)).map(f => (
                  <button 
                    key={f} 
                    onClick={() => handleFormationChange(f)} 
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${ (sport === 'soccer' ? soccerFormation : nbaLineup) === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              
              <div className="flex gap-3">
                 <button 
                  onClick={saveTeam} 
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition flex items-center gap-2 shadow-lg shadow-blue-600/20"
                 >
                   {saving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '💾'}
                   {saving ? 'Saving...' : 'Save Roster'}
                 </button>
                 <button onClick={() => navigate('/search')} className="bg-white hover:bg-gray-200 text-gray-950 font-black px-5 py-2.5 rounded-xl text-xs transition shadow-lg">
                   + New Transfer
                 </button>
              </div>
            </div>

            {/* Formation Info */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
              <p className="text-xs text-blue-400">
                🏆 Current Formation: <span className="font-bold">{sport === 'soccer' ? soccerFormation : nbaLineup}</span>
                {sport === 'soccer' && ` • ${positions.length} Players on Field`}
                {sport === 'basketball' && ` • ${positions.filter(p => !p.bench).length} Starters + ${positions.filter(p => p.bench).length} Bench`}
              </p>
            </div>

            {/* Field/Pitch Component */}
            <div className="relative">
              {sport === 'soccer' ? (
                <SoccerPitch 
                  positions={positions} 
                  players={currentPlayers} 
                  onSlotClick={openPicker} 
                  onDragStart={handleDragStart} 
                  onDragOver={() => {}} 
                  onDrop={handleDrop}
                  onRemovePlayer={removePlayer}
                />
              ) : (
                <NBACourt 
                  positions={positions} 
                  players={currentPlayers} 
                  onSlotClick={openPicker} 
                  onDragStart={handleDragStart} 
                  onDragOver={() => {}} 
                  onDrop={handleDrop}
                  onRemovePlayer={removePlayer}
                />
              )}
              
              {/* Floating Summary Card */}
              <div className="mt-8 bg-gray-900/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between backdrop-blur-sm">
                <div className="flex items-center gap-4">
                   <div className="h-10 w-10 bg-gray-800 rounded-full flex items-center justify-center font-bold text-lg text-green-500">
                     {playersCount}
                   </div>
                   <div>
                     <p className="text-xs font-bold text-white uppercase tracking-widest">Active Roster</p>
                     <p className="text-[10px] text-gray-500">{positions.length - playersCount} slots remaining</p>
                   </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 italic">Drag players to swap positions</p>
                  <p className="text-[10px] text-gray-500">Right-click to remove player</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Player Picker Modal */}
        {selectedSlot && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
            <div className="bg-gray-900 border border-white/10 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-3xl">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gray-900/50">
                <div>
                  <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1">Squad Selection</p>
                  <p className="text-xl font-bold">Pick your {selectedSlot.label}</p>
                </div>
                <button onClick={() => setSelectedSlot(null)} className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all">&times;</button>
              </div>
              <div className="p-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
                {availablePlayers.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-sm mb-4">No scouts found any players.</p>
                    <button onClick={() => navigate('/search')} className="text-green-500 text-xs font-bold underline underline-offset-4 tracking-tight">Visit the Transfer Market →</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availablePlayers.map(p => (
                      <div 
                        key={p._id} 
                        onClick={() => assignPlayer(selectedSlot, p)} 
                        className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl cursor-pointer transition group border border-transparent hover:border-white/5"
                      >
                        <div className="w-12 h-12 bg-gray-800 rounded-full overflow-hidden border border-white/10 group-hover:border-green-500 transition-colors">
                          {p.photo ? <img src={p.photo} className="w-full h-full object-cover" alt={p.name} /> : <div className="w-full h-full flex items-center justify-center text-xl opacity-20">👤</div>}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-black text-white group-hover:text-green-400 transition-colors">{p.name}</p>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{p.team || 'Free Agent'} · {p.position}</p>
                          {p.rating && <p className="text-[9px] text-yellow-500">⭐ {p.rating}</p>}
                        </div>
                        <div className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center text-green-500 opacity-0 group-hover:opacity-100 transition-all">
                          +
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}