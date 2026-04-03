import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

function PublicRoute({ children }) {
    const { status, isLoading } = useSelector((state) => state.auth)
    if (isLoading) return null
    if (status) return <Navigate to="/channels" replace />
    return children
}

export default PublicRoute