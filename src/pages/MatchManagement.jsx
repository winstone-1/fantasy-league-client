import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { FaFutbol, FaBasketballBall, FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaPlay, FaMapMarkerAlt } from 'react-icons/fa'

export default function MatchManagement() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [leagues, setLeagues] = useState([])
  const [selectedLeague, setSelectedLeague] = useState(null)
  const [matches, setMatches] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showScoreModal, setShowScoreModal] = useState(false)
  const [editingMatch, setEditingMatch] = useState(null)
  const [selectedMatchForScore, setSelectedMatchForScore] = useState(null)
  const [formData, setFormData] = useState({
    homeTeam: '',
    awayTeam: '',
    date: '',
    time: '',
    week: 1,
    venue: '',
    status: 'scheduled'
  })
  const [scoreData, setScoreData] = useState({
    homeScore: 0,
    awayScore: 0,
    minute: 0
  })

  useEffect(() => {
    checkCommissionerStatus()
  }, [user])

  const checkCommissionerStatus = async () => {
    try {
      const res = await api.get('/leagues')
      const userLeagues = res.data.filter(league =>
        league.commissioner?._id === user?._id
      )

      if (userLeagues.length === 0) {
        alert('You are not a commissioner of any league')
        navigate('/leagues')
        return
      }

      setLeagues(userLeagues)
      setSelectedLeague(userLeagues[0])
      await fetchTeams(userLeagues[0]._id)
      await fetchMatches(userLeagues[0]._id)
      setLoading(false)
    } catch (err) {
      console.error(err)
      alert('Error loading leagues')
      setLoading(false)
    }
  }

  const fetchTeams = async (leagueId) => {
    try {
      const res = await api.get(`/leagues/${leagueId}/teams`)
      setTeams(res.data)
    } catch (err) {
      console.error('Error fetching teams:', err)
    }
  }

  const fetchMatches = async (leagueId) => {
    try {
      const res = await api.get(`/leagues/${leagueId}/matches`)
      setMatches(res.data)
    } catch (err) {
      console.error('Error fetching matches:', err)
    }
  }

  const handleLeagueChange = async (leagueId) => {
    const league = leagues.find(l => l._id === leagueId)
    setSelectedLeague(league)
    await fetchTeams(leagueId)
    await fetchMatches(leagueId)
  }

  const handleCreateMatch = () => {
    setEditingMatch(null)
    setFormData({
      homeTeam: '',
      awayTeam: '',
      date: new Date().toISOString().split('T')[0],
      time: '19:00',
      week: 1,
      venue: '',
      status: 'scheduled'
    })
    setShowModal(true)
  }

  const handleEditMatch = (match) => {
    setEditingMatch(match)
    setFormData({
      homeTeam: match.homeTeam._id || match.homeTeam,
      awayTeam: match.awayTeam._id || match.awayTeam,
      date: match.date?.split('T')[0] || new Date().toISOString().split('T')[0],
      time: match.time || '19:00',
      week: match.week || 1,
      venue: match.venue || '',
      status: match.status || 'scheduled'
    })
    setShowModal(true)
  }

  const handleDeleteMatch = async (matchId) => {
    if (!window.confirm('Are you sure you want to delete this match?')) return
    try {
      await api.delete(`/leagues/${selectedLeague._id}/matches/${matchId}`)
      await fetchMatches(selectedLeague._id)
      alert('Match deleted successfully')
    } catch (err) {
      console.error(err)
      alert('Error deleting match')
    }
  }

  const handleSubmitMatch = async (e) => {
    e.preventDefault()

    if (!formData.homeTeam || !formData.awayTeam) {
      alert('Please select both teams')
      return
    }

    if (formData.homeTeam === formData.awayTeam) {
      alert('Cannot schedule a match with the same team')
      return
    }

    // Combine date + time into startTime
    const startTime = new Date(`${formData.date}T${formData.time}:00`).toISOString()

    const matchData = {
      homeTeam: formData.homeTeam,
      awayTeam: formData.awayTeam,
      date: formData.date,
      time: formData.time,
      startTime,
      week: Number(formData.week),
      venue: formData.venue,
      status: formData.status
    }

    try {
      if (editingMatch) {
        await api.put(`/leagues/${selectedLeague._id}/matches/${editingMatch._id}`, matchData)
        alert('Match updated successfully')
      } else {
        await api.post(`/leagues/${selectedLeague._id}/matches`, matchData)
        alert('Match created successfully')
      }

      setShowModal(false)
      await fetchMatches(selectedLeague._id)
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Error saving match')
    }
  }

  const handleUpdateScore = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/matches/${selectedMatchForScore._id}/score`, {
        homeScore: scoreData.homeScore,
        awayScore: scoreData.awayScore,
        minute: scoreData.minute
      })

      if (selectedMatchForScore.status !== 'live') {
        await api.patch(`/matches/${selectedMatchForScore._id}/status`, {
          status: 'live',
          minute: scoreData.minute
        })
      }

      alert('Score updated successfully')
      setShowScoreModal(false)
      await fetchMatches(selectedLeague._id)
    } catch (err) {
      console.error('Error updating score:', err)
      alert('Error updating score')
    }
  }

  const handleMatchStatus = async (matchId, status, minute = null) => {
    try {
      await api.patch(`/matches/${matchId}/status`, { status, minute })
      await fetchMatches(selectedLeague._id)
      alert(`Match marked as ${status}`)
    } catch (err) {
      console.error('Error updating status:', err)
      alert('Error updating status')
    }
  }

  const openScoreModal = (match) => {
    setSelectedMatchForScore(match)
    setScoreData({
      homeScore: match.homeScore || 0,
      awayScore: match.awayScore || 0,
      minute: match.minute || 0
    })
    setShowScoreModal(true)
  }

  const getStatusBadge = (status) => {
    const statuses = {
      scheduled: 'bg-gray-600',
      live: 'bg-green-500 animate-pulse',
      ht: 'bg-yellow-600',
      ft: 'bg-blue-600',
      cancelled: 'bg-red-600'
    }
    return statuses[status] || 'bg-gray-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Match Management</h1>
            <p className="text-gray-400 mt-1">Schedule, update scores, and manage matches</p>
          </div>
          <button
            onClick={handleCreateMatch}
            className="bg-green-600 hover:bg-green-500 px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition"
          >
            <FaPlus /> New Match
          </button>
        </div>

        {/* League Selector */}
        {leagues.length > 1 && (
          <div className="mb-6">
            <label className="text-sm text-gray-400 block mb-2">Select League</label>
            <select
              value={selectedLeague?._id || ''}
              onChange={(e) => handleLeagueChange(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white"
            >
              {leagues.map(league => (
                <option key={league._id} value={league._id}>
                  {league.name} ({league.sport})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Matches List */}
        <div className="space-y-4">
          {matches.length === 0 ? (
            <div className="text-center py-16 bg-gray-900/50 rounded-3xl">
              <p className="text-gray-400">No matches scheduled yet</p>
              <button onClick={handleCreateMatch} className="mt-4 text-green-500 hover:text-green-400">
                Create your first match →
              </button>
            </div>
          ) : (
            matches.map(match => (
              <div key={match._id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {match.sport === 'basketball' ? <FaBasketballBall /> : <FaFutbol />}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(match.status)}`}>
                        {match.status?.toUpperCase()}
                      </span>
                      {match.week && (
                        <span className="text-gray-500 text-xs">GW{match.week}</span>
                      )}
                      {match.minute > 0 && (
                        <span className="text-yellow-500 text-sm font-mono">{match.minute}'</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {match.date && new Date(match.date).toLocaleDateString()} {match.time}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex-1 text-center">
                      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-xl font-bold">{match.homeTeam?.name?.[0] || '?'}</span>
                      </div>
                      <p className="font-semibold">{match.homeTeam?.name || 'TBD'}</p>
                      <p className="text-3xl font-bold mt-2">{match.homeScore ?? 0}</p>
                    </div>

                    <div className="text-2xl font-black text-gray-600 px-4">VS</div>

                    <div className="flex-1 text-center">
                      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-xl font-bold">{match.awayTeam?.name?.[0] || '?'}</span>
                      </div>
                      <p className="font-semibold">{match.awayTeam?.name || 'TBD'}</p>
                      <p className="text-3xl font-bold mt-2">{match.awayScore ?? 0}</p>
                    </div>
                  </div>

                  {match.venue && (
                    <p className="text-sm text-gray-500 text-center mb-4 flex items-center justify-center gap-1">
                      <FaMapMarkerAlt /> {match.venue}
                    </p>
                  )}

                  <div className="flex gap-2 justify-end border-t border-gray-800 pt-4">
                    {match.status === 'scheduled' && (
                      <button
                        onClick={() => handleMatchStatus(match._id, 'live', 0)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-semibold flex items-center gap-2"
                      >
                        <FaPlay className="text-xs" /> Start Match
                      </button>
                    )}

                    {match.status === 'live' && (
                      <>
                        <button
                          onClick={() => handleMatchStatus(match._id, 'ht', match.minute)}
                          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-sm font-semibold"
                        >
                          Half Time
                        </button>
                        <button
                          onClick={() => handleMatchStatus(match._id, 'ft', match.minute)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold"
                        >
                          End Match
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => openScoreModal(match)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-semibold flex items-center gap-2"
                    >
                      <FaSave /> Update Score
                    </button>

                    <button
                      onClick={() => handleEditMatch(match)}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-semibold"
                    >
                      <FaEdit />
                    </button>

                    <button
                      onClick={() => handleDeleteMatch(match._id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-semibold"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Match Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingMatch ? 'Edit Match' : 'Create New Match'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmitMatch} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Home Team</label>
                <select
                  required
                  value={formData.homeTeam}
                  onChange={(e) => setFormData({...formData, homeTeam: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                >
                  <option value="">Select home team</option>
                  {teams.map(team => (
                    <option key={team._id} value={team._id}>{team.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Away Team</label>
                <select
                  required
                  value={formData.awayTeam}
                  onChange={(e) => setFormData({...formData, awayTeam: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                >
                  <option value="">Select away team</option>
                  {teams.map(team => (
                    <option key={team._id} value={team._id}>{team.name}</option>
                  ))}
                </select>
              </div>

              {/* Week + Date side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Gameweek</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.week}
                    onChange={(e) => setFormData({...formData, week: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Time</label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Venue (Optional)</label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({...formData, venue: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  placeholder="Stadium name"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-500 py-3 rounded-xl font-semibold mt-4"
              >
                {editingMatch ? 'Update Match' : 'Create Match'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Update Score Modal */}
      {showScoreModal && selectedMatchForScore && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Update Score</h2>
              <button onClick={() => setShowScoreModal(false)} className="text-gray-400 hover:text-white">
                <FaTimes />
              </button>
            </div>

            <div className="mb-4 text-center">
              <p className="text-sm text-gray-400">
                {selectedMatchForScore.homeTeam?.name} vs {selectedMatchForScore.awayTeam?.name}
              </p>
            </div>

            <form onSubmit={handleUpdateScore} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Home Score</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={scoreData.homeScore}
                    onChange={(e) => setScoreData({...scoreData, homeScore: parseInt(e.target.value)})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-center text-2xl"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Away Score</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={scoreData.awayScore}
                    onChange={(e) => setScoreData({...scoreData, awayScore: parseInt(e.target.value)})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-center text-2xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Minute (for live matches)</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={scoreData.minute}
                  onChange={(e) => setScoreData({...scoreData, minute: parseInt(e.target.value)})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-500 py-3 rounded-xl font-semibold mt-4"
              >
                Update Score
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}