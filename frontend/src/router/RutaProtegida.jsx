import { Navigate, Outlet } from 'react-router-dom'

function RutaProtegida() {
  const token = localStorage.getItem('token')

  if (!token) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default RutaProtegida