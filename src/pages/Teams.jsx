import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import api from '../api/axios'
import { FaBasketballBall, FaFutbol } from 'react-icons/fa'

// ── Soccer formations ──────────────────────────────────────────────────
const FORMATIONS = {
  '4-3-3': [
    { id: 'GK',  label: 'GK',  defaultX: 50, defaultY: 88 },
    { id: 'LB',  label: 'LB',  defaultX: 15, defaultY: 68 },
    { id: 'CB1', label: 'CB',  defaultX: 35, defaultY: 68 },
    { id: 'CB2', label: 'CB',  defaultX: 65, defaultY: 68 },
    { id: 'RB',  label: 'RB',  defaultX: 85, defaultY: 68 },
    { id: 'CM1', label: 'CM',  defaultX: 25, defaultY: 48 },
    { id: 'CM2', label: 'CM',  defaultX: 50, defaultY: 48 },
    { id: 'CM3', label: 'CM',  defaultX: 75, defaultY: 48 },
    { id: 'LW',  label: 'LW',  defaultX: 15, defaultY: 22 },
    { id: 'ST',  label: 'ST',  defaultX: 50, defaultY: 14 },
    { id: 'RW',  label: 'RW',  defaultX: 85, defaultY: 22 },
  ],
  '4-4-2': [
    { id: 'GK',  label: 'GK',  defaultX: 50, defaultY: 88 },
    { id: 'LB',  label: 'LB',  defaultX: 12, defaultY: 68 },
    { id: 'CB1', label: 'CB',  defaultX: 35, defaultY: 68 },
    { id: 'CB2', label: 'CB',  defaultX: 65, defaultY: 68 },
    { id: 'RB',  label: 'RB',  defaultX: 88, defaultY: 68 },
    { id: 'LM',  label: 'LM',  defaultX: 12, defaultY: 46 },
    { id: 'CM1', label: 'CM',  defaultX: 35, defaultY: 46 },
    { id: 'CM2', label: 'CM',  defaultX: 65, defaultY: 46 },
    { id: 'RM',  label: 'RM',  defaultX: 88, defaultY: 46 },
    { id: 'ST1', label: 'ST',  defaultX: 33, defaultY: 16 },
    { id: 'ST2', label: 'ST',  defaultX: 67, defaultY: 16 },
  ],
  '3-5-2': [
    { id: 'GK',  label: 'GK',  defaultX: 50, defaultY: 88 },
    { id: 'CB1', label: 'CB',  defaultX: 25, defaultY: 68 },
    { id: 'CB2', label: 'CB',  defaultX: 50, defaultY: 68 },
    { id: 'CB3', label: 'CB',  defaultX: 75, defaultY: 68 },
    { id: 'LM',  label: 'LM',  defaultX: 10, defaultY: 46 },
    { id: 'CDM', label: 'CDM', defaultX: 30, defaultY: 48 },
    { id: 'CM1', label: 'CM',  defaultX: 50, defaultY: 44 },
    { id: 'CM2', label: 'CM',  defaultX: 70, defaultY: 48 },
    { id: 'RM',  label: 'RM',  defaultX: 90, defaultY: 46 },
    { id: 'ST1', label: 'ST',  defaultX: 33, defaultY: 16 },
    { id: 'ST2', label: 'ST',  defaultX: 67, defaultY: 16 },
  ],
  '4-2-3-1': [
    { id: 'GK',   label: 'GK',  defaultX: 50, defaultY: 88 },
    { id: 'LB',   label: 'LB',  defaultX: 12, defaultY: 70 },
    { id: 'CB1',  label: 'CB',  defaultX: 35, defaultY: 70 },
    { id: 'CB2',  label: 'CB',  defaultX: 65, defaultY: 70 },
    { id: 'RB',   label: 'RB',  defaultX: 88, defaultY: 70 },
    { id: 'CDM1', label: 'CDM', defaultX: 35, defaultY: 52 },
    { id: 'CDM2', label: 'CDM', defaultX: 65, defaultY: 52 },
    { id: 'LW',   label: 'LW',  defaultX: 15, defaultY: 32 },
    { id: 'CAM',  label: 'CAM', defaultX: 50, defaultY: 34 },
    { id: 'RW',   label: 'RW',  defaultX: 85, defaultY: 32 },
    { id: 'ST',   label: 'ST',  defaultX: 50, defaultY: 12 },
  ],
  '5-3-2': [
    { id: 'GK',  label: 'GK',  defaultX: 50, defaultY: 88 },
    { id: 'LWB', label: 'LWB', defaultX: 8,  defaultY: 65 },
    { id: 'CB1', label: 'CB',  defaultX: 25, defaultY: 70 },
    { id: 'CB2', label: 'CB',  defaultX: 50, defaultY: 72 },
    { id: 'CB3', label: 'CB',  defaultX: 75, defaultY: 70 },
    { id: 'RWB', label: 'RWB', defaultX: 92, defaultY: 65 },
    { id: 'CM1', label: 'CM',  defaultX: 25, defaultY: 46 },
    { id: 'CM2', label: 'CM',  defaultX: 50, defaultY: 46 },
    { id: 'CM3', label: 'CM',  defaultX: 75, defaultY: 46 },
    { id: 'ST1', label: 'ST',  defaultX: 33, defaultY: 16 },
    { id: 'ST2', label: 'ST',  defaultX: 67, defaultY: 16 },
  ],
  '3-4-3': [
    { id: 'GK',  label: 'GK',  defaultX: 50, defaultY: 88 },
    { id: 'CB1', label: 'CB',  defaultX: 25, defaultY: 70 },
    { id: 'CB2', label: 'CB',  defaultX: 50, defaultY: 70 },
    { id: 'CB3', label: 'CB',  defaultX: 75, defaultY: 70 },
    { id: 'LM',  label: 'LM',  defaultX: 12, defaultY: 48 },
    { id: 'CM1', label: 'CM',  defaultX: 35, defaultY: 48 },
    { id: 'CM2', label: 'CM',  defaultX: 65, defaultY: 48 },
    { id: 'RM',  label: 'RM',  defaultX: 88, defaultY: 48 },
    { id: 'LW',  label: 'LW',  defaultX: 15, defaultY: 22 },
    { id: 'ST',  label: 'ST',  defaultX: 50, defaultY: 14 },
    { id: 'RW',  label: 'RW',  defaultX: 85, defaultY: 22 },
  ],
  '4-5-1': [
    { id: 'GK',  label: 'GK',  defaultX: 50, defaultY: 88 },
    { id: 'LB',  label: 'LB',  defaultX: 12, defaultY: 70 },
    { id: 'CB1', label: 'CB',  defaultX: 35, defaultY: 70 },
    { id: 'CB2', label: 'CB',  defaultX: 65, defaultY: 70 },
    { id: 'RB',  label: 'RB',  defaultX: 88, defaultY: 70 },
    { id: 'LM',  label: 'LM',  defaultX: 10, defaultY: 48 },
    { id: 'CM1', label: 'CM',  defaultX: 28, defaultY: 46 },
    { id: 'CDM', label: 'CDM', defaultX: 50, defaultY: 50 },
    { id: 'CM2', label: 'CM',  defaultX: 72, defaultY: 46 },
    { id: 'RM',  label: 'RM',  defaultX: 90, defaultY: 48 },
    { id: 'ST',  label: 'ST',  defaultX: 50, defaultY: 14 },
  ],
  '4-2-4': [
    { id: 'GK',  label: 'GK',  defaultX: 50, defaultY: 88 },
    { id: 'LB',  label: 'LB',  defaultX: 12, defaultY: 70 },
    { id: 'CB1', label: 'CB',  defaultX: 35, defaultY: 70 },
    { id: 'CB2', label: 'CB',  defaultX: 65, defaultY: 70 },
    { id: 'RB',  label: 'RB',  defaultX: 88, defaultY: 70 },
    { id: 'CDM1',label: 'CDM', defaultX: 35, defaultY: 50 },
    { id: 'CDM2',label: 'CDM', defaultX: 65, defaultY: 50 },
    { id: 'LW',  label: 'LW',  defaultX: 10, defaultY: 20 },
    { id: 'ST1', label: 'ST',  defaultX: 35, defaultY: 14 },
    { id: 'ST2', label: 'ST',  defaultX: 65, defaultY: 14 },
    { id: 'RW',  label: 'RW',  defaultX: 90, defaultY: 20 },
  ],
}

// ── NBA lineups ────────────────────────────────────────────────────────
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
  'Twin Towers': [
    { id: 'NBA_PG', label: 'PG', bench: false },
    { id: 'NBA_SG', label: 'SG', bench: false },
    { id: 'NBA_SF', label: 'SF', bench: false },
    { id: 'NBA_C1', label: 'C',  bench: false },
    { id: 'NBA_C2', label: 'C',  bench: false },
    { id: 'NBA_B1', label: 'BN', bench: true  },
    { id: 'NBA_B2', label: 'BN', bench: true  },
    { id: 'NBA_B3', label: 'BN', bench: true  },
  ],
  'Three Guards': [
    { id: 'NBA_PG1', label: 'PG', bench: false },
    { id: 'NBA_PG2', label: 'PG', bench: false },
    { id: 'NBA_SG',  label: 'SG', bench: false },
    { id: 'NBA_SF',  label: 'SF', bench: false },
    { id: 'NBA_PF',  label: 'PF', bench: false },
    { id: 'NBA_B1',  label: 'BN', bench: true  },
    { id: 'NBA_B2',  label: 'BN', bench: true  },
    { id: 'NBA_B3',  label: 'BN', bench: true  },
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
  'Run & Gun': [
    { id: 'NBA_PG1', label: 'PG', bench: false },
    { id: 'NBA_PG2', label: 'PG', bench: false },
    { id: 'NBA_SG',  label: 'SG', bench: false },
    { id: 'NBA_SF',  label: 'SF', bench: false },
    { id: 'NBA_PF',  label: 'PF', bench: false },
    { id: 'NBA_B1',  label: 'BN', bench: true  },
    { id: 'NBA_B2',  label: 'BN', bench: true  },
    { id: 'NBA_B3',  label: 'BN', bench: true  },
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
}

// ── Free-drag Soccer Pitch ─────────────────────────────────────────────
function FreeDragPitch({ formation, positions, playerPositions, onSlotClick, onRemovePlayer, onPositionChange, sport }) {
  const pitchRef = useRef(null)
  const draggingRef = useRef(null)
  const [draggingId, setDraggingId] = useState(null)

  const getRelativeCoords = (e, touch = false) => {
    const rect = pitchRef.current.getBoundingClientRect()
    const clientX = touch ? e.touches[0].clientX : e.clientX
    const clientY = touch ? e.touches[0].clientY : e.clientY
    const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
    const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100))
    return { x, y }
  }

  const handleMouseDown = (e, posId) => {
    e.preventDefault()
    draggingRef.current = posId
    setDraggingId(posId)

    const onMove = (moveEvent) => {
      if (!draggingRef.current || !pitchRef.current) return
      const { x, y } = getRelativeCoords(moveEvent)
      onPositionChange(draggingRef.current, x, y)
    }

    const onUp = () => {
      draggingRef.current = null
      setDraggingId(null)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const handleTouchStart = (e, posId) => {
    draggingRef.current = posId
    setDraggingId(posId)

    const onMove = (moveEvent) => {
      if (!draggingRef.current || !pitchRef.current) return
      const rect = pitchRef.current.getBoundingClientRect()
      const touch = moveEvent.touches[0]
      const x = Math.min(100, Math.max(0, ((touch.clientX - rect.left) / rect.width) * 100))
      const y = Math.min(100, Math.max(0, ((touch.clientY - rect.top) / rect.height) * 100))
      onPositionChange(draggingRef.current, x, y)
    }

    const onEnd = () => {
      draggingRef.current = null
      setDraggingId(null)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
    }

    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('touchend', onEnd)
  }

  return (
    <div
      ref={pitchRef}
      className="relative w-full rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl select-none"
      style={{
        paddingBottom: '130%',
        background: 'linear-gradient(180deg, #14532d 0%, #166534 40%, #15803d 50%, #166534 60%, #14532d 100%)'
      }}
    >
      {/* Pitch markings */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        {/* Top box */}
        <div className="absolute border-2 border-white" style={{ top: '2%', left: '25%', width: '50%', height: '14%' }} />
        {/* Bottom box */}
        <div className="absolute border-2 border-white" style={{ bottom: '2%', left: '25%', width: '50%', height: '14%' }} />
        {/* Centre line */}
        <div className="absolute border-t-2 border-white" style={{ top: '50%', left: 0, right: 0 }} />
        {/* Centre circle */}
        <div className="absolute border-2 border-white rounded-full" style={{ top: '41%', left: '31%', width: '38%', height: '18%' }} />
        {/* Centre dot */}
        <div className="absolute bg-white rounded-full w-2 h-2" style={{ top: 'calc(50% - 4px)', left: 'calc(50% - 4px)' }} />
      </div>

      {/* Player tokens — absolutely positioned */}
      <div className="absolute inset-0">
        {positions.map(pos => {
          const player = playerPositions[pos.id]
          const coords = pos
          const isDragging = draggingId === pos.id

          return (
            <div
              key={pos.id}
              className={`absolute flex flex-col items-center gap-0.5 transition-transform ${isDragging ? 'z-50 scale-110' : 'z-10'}`}
              style={{
                left: `${coords.x}%`,
                top: `${coords.y}%`,
                transform: 'translate(-50%, -50%)',
                cursor: isDragging ? 'grabbing' : 'grab',
                touchAction: 'none',
              }}
              onMouseDown={(e) => handleMouseDown(e, pos.id)}
              onTouchStart={(e) => handleTouchStart(e, pos.id)}
              onClick={(e) => {
                // Only open picker on click (not after drag)
                if (!isDragging) onSlotClick(pos)
              }}
              onContextMenu={(e) => { e.preventDefault(); onRemovePlayer(pos) }}
            >
              <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full border-2 flex items-center justify-center transition-all shadow-lg ${
                player
                  ? 'border-green-400 bg-gray-900 shadow-green-500/30'
                  : 'border-dashed border-white/50 bg-black/30 hover:border-green-400'
              } ${isDragging ? 'shadow-2xl shadow-green-500/50 ring-2 ring-green-400' : ''}`}>
                {player ? (
                  player.photo ? (
                    <img src={player.photo} alt={player.name} className="w-full h-full rounded-full object-cover" onError={e => { e.target.style.display = 'none' }} />
                  ) : (
                    <span className="text-white font-black text-xs">{player.name?.charAt(0) || '?'}</span>
                  )
                ) : (
                  <span className="text-white/50 text-lg font-light">+</span>
                )}
              </div>

              {/* Position badge */}
              <div className="bg-black/80 backdrop-blur rounded px-1.5 py-0.5 border border-white/10 pointer-events-none">
                <span className="text-[9px] font-black text-gray-300 uppercase tracking-wider">{pos.label}</span>
              </div>

              {/* Player name */}
              {player && (
                <div className="bg-green-500/90 rounded px-1.5 py-0.5 pointer-events-none max-w-[72px]">
                  <p className="text-[9px] font-black text-gray-950 truncate text-center">
                    {player.name?.split(' ').pop() || player.name || ''}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── NBA Court (keeps slot-based swap drag, no free drag needed) ────────
function NBACourt({ positions, players, onSlotClick, onDragStart, onDragOver, onDrop, onRemovePlayer }) {
  const starters = positions.filter(p => !p.bench)
  const bench = positions.filter(p => p.bench)

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="relative w-full rounded-3xl overflow-hidden p-6 sm:p-10 border-4 border-white/10 shadow-2xl" style={{ minHeight: '220px', background: 'radial-gradient(circle, #9a3412 0%, #7c2d12 100%)' }}>
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute top-0 left-0 bottom-0 w-1/2 border-r-2 border-white" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 sm:w-40 h-32 sm:h-40 border-2 border-white rounded-full" />
        </div>
        <div className="relative z-10 flex justify-around items-center h-full flex-wrap gap-3 sm:gap-4">
          {starters.map(pos => (
            <NBASlot key={pos.id} position={pos} player={players[pos.id]}
              onClick={onSlotClick} onDragStart={onDragStart} onDragOver={onDragOver}
              onDrop={onDrop} onContextMenu={onRemovePlayer} />
          ))}
        </div>
      </div>
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-4 sm:p-6">
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 text-center">Interchange / Bench</p>
        <div className="flex gap-4 sm:gap-6 justify-center flex-wrap">
          {bench.map(pos => (
            <NBASlot key={pos.id} position={pos} player={players[pos.id]}
              onClick={onSlotClick} onDragStart={onDragStart} onDragOver={onDragOver}
              onDrop={onDrop} onContextMenu={onRemovePlayer} />
          ))}
        </div>
      </div>
    </div>
  )
}

function NBASlot({ position, player, onClick, onDragStart, onDragOver, onDrop, onContextMenu }) {
  return (
    <div
      className="flex flex-col items-center gap-1 cursor-pointer group"
      onDragOver={e => { e.preventDefault(); onDragOver && onDragOver(position) }}
      onDrop={e => { e.preventDefault(); onDrop && onDrop(position) }}
      onClick={() => onClick && onClick(position)}
      onContextMenu={e => { e.preventDefault(); onContextMenu && onContextMenu(position) }}
    >
      <div
        draggable={!!player}
        onDragStart={e => {
          if (player) {
            e.dataTransfer.setData('text/plain', JSON.stringify({ position, player }))
            onDragStart && onDragStart(position, player)
          } else e.preventDefault()
        }}
        className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 flex items-center justify-center transition ${
          player
            ? 'border-orange-500 bg-gray-800 hover:border-orange-400 shadow-lg shadow-orange-500/20'
            : 'border-dashed border-gray-600 bg-black/20 hover:border-orange-500'
        }`}
      >
        {player ? (
          <>
            {player.photo ? (
              <img src={player.photo} alt={player.name} className="w-full h-full rounded-full object-cover" onError={e => { e.target.style.display = 'none' }} />
            ) : (
              <span className="text-white font-black text-sm">{player.name?.charAt(0) || '?'}</span>
            )}
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center border-2 border-gray-950">
              <span className="text-[10px] text-gray-950 font-bold">✓</span>
            </div>
          </>
        ) : (
          <span className="text-gray-500 text-xl font-light">+</span>
        )}
      </div>
      <div className="text-center">
        <div className="bg-black/60 rounded px-1.5 py-0.5 border border-white/10">
          <span className="text-[9px] font-bold text-gray-300 uppercase tracking-wider">{position.label}</span>
        </div>
        {player && (
          <p className="text-[10px] font-medium text-white mt-1 max-w-[60px] truncate">
            {player.name?.split(' ').pop() || player.name || ''}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────
export default function Teams() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [sport, setSport] = useState('soccer')
  const [soccerFormation, setSoccerFormation] = useState('4-3-3')
  const [nbaLineup, setNbaLineup] = useState('Standard')
  const [soccerTeam, setSoccerTeam] = useState(null)
  const [nbaTeam, setNbaTeam] = useState(null)

  // playerPositions: { [slotId]: { ...playerDoc, x: number, y: number } }
  const [soccerPlayers, setSoccerPlayers] = useState({})
  const [nbaPlayers, setNbaPlayers] = useState({})

  // Free-drag positions for soccer: { [slotId]: { x, y } }
  const [soccerCoords, setSoccerCoords] = useState({})

  const [availablePlayers, setAvailablePlayers] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [dragSource, setDragSource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Manual player add state
  const [showManualAdd, setShowManualAdd] = useState(false)
  const [manualName, setManualName] = useState('')
  const [manualPosition, setManualPosition] = useState('')
  const [manualTeam, setManualTeam] = useState('')
  const [manualLoading, setManualLoading] = useState(false)
  const [playerSearch, setPlayerSearch] = useState('')

  useEffect(() => { if (user) fetchTeams() }, [user])

  const fetchTeams = async () => {
    try {
      setLoading(true)
      const leaguesRes = await api.get('/leagues')
      let sTeam = null, nTeam = null, sMap = {}, nMap = {}, sCoordsMap = {}

      for (const league of leaguesRes.data) {
        try {
          const teamsRes = await api.get(`/leagues/${league._id}/teams`)
          const myTeam = teamsRes.data.find(t => t.owner?._id === user?._id)
          if (myTeam) {
            const mapped = {}
            const coords = {}
            if (myTeam.players && Array.isArray(myTeam.players)) {
              myTeam.players.forEach(item => {
                if (item.position && item.player) {
                  mapped[item.position] = item.player
                  if (item.x !== undefined && item.y !== undefined) {
                    coords[item.position] = { x: item.x, y: item.y }
                  }
                }
              })
            }
            if (league.sport === 'soccer') {
              sTeam = { ...myTeam, leagueId: league._id }
              sMap = mapped
              sCoordsMap = coords
            } else if (league.sport === 'basketball') {
              nTeam = { ...myTeam, leagueId: league._id }
              nMap = mapped
            }
          }
        } catch (err) { console.error(`Teams fetch error league ${league._id}:`, err) }
      }

      setSoccerTeam(sTeam); setNbaTeam(nTeam)
      setSoccerPlayers(sMap); setNbaPlayers(nMap)
      setSoccerCoords(sCoordsMap)
    } catch (err) {
      console.error('fetchTeams error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTeam = async () => {
    try {
      setLoading(true)
      const targetSport = sport === 'soccer' ? 'soccer' : 'basketball'
      const leaguesRes = await api.get('/leagues')
      const targetLeague = leaguesRes.data.find(l => l.sport === targetSport)
      if (!targetLeague) { alert(`Please join a ${targetSport} league first!`); return navigate('/leagues') }
      const response = await api.post(`/leagues/${targetLeague._id}/teams`, {
        name: `${user.username || 'My'} ${sport === 'soccer' ? 'FC' : 'Squad'}`
      })
      if (sport === 'soccer') setSoccerTeam({ ...response.data, leagueId: targetLeague._id })
      else setNbaTeam({ ...response.data, leagueId: targetLeague._id })
      await fetchTeams()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create team.')
    } finally {
      setLoading(false)
    }
  }

  const openPicker = async (pos) => {
    setSelectedSlot(pos)
    setPlayerSearch('')
    setShowManualAdd(false)
    try {
      const res = await api.get(`/players/sport/${sport === 'soccer' ? 'soccer' : 'basketball'}`)
      setAvailablePlayers(res.data)
    } catch (err) {
      console.error('Error fetching players:', err)
      setAvailablePlayers([])
    }
  }

  const assignPlayer = (pos, player) => {
    if (sport === 'soccer') {
      setSoccerPlayers(prev => ({ ...prev, [pos.id]: player }))
    } else {
      setNbaPlayers(prev => ({ ...prev, [pos.id]: player }))
    }
    setSelectedSlot(null)
    setShowManualAdd(false)
  }

  const removePlayer = (pos) => {
    if (window.confirm(`Remove ${pos.label} from roster?`)) {
      if (sport === 'soccer') setSoccerPlayers(prev => ({ ...prev, [pos.id]: null }))
      else setNbaPlayers(prev => ({ ...prev, [pos.id]: null }))
    }
  }

  // Free drag position update for soccer
  const handlePositionChange = useCallback((slotId, x, y) => {
    setSoccerCoords(prev => ({ ...prev, [slotId]: { x, y } }))
  }, [])

  // Build positions array for soccer with current x/y merged in
  const getSoccerPositions = () => {
    return FORMATIONS[soccerFormation].map(pos => ({
      ...pos,
      x: soccerCoords[pos.id]?.x ?? pos.defaultX,
      y: soccerCoords[pos.id]?.y ?? pos.defaultY,
    }))
  }

  const saveTeam = async () => {
    const currentTeam = sport === 'soccer' ? soccerTeam : nbaTeam
    const currentPlayers = sport === 'soccer' ? soccerPlayers : nbaPlayers
    if (!currentTeam) { alert('No team initialized!'); return }

    const roster = Object.entries(currentPlayers)
      .filter(([_, player]) => player && player._id)
      .map(([slotId, player]) => {
        const entry = { position: slotId, player: player._id }
        if (sport === 'soccer' && soccerCoords[slotId]) {
          entry.x = soccerCoords[slotId].x
          entry.y = soccerCoords[slotId].y
        }
        return entry
      })

    if (roster.length === 0) { alert('Add at least one player before saving.'); return }

    try {
      setSaving(true)
      await api.put(`/leagues/${currentTeam.leagueId}/teams/${currentTeam._id}`, { players: roster })
      await fetchTeams()
      alert('Team saved!')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save team.')
    } finally {
      setSaving(false)
    }
  }

  const handleFormationChange = (formation) => {
    if (sport === 'soccer') {
      const newPos = FORMATIONS[formation]
      const newMap = {}
      newPos.forEach(pos => { newMap[pos.id] = soccerPlayers[pos.id] || null })
      setSoccerPlayers(newMap)
      setSoccerFormation(formation)
      // Reset coords to defaults on formation change
      setSoccerCoords({})
    } else {
      const newPos = NBA_LINEUPS[formation]
      const newMap = {}
      newPos.forEach(pos => { newMap[pos.id] = nbaPlayers[pos.id] || null })
      setNbaPlayers(newMap)
      setNbaLineup(formation)
    }
  }

  // NBA swap drag
  const handleDragStart = (pos, player) => { if (player) setDragSource({ pos, player }) }
  const handleDrop = (targetPos) => {
    if (!dragSource) return
    if (dragSource.pos.id === targetPos.id) { setDragSource(null); return }
    setNbaPlayers(prev => {
      const next = { ...prev }
      const temp = next[targetPos.id]
      next[targetPos.id] = next[dragSource.pos.id]
      next[dragSource.pos.id] = temp || null
      return next
    })
    setDragSource(null)
  }

  const handleManualAdd = async () => {
    if (!manualName.trim()) return
    try {
      setManualLoading(true)
      const res = await api.post('/players/custom', {
        name: manualName.trim(),
        position: manualPosition.trim(),
        team: manualTeam.trim(),
        sport: sport === 'soccer' ? 'soccer' : 'basketball',
      })
      assignPlayer(selectedSlot, res.data)
      setManualName('')
      setManualPosition('')
      setManualTeam('')
      setShowManualAdd(false)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add player')
    } finally {
      setManualLoading(false)
    }
  }

  const currentTeam = sport === 'soccer' ? soccerTeam : nbaTeam
  const currentPlayers = sport === 'soccer' ? soccerPlayers : nbaPlayers
  const positions = sport === 'soccer' ? FORMATIONS[soccerFormation] : NBA_LINEUPS[nbaLineup]
  const playersCount = Object.values(currentPlayers).filter(p => p && p._id).length
  const filteredPlayers = availablePlayers.filter(p =>
    p.name?.toLowerCase().includes(playerSearch.toLowerCase()) ||
    p.team?.toLowerCase().includes(playerSearch.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-32 selection:bg-green-500/30">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-1">Squad Management</h1>
            <p className="text-gray-500 font-medium italic text-sm">Configure your {sport} lineup for the next matchday.</p>
            {sport === 'soccer' && (
              <p className="text-xs text-gray-600 mt-2">💡 Tap a token to assign · drag to reposition · right-click to remove</p>
            )}
          </div>
          <div className="flex p-1.5 bg-gray-900/80 backdrop-blur border border-gray-800 rounded-2xl shadow-inner self-start">
            <button onClick={() => setSport('soccer')}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                sport === 'soccer' ? 'bg-green-500 text-gray-950 shadow-lg shadow-green-500/20' : 'text-gray-400 hover:text-white'
              }`}>
              <FaFutbol /> Soccer
            </button>
            <button onClick={() => setSport('basketball')}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                sport === 'basketball' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-gray-400 hover:text-white'
              }`}>
              <FaBasketballBall /> NBA
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-gray-900 border border-gray-800 rounded-[2rem] p-12 text-center shadow-2xl">
            <div className="inline-block w-12 h-12 border-4 border-white/30 border-t-green-500 rounded-full animate-spin" />
            <p className="text-gray-400 mt-4">Loading your teams...</p>
          </div>
        ) : !currentTeam ? (
          <div className="bg-gray-900 border border-gray-800 rounded-[2rem] p-12 text-center shadow-2xl">
            <div className="text-5xl sm:text-7xl mb-6 opacity-80 animate-bounce flex justify-center">
              {sport === 'soccer' ? <FaFutbol /> : <FaBasketballBall />}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3">No {sport} team detected</h2>
            <p className="text-gray-400 max-w-sm mx-auto mb-8 text-sm">Initialize a squad to get started.</p>
            <button onClick={handleCreateTeam} className="bg-white text-gray-950 font-black px-8 py-3 rounded-2xl hover:scale-105 active:scale-95 transition shadow-xl">
              Initialize Team
            </button>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* Control Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="overflow-x-auto pb-1 scrollbar-hide">
                <div className="flex gap-1.5 p-1 bg-gray-900/50 rounded-xl border border-gray-800 w-max">
                  {(sport === 'soccer' ? Object.keys(FORMATIONS) : Object.keys(NBA_LINEUPS)).map(f => (
                    <button key={f} onClick={() => handleFormationChange(f)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                        (sport === 'soccer' ? soccerFormation : nbaLineup) === f
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-300'
                      }`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={saveTeam} disabled={saving}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-4 sm:px-6 py-2.5 rounded-xl text-xs transition flex items-center gap-2 shadow-lg shadow-blue-600/20">
                  {saving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '💾'}
                  {saving ? 'Saving...' : 'Save Roster'}
                </button>
                <button onClick={() => navigate('/search')} className="bg-white hover:bg-gray-200 text-gray-950 font-black px-4 py-2.5 rounded-xl text-xs transition shadow-lg">
                  + Transfer
                </button>
              </div>
            </div>

            {/* Formation badge */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
              <p className="text-xs text-blue-400">
                🏆 Formation: <span className="font-bold">{sport === 'soccer' ? soccerFormation : nbaLineup}</span>
                {sport === 'soccer' && ' · Drag tokens freely on the pitch'}
                {sport === 'basketball' && ` · ${positions.filter(p => !p.bench).length} Starters + ${positions.filter(p => p.bench).length} Bench`}
              </p>
            </div>

            {/* Pitch / Court */}
            {sport === 'soccer' ? (
              <FreeDragPitch
                formation={soccerFormation}
                positions={getSoccerPositions()}
                playerPositions={soccerPlayers}
                onSlotClick={openPicker}
                onRemovePlayer={removePlayer}
                onPositionChange={handlePositionChange}
                sport="soccer"
              />
            ) : (
              <NBACourt
                positions={NBA_LINEUPS[nbaLineup]}
                players={nbaPlayers}
                onSlotClick={openPicker}
                onDragStart={handleDragStart}
                onDragOver={() => {}}
                onDrop={handleDrop}
                onRemovePlayer={removePlayer}
              />
            )}

            {/* Summary */}
            <div className="bg-gray-900/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-gray-800 rounded-full flex items-center justify-center font-bold text-base text-green-500">
                  {playersCount}
                </div>
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-widest">Active Roster</p>
                  <p className="text-[10px] text-gray-500">{positions.length - playersCount} slots remaining</p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                {sport === 'soccer'
                  ? <p className="text-[10px] text-gray-500 italic">Drag tokens to reposition freely</p>
                  : <p className="text-[10px] text-gray-500 italic">Drag players to swap positions</p>
                }
                <p className="text-[10px] text-gray-500">Right-click to remove player</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Player Picker Modal ── */}
        {selectedSlot && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-end sm:items-center justify-center z-50 p-0 sm:p-6">
            <div className="bg-gray-900 border border-white/10 rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full sm:max-w-md overflow-hidden shadow-3xl">
              <div className="p-5 sm:p-6 border-b border-white/5 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1">Squad Selection</p>
                  <p className="text-lg font-bold">Pick your {selectedSlot.label}</p>
                </div>
                <button onClick={() => { setSelectedSlot(null); setShowManualAdd(false) }}
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition">&times;</button>
              </div>

              {/* Search bar */}
              <div className="px-4 pt-4">
                <input
                  type="text"
                  value={playerSearch}
                  onChange={e => setPlayerSearch(e.target.value)}
                  placeholder="Search by name or team..."
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-500"
                />
              </div>

              <div className="p-4 max-h-[50vh] overflow-y-auto">
                {/* Manual add toggle */}
                {!showManualAdd && (
                  <button
                    onClick={() => setShowManualAdd(true)}
                    className="w-full mb-3 border border-dashed border-gray-600 hover:border-green-500 text-gray-400 hover:text-green-400 rounded-2xl p-3 text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    ✏️ Player not listed? Add manually
                  </button>
                )}

                {/* Manual add form */}
                {showManualAdd && (
                  <div className="bg-gray-800/60 border border-green-500/30 rounded-2xl p-4 mb-3 space-y-2">
                    <p className="text-xs font-black text-green-400 uppercase tracking-wider mb-3">Add Custom Player</p>
                    <input
                      type="text"
                      value={manualName}
                      onChange={e => setManualName(e.target.value)}
                      placeholder="Player name *"
                      className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                    />
                    <input
                      type="text"
                      value={manualPosition}
                      onChange={e => setManualPosition(e.target.value)}
                      placeholder="Position (e.g. ST, PG)"
                      className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                    />
                    <input
                      type="text"
                      value={manualTeam}
                      onChange={e => setManualTeam(e.target.value)}
                      placeholder="Club / Team (optional)"
                      className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                    />
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleManualAdd}
                        disabled={!manualName.trim() || manualLoading}
                        className="flex-1 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-gray-950 font-black py-2 rounded-xl text-sm transition"
                      >
                        {manualLoading ? 'Adding...' : 'Add Player'}
                      </button>
                      <button
                        onClick={() => setShowManualAdd(false)}
                        className="px-4 text-gray-400 hover:text-white border border-gray-700 rounded-xl text-sm transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Player list */}
                {filteredPlayers.length === 0 && !showManualAdd ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm mb-2">No players found.</p>
                    <p className="text-gray-600 text-xs">Try the manual add option above.</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredPlayers.map(p => (
                      <div key={p._id} onClick={() => assignPlayer(selectedSlot, p)}
                        className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-2xl cursor-pointer transition group border border-transparent hover:border-white/5">
                        <div className="w-10 h-10 bg-gray-800 rounded-full overflow-hidden border border-white/10 group-hover:border-green-500 transition-colors shrink-0">
                          {p.photo
                            ? <img src={p.photo} className="w-full h-full object-cover" alt={p.name} />
                            : <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">{p.name?.charAt(0)}</div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-white group-hover:text-green-400 transition truncate">{p.name}</p>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                            {p.team || 'Free Agent'} · {p.position}
                            {p.isCustom && <span className="ml-1 text-yellow-500">✏️ Custom</span>}
                          </p>
                        </div>
                        <div className="h-7 w-7 rounded-full border border-white/10 flex items-center justify-center text-green-500 opacity-0 group-hover:opacity-100 transition shrink-0">+</div>
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