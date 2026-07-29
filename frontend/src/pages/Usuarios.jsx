import { useEffect, useMemo, useState } from 'react'
import {
  FaMagnifyingGlass,
  FaPlus,
  FaEye,
  FaPen,
  FaTrash,
  FaFloppyDisk,
  FaXmark,
  FaUserGear,
  FaKey,
  FaTriangleExclamation,
  FaCircleCheck,
} from 'react-icons/fa6'

import {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario as eliminarUsuarioApi,
} from '../services/usuariosService'
import './Usuarios.css'

const permisosPorRol = {
  administrador: [
    'Dashboard',
    'Clientes',
    'Mascotas',
    'Turnos',
    'Consultas',
    'Vacunaciones',
    'Higiene',
    'Productos',
    'Stock',
    'Ventas',
    'Reportes',
    'Usuarios',
    'Configuración',
  ],
  recepcionista: [
    'Dashboard',
    'Clientes',
    'Mascotas',
    'Turnos',
  ],
  veterinario: [
    'Dashboard',
    'Mascotas',
    'Consultas',
    'Vacunaciones',
  ],
  ventas: [
    'Dashboard',
    'Productos',
    'Stock',
    'Ventas',
  ],
  higiene: [
    'Dashboard',
    'Mascotas',
    'Higiene',
  ],
}

const usuarioVacio = {
  nombre: '',
  usuario: '',
  rol: '',
  estado: true,
}

function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [formulario, setFormulario] = useState(usuarioVacio)
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState(null)
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null)
  useEffect(() => {
  cargarUsuarios()
}, [])

const cargarUsuarios = async () => {
  try {
    setCargando(true)

    const datos = await obtenerUsuarios()

    const usuariosFormateados = datos.map((u) => ({
      id: u.id,
      nombre: `${u.first_name} ${u.last_name}`.trim(),
      usuario: u.username,
      email: u.email,
      rol: u.rol,
      estado: u.estado === 'activo',
    }))

    setUsuarios(usuariosFormateados)
  } catch (error) {
    console.error(error)
    mostrarMensaje('No se pudieron cargar los usuarios.')
  } finally {
    setCargando(false)
  }
}

  const usuariosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()

    return usuarios.filter((usuario) => {
      const texto = `
        ${usuario.nombre}
        ${usuario.usuario}
        ${usuario.rol}
        ${usuario.estado ? 'activo' : 'inactivo'}
      `.toLowerCase()

      return texto.includes(termino)
    })
  }, [usuarios, busqueda])

  const mostrarMensaje = (texto, tipo = 'error') => {
    setMensaje({ texto, tipo })
  }

  const limpiarEstados = () => {
    setErrores({})
    setMensaje(null)
  }

  const abrirNuevoUsuario = () => {
    limpiarEstados()
    setFormulario(usuarioVacio)
    setUsuarioSeleccionado(null)
    setModoEdicion(false)
    setMostrarFormulario(true)
  }

  const abrirVerUsuario = (usuario) => {
    limpiarEstados()
    setUsuarioSeleccionado(usuario)
    setMostrarFormulario(false)
    setModoEdicion(false)
  }

  const abrirEditarUsuario = (usuario) => {
    limpiarEstados()
    setFormulario({
      nombre: usuario.nombre,
      usuario: usuario.usuario,
      rol: usuario.rol,
      estado: usuario.estado,
    })

    setUsuarioSeleccionado(usuario)
    setModoEdicion(true)
    setMostrarFormulario(true)
  }

  const cerrarPanel = () => {
    limpiarEstados()
    setFormulario(usuarioVacio)
    setUsuarioSeleccionado(null)
    setMostrarFormulario(false)
    setModoEdicion(false)
  }

  const manejarCambio = (e) => {
    const { name, value, type, checked } = e.target
    const nuevoValor = type === 'checkbox' ? checked : value

    setFormulario((actual) => ({
      ...actual,
      [name]: nuevoValor,
    }))

    if (errores[name]) {
      setErrores((actuales) => ({
        ...actuales,
        [name]: '',
      }))
    }

    setMensaje(null)
  }

  const validarFormulario = () => {
    const nuevosErrores = {}
    const nombre = formulario.nombre.trim()
    const nombreUsuario = formulario.usuario.trim()

    if (!nombre) {
      nuevosErrores.nombre = 'Ingresá el nombre completo.'
    } else if (nombre.length < 3) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 3 caracteres.'
    }

    if (!nombreUsuario) {
      nuevosErrores.usuario = 'Ingresá un nombre de usuario.'
    } else if (nombreUsuario.length < 4) {
      nuevosErrores.usuario = 'Debe tener al menos 4 caracteres.'
    } else if (!/^[a-zA-Z0-9._-]+$/.test(nombreUsuario)) {
      nuevosErrores.usuario =
        'Usá solo letras, números, punto, guion o guion bajo.'
    }

    if (!formulario.rol) {
      nuevosErrores.rol = 'Seleccioná un rol.'
    }

    const usuarioRepetido = usuarios.some((usuario) => {
      if (modoEdicion && usuario.id === usuarioSeleccionado?.id) {
        return false
      }

      return usuario.usuario.toLowerCase() === nombreUsuario.toLowerCase()
    })

    if (usuarioRepetido) {
      nuevosErrores.usuario = 'Ya existe un usuario con ese nombre.'
    }

    setErrores(nuevosErrores)

    return Object.keys(nuevosErrores).length === 0
  }

  const guardarUsuario = async (e) => {
  e.preventDefault()

  if (!validarFormulario()) return

  const nombreCompleto = formulario.nombre.trim().split(' ')

  const datosUsuario = {
    username: formulario.usuario.trim(),
    first_name: nombreCompleto[0] || '',
    last_name: nombreCompleto.slice(1).join(' '),
    password: 'Patitas123',
    rol: formulario.rol.trim().toLowerCase(),
    estado: formulario.estado ? 'activo' : 'inactivo',
  }

  try {
    if (modoEdicion) {
      await actualizarUsuario(usuarioSeleccionado.id, datosUsuario)

      mostrarMensaje('Usuario actualizado correctamente.', 'exito')
    } else {
      await crearUsuario(datosUsuario)

      mostrarMensaje(
        'Usuario creado correctamente. Contraseña predeterminada: Patitas123',
        'exito'
      )
    }

    await cargarUsuarios()
    cerrarPanel()
  } catch (error) {
  console.error('Error al guardar usuario:', error.response?.data)

  mostrarMensaje(
    error.response?.data
      ? JSON.stringify(error.response.data)
      : 'Ocurrió un error al guardar el usuario.'
  )
}
}
  const solicitarEliminarUsuario = (usuario) => {
    if (usuario.rol === 'Administrador') {
      mostrarMensaje('No se puede eliminar el usuario administrador principal.')
      return
    }

    setUsuarioAEliminar(usuario)
  }

const eliminarUsuario = async () => {
  if (!usuarioAEliminar) return

  try {
    await eliminarUsuarioApi(usuarioAEliminar.id)

    if (usuarioSeleccionado?.id === usuarioAEliminar.id) {
      cerrarPanel()
    }

    setUsuarioAEliminar(null)

    await cargarUsuarios()

    mostrarMensaje('Usuario eliminado correctamente.', 'exito')
  } catch (error) {
    console.error(
      'Error al eliminar usuario:',
      error.response?.data || error
    )

    mostrarMensaje(
      error.response?.data?.detail ||
        'No se pudo eliminar el usuario.'
    )
  }
}

  const permisosFormulario =
  permisosPorRol[formulario.rol?.toLowerCase()] || []

const permisosSeleccionado =
  permisosPorRol[usuarioSeleccionado?.rol?.toLowerCase()] || []
  return (
    <section className="usuarios-page">
      <div className="usuarios-header">
        <div>
          <h1>Usuarios</h1>
          <p>Administración de usuarios, roles y permisos</p>
        </div>

        <button
          type="button"
          className="btn-nuevo-usuario"
          onClick={abrirNuevoUsuario}
        >
          <FaPlus aria-hidden="true" />
          Nuevo Usuario
        </button>
      </div>

      {mensaje && (
        <div
          className={`mensaje-usuarios ${mensaje.tipo}`}
          role={mensaje.tipo === 'error' ? 'alert' : 'status'}
        >
          <div>
            {mensaje.tipo === 'exito' ? (
              <FaCircleCheck aria-hidden="true" />
            ) : (
              <FaTriangleExclamation aria-hidden="true" />
            )}
            <span>{mensaje.texto}</span>
          </div>

          <button
            type="button"
            onClick={() => setMensaje(null)}
            aria-label="Cerrar mensaje"
          >
            <FaXmark />
          </button>
        </div>
      )}

      <div className="usuarios-content">
        <div className="usuarios-main-card">
          <div className="usuarios-toolbar">
            <label className="usuarios-search">
              <FaMagnifyingGlass aria-hidden="true" />

              <input
                type="search"
                placeholder="Buscar por nombre, usuario, rol o estado"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                aria-label="Buscar usuarios"
              />
            </label>

            <span className="usuarios-total">
              {usuariosFiltrados.length}{' '}
              {usuariosFiltrados.length === 1 ? 'usuario' : 'usuarios'}
            </span>
          </div>

          <div className="usuarios-table-wrapper">
            <table className="usuarios-table">
              <thead>
                <tr>
                  <th scope="col">Usuario</th>
                  <th scope="col">Nombre de usuario</th>
                  <th scope="col">Rol</th>
                  <th scope="col">Permisos</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id}>
                    <td>
                      <div className="usuario-nombre">
                        <div className="usuario-icono">
                          <FaUserGear aria-hidden="true" />
                        </div>

                        <div>
                          <strong>{usuario.nombre}</strong>
                          <small>ID usuario: {usuario.id}</small>
                        </div>
                      </div>
                    </td>

                    <td>{usuario.usuario}</td>
                    <td>{usuario.rol}</td>
                    <td>{permisosPorRol[usuario.rol?.toLowerCase()]?.length || 0} módulos</td>

                    <td>
                      <span
                        className={
                          usuario.estado
                            ? 'estado-usuario activo'
                            : 'estado-usuario inactivo'
                        }
                      >
                        {usuario.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    <td>
                      <div className="acciones">
                        <button
                          type="button"
                          className="btn-accion ver"
                          onClick={() => abrirVerUsuario(usuario)}
                          title="Ver usuario"
                          aria-label={`Ver usuario ${usuario.nombre}`}
                        >
                          <FaEye />
                        </button>

                        <button
                          type="button"
                          className="btn-accion editar"
                          onClick={() => abrirEditarUsuario(usuario)}
                          title="Editar usuario"
                          aria-label={`Editar usuario ${usuario.nombre}`}
                        >
                          <FaPen />
                        </button>

                        <button
                          type="button"
                          className="btn-accion eliminar"
                          onClick={() => solicitarEliminarUsuario(usuario)}
                          title="Eliminar usuario"
                          aria-label={`Eliminar usuario ${usuario.nombre}`}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {usuariosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan="6" className="sin-resultados">
                      No se encontraron usuarios.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {(mostrarFormulario || usuarioSeleccionado) && (
          <aside className="usuarios-side-card">
            <button
              type="button"
              className="btn-cerrar"
              onClick={cerrarPanel}
              aria-label="Cerrar panel"
            >
              <FaXmark />
            </button>

            {mostrarFormulario ? (
              <>
                <h2>{modoEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>

                <p>
                  {modoEdicion
                    ? 'Modificá los datos y permisos del usuario'
                    : 'Cargá un nuevo usuario con contraseña predeterminada'}
                </p>

                <form
                  className="usuario-form"
                  onSubmit={guardarUsuario}
                  noValidate
                >
                  <label htmlFor="usuario-nombre">Nombre completo</label>
                  <input
                    id="usuario-nombre"
                    type="text"
                    name="nombre"
                    value={formulario.nombre}
                    onChange={manejarCambio}
                    className={errores.nombre ? 'campo-error' : ''}
                    aria-invalid={Boolean(errores.nombre)}
                    aria-describedby={
                      errores.nombre ? 'error-usuario-nombre' : undefined
                    }
                  />
                  {errores.nombre && (
                    <span
                      className="mensaje-campo"
                      id="error-usuario-nombre"
                    >
                      {errores.nombre}
                    </span>
                  )}

                  <label htmlFor="usuario-username">Nombre de usuario</label>
                  <input
                    id="usuario-username"
                    type="text"
                    name="usuario"
                    value={formulario.usuario}
                    onChange={manejarCambio}
                    className={errores.usuario ? 'campo-error' : ''}
                    aria-invalid={Boolean(errores.usuario)}
                    aria-describedby={
                      errores.usuario ? 'error-usuario-username' : undefined
                    }
                  />
                  {errores.usuario && (
                    <span
                      className="mensaje-campo"
                      id="error-usuario-username"
                    >
                      {errores.usuario}
                    </span>
                  )}

                  <label htmlFor="usuario-rol">Rol</label>
                  <select
                    id="usuario-rol"
                    name="rol"
                    value={formulario.rol}
                    onChange={manejarCambio}
                    className={errores.rol ? 'campo-error' : ''}
                    aria-invalid={Boolean(errores.rol)}
                    aria-describedby={
                      errores.rol ? 'error-usuario-rol' : undefined
                    }
                  >
                    <option value="">Seleccionar rol</option>
                    <option value="Administrador">Administrador</option>
                    <option value="Recepcionista">Recepcionista</option>
                    <option value="Veterinario">Veterinario</option>
                    <option value="Ventas">Ventas</option>
                    <option value="Higiene">Higiene</option>
                  </select>
                  {errores.rol && (
                    <span className="mensaje-campo" id="error-usuario-rol">
                      {errores.rol}
                    </span>
                  )}

                  {!modoEdicion && (
                    <div className="password-info">
                      <FaKey aria-hidden="true" />
                      <div>
                        <strong>Contraseña predeterminada</strong>
                        <span>Patitas123</span>
                      </div>
                    </div>
                  )}

                  <label className="checkbox-usuario">
                    <input
                      type="checkbox"
                      name="estado"
                      checked={formulario.estado}
                      onChange={manejarCambio}
                    />
                    Usuario activo
                  </label>

                  {formulario.rol && (
                    <div className="permisos-preview">
                      <h3>Permisos del rol</h3>

                      {permisosFormulario.map((permiso) => (
                        <span key={permiso}>{permiso}</span>
                      ))}
                    </div>
                  )}

                  <button type="submit" className="btn-guardar">
                    <FaFloppyDisk aria-hidden="true" />
                    {modoEdicion ? 'Guardar Cambios' : 'Guardar Usuario'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2>Detalle del Usuario</h2>
                <p>Información del usuario y sus permisos</p>

                <div className="usuario-detalle">
                  <div>
                    <span>Nombre completo</span>
                    <strong>{usuarioSeleccionado.nombre}</strong>
                  </div>

                  <div>
                    <span>Nombre de usuario</span>
                    <strong>{usuarioSeleccionado.usuario}</strong>
                  </div>

                  <div>
                    <span>Rol</span>
                    <strong>{usuarioSeleccionado.rol}</strong>
                  </div>

                  <div>
                    <span>Estado</span>
                    <strong>
                      {usuarioSeleccionado.estado ? 'Activo' : 'Inactivo'}
                    </strong>
                  </div>
                </div>

                <div className="permisos-preview">
                  <h3>Módulos permitidos</h3>

                  {permisosSeleccionado.map((permiso) => (
                    <span key={permiso}>{permiso}</span>
                  ))}
                </div>

                <button
                  type="button"
                  className="btn-editar-detalle"
                  onClick={() => abrirEditarUsuario(usuarioSeleccionado)}
                >
                  <FaPen aria-hidden="true" />
                  Editar Usuario
                </button>
              </>
            )}
          </aside>
        )}
      </div>

      {usuarioAEliminar && (
        <div className="usuarios-modal-overlay" role="presentation">
          <div
            className="usuarios-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-eliminar-usuario"
          >
            <div className="usuarios-modal-icono">
              <FaTriangleExclamation />
            </div>

            <h3 id="titulo-eliminar-usuario">Eliminar usuario</h3>
            <p>
              ¿Seguro que querés eliminar a{' '}
              <strong>{usuarioAEliminar.nombre}</strong>? Esta acción no se
              puede deshacer.
            </p>

            <div className="usuarios-modal-acciones">
              <button
                type="button"
                className="btn-modal-cancelar"
                onClick={() => setUsuarioAEliminar(null)}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="btn-modal-eliminar"
                onClick={eliminarUsuario}
              >
                <FaTrash />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Usuarios