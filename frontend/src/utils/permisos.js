export const PERMISOS_POR_ROL = {
  administrador: [
    'dashboard',
    'clientes',
    'mascotas',
    'turnos',
    'consultas',
    'vacunaciones',
    'higiene',
    'productos',
    'stock',
    'ventas',
    'caja',
    'reportes',
    'usuarios',
    'configuracion',
    'cirugias',
  ],

  recepcionista: [
    'dashboard',
    'clientes',
    'mascotas',
    'turnos',
    'consultas',
    'vacunaciones',
    'cirugias',
  ],

  veterinario: [
    'dashboard',
    'clientes',
    'mascotas',
    'turnos',
    'consultas',
    'vacunaciones',
    'cirugias',
  ],

  ventas: [
    'dashboard',
    'clientes',
    'productos',
    'stock',
    'ventas',
    'caja',
  ],

  higiene: [
    'dashboard',
    'clientes',
    'mascotas',
    'turnos',
    'higiene',
  ],
}

export const obtenerUsuarioGuardado = () => {
  const usuarioGuardado = localStorage.getItem('usuario')

  if (!usuarioGuardado) {
    return null
  }

  try {
    return JSON.parse(usuarioGuardado)
  } catch {
    return null
  }
}

export const tienePermiso = (modulo) => {
  const usuario = obtenerUsuarioGuardado()

  if (!usuario?.rol) {
    return false
  }

  const rolNormalizado = usuario.rol.trim().toLowerCase()
  const moduloNormalizado = modulo.trim().toLowerCase()

  const permisosDelRol = PERMISOS_POR_ROL[rolNormalizado] || []

  return permisosDelRol.includes(moduloNormalizado)
}