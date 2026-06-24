import { useState } from 'react'
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
} from 'react-icons/fa6'

import { usuarios as usuariosIniciales } from '../data/mockData'
import './Usuarios.css'

const permisosPorRol = {
  Administrador: [
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
  Recepcionista: ['Dashboard', 'Clientes', 'Mascotas', 'Turnos'],
  Veterinario: ['Dashboard', 'Mascotas', 'Consultas', 'Vacunaciones'],
  Ventas: ['Dashboard', 'Productos', 'Stock', 'Ventas'],
  Higiene: ['Dashboard', 'Mascotas', 'Higiene'],
}

const usuarioVacio = {
  nombre: '',
  usuario: '',
  rol: '',
  estado: true,
}

function Usuarios() {
  const [usuarios, setUsuarios] = useState(usuariosIniciales)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [formulario, setFormulario] = useState(usuarioVacio)

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const texto = `
      ${usuario.nombre}
      ${usuario.usuario}
      ${usuario.rol}
      ${usuario.estado ? 'activo' : 'inactivo'}
    `.toLowerCase()

    return texto.includes(busqueda.toLowerCase())
  })

  const abrirNuevoUsuario = () => {
    setFormulario(usuarioVacio)
    setUsuarioSeleccionado(null)
    setModoEdicion(false)
    setMostrarFormulario(true)
  }

  const abrirVerUsuario = (usuario) => {
    setUsuarioSeleccionado(usuario)
    setMostrarFormulario(false)
    setModoEdicion(false)
  }

  const abrirEditarUsuario = (usuario) => {
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
    setFormulario(usuarioVacio)
    setUsuarioSeleccionado(null)
    setMostrarFormulario(false)
    setModoEdicion(false)
  }

  const manejarCambio = (e) => {
    const { name, value, type, checked } = e.target

    setFormulario({
      ...formulario,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const guardarUsuario = (e) => {
    e.preventDefault()

    if (!formulario.nombre || !formulario.usuario || !formulario.rol) {
      alert('Completá nombre, usuario y rol.')
      return
    }

    const usuarioRepetido = usuarios.some((usuario) => {
      if (modoEdicion && usuario.id === usuarioSeleccionado.id) {
        return false
      }

      return usuario.usuario.toLowerCase() === formulario.usuario.toLowerCase()
    })

    if (usuarioRepetido) {
      alert('Ya existe un usuario con ese nombre de usuario.')
      return
    }

    if (modoEdicion) {
      const usuariosActualizados = usuarios.map((usuario) => {
        if (usuario.id === usuarioSeleccionado.id) {
          return {
            id: usuarioSeleccionado.id,
            nombre: formulario.nombre,
            usuario: formulario.usuario,
            rol: formulario.rol,
            estado: formulario.estado,
          }
        }

        return usuario
      })

      setUsuarios(usuariosActualizados)
    } else {
      const nuevoUsuario = {
        id: Date.now(),
        nombre: formulario.nombre,
        usuario: formulario.usuario,
        rol: formulario.rol,
        estado: formulario.estado,
      }

      setUsuarios([...usuarios, nuevoUsuario])

      alert(
        'Usuario creado correctamente. Contraseña predeterminada: Patitas123'
      )
    }

    cerrarPanel()
  }

  const eliminarUsuario = (id) => {
    const usuario = usuarios.find((item) => item.id === id)

    if (usuario?.rol === 'Administrador') {
      alert('No se puede eliminar el usuario administrador principal.')
      return
    }

    const confirmar = window.confirm('¿Seguro que querés eliminar este usuario?')

    if (!confirmar) return

    const usuariosActualizados = usuarios.filter((usuario) => usuario.id !== id)

    setUsuarios(usuariosActualizados)

    if (usuarioSeleccionado?.id === id) {
      cerrarPanel()
    }
  }

  return (
    <section className="usuarios-page">
      <div className="usuarios-header">
        <div>
          <h1>Usuarios</h1>
          <p>Administración de usuarios, roles y permisos</p>
        </div>

        <button className="btn-nuevo-usuario" onClick={abrirNuevoUsuario}>
          <FaPlus />
          Nuevo Usuario
        </button>
      </div>

      <div className="usuarios-content">
        <div className="usuarios-main-card">
          <div className="usuarios-toolbar">
            <div className="usuarios-search">
              <FaMagnifyingGlass />

              <input
                type="text"
                placeholder="Buscar por nombre, usuario, rol o estado"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <span className="usuarios-total">
              {usuariosFiltrados.length} usuarios
            </span>
          </div>

          <div className="usuarios-table-wrapper">
            <table className="usuarios-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Nombre de usuario</th>
                  <th>Rol</th>
                  <th>Permisos</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id}>
                    <td>
                      <div className="usuario-nombre">
                        <div className="usuario-icono">
                          <FaUserGear />
                        </div>

                        <div>
                          <strong>{usuario.nombre}</strong>
                          <small>ID usuario: {usuario.id}</small>
                        </div>
                      </div>
                    </td>

                    <td>{usuario.usuario}</td>

                    <td>{usuario.rol}</td>

                    <td>
                      {permisosPorRol[usuario.rol]?.length || 0} módulos
                    </td>

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
                          className="btn-accion ver"
                          onClick={() => abrirVerUsuario(usuario)}
                          title="Ver usuario"
                        >
                          <FaEye />
                        </button>

                        <button
                          className="btn-accion editar"
                          onClick={() => abrirEditarUsuario(usuario)}
                          title="Editar usuario"
                        >
                          <FaPen />
                        </button>

                        <button
                          className="btn-accion eliminar"
                          onClick={() => eliminarUsuario(usuario.id)}
                          title="Eliminar usuario"
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
            <button className="btn-cerrar" onClick={cerrarPanel}>
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

                <form className="usuario-form" onSubmit={guardarUsuario}>
                  <label>Nombre completo</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formulario.nombre}
                    onChange={manejarCambio}
                  />

                  <label>Nombre de usuario</label>
                  <input
                    type="text"
                    name="usuario"
                    value={formulario.usuario}
                    onChange={manejarCambio}
                  />

                  <label>Rol</label>
                  <select
                    name="rol"
                    value={formulario.rol}
                    onChange={manejarCambio}
                  >
                    <option value="">Seleccionar rol</option>
                    <option value="Administrador">Administrador</option>
                    <option value="Recepcionista">Recepcionista</option>
                    <option value="Veterinario">Veterinario</option>
                    <option value="Ventas">Ventas</option>
                    <option value="Higiene">Higiene</option>
                  </select>

                  {!modoEdicion && (
                    <div className="password-info">
                      <FaKey />
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

                      {permisosPorRol[formulario.rol].map((permiso) => (
                        <span key={permiso}>{permiso}</span>
                      ))}
                    </div>
                  )}

                  <button type="submit" className="btn-guardar">
                    <FaFloppyDisk />
                    Guardar Usuario
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

                  {permisosPorRol[usuarioSeleccionado.rol].map((permiso) => (
                    <span key={permiso}>{permiso}</span>
                  ))}
                </div>

                <button
                  className="btn-editar-detalle"
                  onClick={() => abrirEditarUsuario(usuarioSeleccionado)}
                >
                  <FaPen />
                  Editar Usuario
                </button>
              </>
            )}
          </aside>
        )}
      </div>
    </section>
  )
}

export default Usuarios