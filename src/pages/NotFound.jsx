import { useNavigate } from 'react-router-dom'

function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center">
      <div className="text-8xl mb-6">🏟️</div>
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-gray-400 mb-8">This page doesn't exist</p>
      <button
        onClick={() => navigate('/')}
        className="bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-8 py-3 rounded-xl transition"
      >
        Back to Dashboard
      </button>
    </div>
  )
}

export default NotFound