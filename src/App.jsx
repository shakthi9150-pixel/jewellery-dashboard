import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Settings from './pages/Settings'
import PawnLedger from './pages/PawnLedger'
import Invoices from './pages/Invoices'
import InvoiceView from './pages/InvoiceView'
import Books from './pages/Books'
import PlaceholderPage from './pages/PlaceholderPage'

function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-charcoal/50">Loading...</div>
  if (!session) return <Navigate to="/login" replace />
  return <Layout>{children}</Layout>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/pawn-ledger" element={<ProtectedRoute><PawnLedger /></ProtectedRoute>} />
      <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
      <Route path="/invoices/:id" element={<ProtectedRoute><InvoiceView /></ProtectedRoute>} />
      <Route path="/books" element={<ProtectedRoute><Books /></ProtectedRoute>} />
      <Route path="/bank-loans" element={
        <ProtectedRoute><PlaceholderPage title="Bank Loans" tamil="வங்கி கடன்" phase="Phase 4" /></ProtectedRoute>
      } />
      <Route path="/rates" element={
        <ProtectedRoute><PlaceholderPage title="Rate Sharing" tamil="விலை பகிர்வு" phase="Phase 5" /></ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
