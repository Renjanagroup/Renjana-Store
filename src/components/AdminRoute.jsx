import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()

  if (loading) return <div className="page-loading">Memuat…</div>
  if (!user) return <Navigate to="/masuk" replace />
  if (!isAdmin) return <Navigate to="/koleksi" replace />

  return children
}
