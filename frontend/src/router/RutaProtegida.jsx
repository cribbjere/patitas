import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { tienePermiso } from '../utils/permisos'

function RutaProtegida() {
  const token = localStorage.getItem('token')
  const location = useLocation()

  if (!token) {
    return <Navigate to="/" replace />
  }

  const ruta = location.pathname.split('/')[1]

  const equivalencias = {
    dashboard: 'dashboard',
    clientes: 'clientes',
    mascotas: 'mascotas',
    turnos: 'turnos',
    consultas: 'consultas',
    vacunaciones: 'vacunaciones',
    higiene: 'higiene',
    productos: 'productos',
    stock: 'stock',
    ventas: 'ventas',
    reportes: 'reportes',
    usuarios: 'usuarios',
    configuracion: 'configuracion',
  }

  const permiso = equivalencias[ruta]

  if (permiso && !tienePermiso(permiso)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export default RutaProtegida