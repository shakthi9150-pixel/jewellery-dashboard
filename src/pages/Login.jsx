import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) setError(error.message)
  }

  return (
    <div className="min-h-screen bg-maroon flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-cream rounded-lg shadow-2xl p-8 border-t-4 border-gold">
        <h1 className="font-display text-2xl text-maroon-dark text-center mb-1">
          Senthil Aandavar Jewellery+
        </h1>
        <p className="text-center text-sm text-charcoal/60 mb-6 font-tamil">
          உள்நுழைவு · Login
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded border border-charcoal/20 focus:outline-none focus:ring-2 focus:ring-gold bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded border border-charcoal/20 focus:outline-none focus:ring-2 focus:ring-gold bg-white"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-maroon hover:bg-maroon-light text-cream font-medium py-2 rounded transition-colors disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
