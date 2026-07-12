import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/', label: 'Dashboard', tamil: 'முகப்பு', icon: '⌂' },
  { to: '/customers', label: 'Customers', tamil: 'வாடிக்கையாளர்', icon: '☺' },
  { to: '/pawn-ledger', label: 'Pawn Ledger', tamil: 'அடகு பதிவு', icon: '◈' },
  { to: '/invoices', label: 'GST Invoices', tamil: 'விலைப்பட்டியல்', icon: '▤' },
  { to: '/books', label: 'Books', tamil: 'கணக்குப் புத்தகம்', icon: '📖' },
  { to: '/bank-loans', label: 'Bank Loans', tamil: 'வங்கி கடன்', icon: '⛁' },
  { to: '/rates', label: 'Rate Sharing', tamil: 'விலை பகிர்வு', icon: '◉' },
  { to: '/settings', label: 'Settings', tamil: 'அமைப்புகள்', icon: '⚙' },
]

export default function Sidebar() {
  const { signOut } = useAuth()

  return (
    <aside className="w-64 bg-maroon-dark text-cream min-h-screen flex flex-col">
      <div className="px-5 py-6 border-b border-gold/20">
        <h1 className="font-display text-lg leading-tight">Senthil Aandavar</h1>
        <p className="font-display text-sm text-gold">Jewellery+</p>
      </div>
      <nav className="flex-1 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                isActive
                  ? 'bg-gold/15 text-gold border-r-2 border-gold'
                  : 'text-cream/80 hover:bg-white/5'
              }`
            }
          >
            <span className="text-base w-5 text-center">{item.icon}</span>
            <span className="flex-1">
              {item.label}
              <span className="block text-[10px] text-cream/40 font-tamil">{item.tamil}</span>
            </span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gold/20">
        <button
          onClick={signOut}
          className="w-full text-sm text-cream/70 hover:text-gold transition-colors text-left px-1"
        >
          Sign Out · வெளியேறு
        </button>
      </div>
    </aside>
  )
}
