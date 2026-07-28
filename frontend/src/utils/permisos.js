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
    'reportes',
    'usuarios',
    'configuracion',
  ],

  recepcionista: [
    'dashboard',
    'clientes',
    'mascotas',
    'turnos',
    'consultas',
    'vacunaciones',
  ],

  veterinario: [
    'dashboard',
    'clientes',
    'mascotas',
    'turnos',
    'consultas',
    'vacunaciones',
  ],

  ventas: [
    'dashboard',
    'clientes',
    'productos',
    'stock',
    'ventas',
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