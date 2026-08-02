export const PERMISOS_POR_ROL = {
  administrador: [
    'dashboard',
    'clientes',
    'mascotas',
    'turnos',
    'consultas',
    'vacunaciones',
    'cirugias',
    'higiene',
    'productos',
    'stock',
    'consumo_insumos',
    'proveedores',
    'compras',
    'ventas',
    'pagos',
    'caja',
    'reportes',
    'usuarios',
    'configuracion',
    'servicios',
  ],

  recepcionista: [
    'dashboard',
    'clientes',
    'mascotas',
    'turnos',
    'higiene',
    'ventas',
    'pagos',
    'caja',
    'servicios',
  ],

  veterinario: [
    'dashboard',
    'clientes',
    'mascotas',
    'turnos',
    'consultas',
    'vacunaciones',
    'cirugias',
    'consumo_insumos',
    'reportes',
    'servicios',
  ],

  ventas: [
    'dashboard',
    'clientes',
    'productos',
    'stock',
    'proveedores',
    'compras',
    'ventas',
    'pagos',
    'caja',
    'reportes',
    'servicios',
  ],

  higiene: [
    'dashboard',
    'mascotas',
    'turnos',
    'higiene',
    'consumo_insumos',
    'servicios',
  ],
}

export const obtenerUsuarioGuardado = () => {
  const usuarioGuardado =
    localStorage.getItem('usuario')

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

  if (!usuario?.rol || !modulo) {
    return false
  }

  const rolNormalizado = String(usuario.rol)
    .trim()
    .toLowerCase()

  const moduloNormalizado = String(modulo)
    .trim()
    .toLowerCase()

  const permisosDelRol =
    PERMISOS_POR_ROL[rolNormalizado] || []

  return permisosDelRol.includes(
    moduloNormalizado
  )
}