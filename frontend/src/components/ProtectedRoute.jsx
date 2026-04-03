import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children }) {
    const { status, isLoading } = useSelector((state) => state.auth)
    if (isLoading) return null
    if (!status) return <Navigate to="/login" replace />
    return children
}

export default ProtectedRoute