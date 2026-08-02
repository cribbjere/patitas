import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom'

import {
  obtenerUsuarioGuardado,
  tienePermiso,
} from '../utils/permisos'


function RutaProtegida() {
  const token = localStorage.getItem('token')
  const location = useLocation()

  if (!token) {
    return <Navigate to="/" replace />
  }

  const usuario = obtenerUsuarioGuardado()

  if (!usuario) {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')

    return <Navigate to="/" replace />
  }

  const esRutaCambioPassword =
    location.pathname === '/cambiar-contrasena'

  /*
   * Si la contraseña es temporal, el usuario solamente
   * puede acceder a la pantalla para cambiarla.
   */
  if (
    usuario.debe_cambiar_password
    && !esRutaCambioPassword
  ) {
    return (
      <Navigate
        to="/cambiar-contrasena"
        replace
      />
    )
  }

  const ruta =
    location.pathname.split('/').filter(Boolean)[0] || ''

  const equivalencias = {
    dashboard: 'dashboard',
    clientes: 'clientes',
    mascotas: 'mascotas',
    turnos: 'turnos',
    consultas: 'consultas',
    vacunaciones: 'vacunaciones',
    cirugias: 'cirugias',
    higiene: 'higiene',
    productos: 'productos',
    stock: 'stock',
    ventas: 'ventas',
    caja: 'caja',
    reportes: 'reportes',
    usuarios: 'usuarios',
    configuracion: 'configuracion',
  }

  const permiso = equivalencias[ruta]

  if (
    permiso
    && !tienePermiso(permiso)
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    )
  }

  return <Outlet />
}

export default RutaProtegida