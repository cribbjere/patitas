import { useEffect, useMemo, useState } from 'react'
import {
  FaMagnifyingGlass,
  FaPlus,
  FaEye,
  FaPen,
  FaTrash,
  FaFloppyDisk,
  FaXmark,
} from 'react-icons/fa6'

import {
  obtenerClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente as eliminarClienteApi,
} from '../services/clientesService'

import { soloLetras, soloNumeros } from '../utils/validaciones'
import { obtenerUsuarioGuardado } from '../utils/permisos'
import './Clientes.css'

const clienteVacio = {
  nombre: '',
  apellido: '',
  telefono: '',
  email: '',
  direccion: '',
  estado: true,
}

function Clientes() {
  const usuario = obtenerUsuarioGuardado()

  const rol = String(usuario?.rol || '')
    .trim()
    .toLowerCase()

  const puedeGestionarClientes = [
    'administrador',
    'recepcionista',
  ].includes(rol)

  const [clientes, setClientes] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [formulario, setFormulario] = useState(clienteVacio)
  const [errorFormulario, setErrorFormulario] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [errorCarga, setErrorCarga] = useState('')

  useEffect(() => {
    const cargarClientes = async () => {
      try {
        setCargando(true)
        setErrorCarga('')

        const datos = await obtenerClientes()

        const clientesAdaptados = datos.map((cliente) => ({
          ...cliente,
          estado: cliente.estado === 'activo',
        }))

        setClientes(clientesAdaptados)
      } catch (error) {
        console.error('Error al cargar clientes:', error)
        setErrorCarga(
          'No se pudieron cargar los clientes. Verificá que el backend esté funcionando.'
        )
      } finally {
        setCargando(false)
      }
    }

    cargarClientes()
  }, [])

  const clientesFiltrados = useMemo(() => {
    const textoBusqueda = busqueda.trim().toLowerCase()

    if (!textoBusqueda) {
      return clientes
    }

    return clientes.filter((cliente) => {
      const textoCliente = [
        cliente.nombre,
        cliente.apellido,
        cliente.telefono,
        cliente.email,
        cliente.direccion,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return textoCliente.includes(textoBusqueda)
    })
  }, [clientes, busqueda])

  const abrirNuevoCliente = () => {
    if (!puedeGestionarClientes) {
      return
    }
    setFormulario({ ...clienteVacio })
    setModoEdicion(false)
    setClienteSeleccionado(null)
    setErrorFormulario('')
    setMostrarFormulario(true)
  }

  const abrirVerCliente = (cliente) => {
    setClienteSeleccionado(cliente)
    setMostrarFormulario(false)
    setModoEdicion(false)
    setErrorFormulario('')
  }

  const abrirEditarCliente = (cliente) => {
    if (!puedeGestionarClientes) {
      return
    }
    setFormulario({ ...cliente })
    setClienteSeleccionado(cliente)
    setModoEdicion(true)
    setMostrarFormulario(true)
    setErrorFormulario('')
  }

  const cerrarPanel = () => {
    setFormulario({ ...clienteVacio })
    setClienteSeleccionado(null)
    setMostrarFormulario(false)
    setModoEdicion(false)
    setErrorFormulario('')
  }

  const manejarCambio = (evento) => {
    const { name, value, type, checked } = evento.target

    let nuevoValor = type === 'checkbox' ? checked : value

    if (name === 'nombre' || name === 'apellido') {
      nuevoValor = soloLetras(value)
    }

    if (name === 'telefono') {
      nuevoValor = soloNumeros(value)
    }

    setFormulario((formularioAnterior) => ({
      ...formularioAnterior,
      [name]: nuevoValor,
    }))

    if (errorFormulario) {
      setErrorFormulario('')
    }
  }

  const validarFormulario = () => {
    const nombre = formulario.nombre.trim()
    const apellido = formulario.apellido.trim()
    const telefono = formulario.telefono.trim()
    const email = formulario.email.trim()
    const direccion = formulario.direccion.trim()

    if (!nombre || !apellido || !telefono) {
      return 'Completá el nombre, el apellido y el teléfono.'
    }

    if (!email) {
      return 'El email es obligatorio.'
    }

    if (!direccion) {
      return 'La dirección es obligatoria.'
    }

    if (nombre.length < 2 || apellido.length < 2) {
      return 'El nombre y el apellido deben tener al menos 2 letras.'
    }

    if (telefono.length < 7) {
      return 'Ingresá un número de teléfono válido.'
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Ingresá un correo electrónico válido.'
    }

    return ''
  }

  const obtenerMensajeError = (error) => {
    const datos = error.response?.data

    if (!datos) {
      return 'No se pudo conectar con el servidor.'
    }

    if (datos.email) {
      return `Email: ${datos.email.join(' ')}`
    }

    if (datos.telefono) {
      return `Teléfono: ${datos.telefono.join(' ')}`
    }

    if (datos.nombre) {
      return `Nombre: ${datos.nombre.join(' ')}`
    }

    if (datos.apellido) {
      return `Apellido: ${datos.apellido.join(' ')}`
    }

    if (datos.direccion) {
      return `Dirección: ${datos.direccion.join(' ')}`
    }

    if (datos.estado) {
      return `Estado: ${datos.estado.join(' ')}`
    }

    if (datos.detail) {
      return datos.detail
    }

    return 'No se pudo guardar el cliente.'
  }

  const guardarCliente = async (evento) => {
    evento.preventDefault()

    const error = validarFormulario()

    if (error) {
      setErrorFormulario(error)
      return
    }
    if (!puedeGestionarClientes) {
      setErrorFormulario(
        'Tu rol solamente puede consultar clientes.',
      )
      return
    }
    const datosCliente = {
      nombre: formulario.nombre.trim(),
      apellido: formulario.apellido.trim(),
      telefono: formulario.telefono.trim(),
      email: formulario.email.trim(),
      direccion: formulario.direccion.trim(),
      estado: formulario.estado ? 'activo' : 'inactivo',
    }

    try {
      setGuardando(true)
      setErrorFormulario('')

      if (modoEdicion && clienteSeleccionado) {
        const clienteActualizado = await actualizarCliente(
          clienteSeleccionado.id,
          datosCliente
        )

        const clienteAdaptado = {
          ...clienteActualizado,
          estado: clienteActualizado.estado === 'activo',
        }

        setClientes((clientesAnteriores) =>
          clientesAnteriores.map((cliente) =>
            cliente.id === clienteSeleccionado.id
              ? clienteAdaptado
              : cliente
          )
        )
      } else {
        const nuevoCliente = await crearCliente(datosCliente)

        const clienteAdaptado = {
          ...nuevoCliente,
          estado: nuevoCliente.estado === 'activo',
        }

        setClientes((clientesAnteriores) => [
          ...clientesAnteriores,
          clienteAdaptado,
        ])
      }

      cerrarPanel()
    } catch (errorGuardar) {
      console.error('Error al guardar cliente:', errorGuardar)
      setErrorFormulario(obtenerMensajeError(errorGuardar))
    } finally {
      setGuardando(false)
    }
  }

  const eliminarCliente = async (cliente) => {
    if (!puedeGestionarClientes) {
      return
    }
    const confirmar = window.confirm(
      `¿Seguro que querés eliminar a ${cliente.nombre} ${cliente.apellido}?`
    )

    if (!confirmar) {
      return
    }

    try {
      await eliminarClienteApi(cliente.id)

      setClientes((clientesAnteriores) =>
        clientesAnteriores.filter((item) => item.id !== cliente.id)
      )

      if (clienteSeleccionado?.id === cliente.id) {
        cerrarPanel()
      }
    } catch (error) {
      console.error('Error al eliminar cliente:', error)

      window.alert(
        'No se pudo eliminar el cliente. Puede estar relacionado con mascotas, turnos u otros registros.'
      )
    }
  }

  return (
    <section className="clientes-page">
      <header className="clientes-header">
        <div>
          <h1>Clientes</h1>
          <p>Gestión de dueños registrados en la veterinaria</p>
        </div>

        {puedeGestionarClientes && (
  <button
    type="button"
    className="btn-nuevo-cliente"
    onClick={abrirNuevoCliente}
  >
    <FaPlus />
    Nuevo Cliente
  </button>
)}
      </header>

      {errorCarga && (
        <div className="cliente-form-error" role="alert">
          {errorCarga}
        </div>
      )}

      <div
        className={`clientes-content ${
          mostrarFormulario || clienteSeleccionado
            ? 'con-panel'
            : 'sin-panel'
        }`}
      >
        <div className="clientes-main-card">
          <div className="clientes-toolbar">
            <div className="clientes-search">
              <FaMagnifyingGlass />

              <input
                type="search"
                placeholder="Buscar por nombre, teléfono, email o dirección"
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
                aria-label="Buscar clientes"
              />
            </div>

            <span className="clientes-total">
              {clientesFiltrados.length}{' '}
              {clientesFiltrados.length === 1 ? 'cliente' : 'clientes'}
            </span>
          </div>

          <div className="clientes-table-wrapper">
            <table className="clientes-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {cargando && (
                  <tr>
                    <td colSpan="5" className="sin-resultados">
                      Cargando clientes...
                    </td>
                  </tr>
                )}

                {!cargando &&
                  clientesFiltrados.map((cliente) => (
                    <tr key={cliente.id}>
                      <td>
                        <strong>
                          {cliente.nombre} {cliente.apellido}
                        </strong>

                        <small>
                          {cliente.direccion || 'Dirección no registrada'}
                        </small>
                      </td>

                      <td>{cliente.telefono}</td>

                      <td>{cliente.email || 'No registrado'}</td>

                      <td>
                        <span
                          className={
                            cliente.estado
                              ? 'estado activo'
                              : 'estado inactivo'
                          }
                        >
                          {cliente.estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>

                      <td>
                        <div className="acciones">
                          <button
                            type="button"
                            className="btn-accion ver"
                            onClick={() => abrirVerCliente(cliente)}
                            title="Ver cliente"
                            aria-label={`Ver a ${cliente.nombre} ${cliente.apellido}`}
                          >
                            <FaEye />
                          </button>

                          {puedeGestionarClientes && (
  <>
    <button
      type="button"
      className="btn-accion editar"
      onClick={() => abrirEditarCliente(cliente)}
      title="Editar cliente"
      aria-label={`Editar a ${cliente.nombre} ${cliente.apellido}`}
    >
      <FaPen />
    </button>

    <button
      type="button"
      className="btn-accion eliminar"
      onClick={() => eliminarCliente(cliente)}
      title="Eliminar cliente"
      aria-label={`Eliminar a ${cliente.nombre} ${cliente.apellido}`}
    >
      <FaTrash />
    </button>
  </>
)}
                        </div>
                      </td>
                    </tr>
                  ))}

                {!cargando && clientesFiltrados.length === 0 && (
                  <tr>
                    <td colSpan="5" className="sin-resultados">
                      {busqueda
                        ? 'No se encontraron clientes con esa búsqueda.'
                        : 'Todavía no hay clientes registrados.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {(mostrarFormulario || clienteSeleccionado) && (
          <aside className="clientes-side-card">
            <button
              type="button"
              className="btn-cerrar"
              onClick={cerrarPanel}
              title="Cerrar panel"
              aria-label="Cerrar panel"
            >
              <FaXmark />
            </button>

            {mostrarFormulario ? (
              <>
                <h2>{modoEdicion ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>

                <p>
                  {modoEdicion
                    ? 'Modificá los datos del cliente seleccionado'
                    : 'Cargá los datos del nuevo dueño'}
                </p>

                <form
                  className="cliente-form"
                  onSubmit={guardarCliente}
                  noValidate
                >
                  <label htmlFor="cliente-nombre">
                    Nombre <span>*</span>
                  </label>

                  <input
                    id="cliente-nombre"
                    type="text"
                    name="nombre"
                    value={formulario.nombre}
                    onChange={manejarCambio}
                    maxLength={50}
                    autoComplete="given-name"
                    placeholder="Ejemplo: María"
                    disabled={guardando}
                  />

                  <label htmlFor="cliente-apellido">
                    Apellido <span>*</span>
                  </label>

                  <input
                    id="cliente-apellido"
                    type="text"
                    name="apellido"
                    value={formulario.apellido}
                    onChange={manejarCambio}
                    maxLength={50}
                    autoComplete="family-name"
                    placeholder="Ejemplo: López"
                    disabled={guardando}
                  />

                  <label htmlFor="cliente-telefono">
                    Teléfono <span>*</span>
                  </label>

                  <input
                    id="cliente-telefono"
                    type="tel"
                    name="telefono"
                    value={formulario.telefono}
                    onChange={manejarCambio}
                    maxLength={20}
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="Ejemplo: 3415551234"
                    disabled={guardando}
                  />

                  <label htmlFor="cliente-email">
                    Email <span>*</span>
                  </label>

                  <input
                    id="cliente-email"
                    type="email"
                    name="email"
                    value={formulario.email}
                    onChange={manejarCambio}
                    maxLength={254}
                    autoComplete="email"
                    placeholder="Ejemplo: cliente@gmail.com"
                    disabled={guardando}
                  />

                  <label htmlFor="cliente-direccion">
                    Dirección <span>*</span>
                  </label>

                  <input
                    id="cliente-direccion"
                    type="text"
                    name="direccion"
                    value={formulario.direccion}
                    onChange={manejarCambio}
                    maxLength={150}
                    autoComplete="street-address"
                    placeholder="Ejemplo: San Martín 1240"
                    disabled={guardando}
                  />

                  <label className="checkbox-cliente">
                    <input
                      type="checkbox"
                      name="estado"
                      checked={formulario.estado}
                      onChange={manejarCambio}
                      disabled={guardando}
                    />

                    <span>Cliente activo</span>
                  </label>

                  {errorFormulario && (
                    <div className="cliente-form-error" role="alert">
                      {errorFormulario}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn-guardar"
                    disabled={guardando}
                  >
                    <FaFloppyDisk />

                    {guardando
                      ? 'Guardando...'
                      : modoEdicion
                        ? 'Guardar Cambios'
                        : 'Guardar Cliente'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2>Detalle del Cliente</h2>
                <p>Información registrada del dueño</p>

                <div className="cliente-detalle">
                  <div>
                    <span>Nombre completo</span>
                    <strong>
                      {clienteSeleccionado.nombre}{' '}
                      {clienteSeleccionado.apellido}
                    </strong>
                  </div>

                  <div>
                    <span>Teléfono</span>
                    <strong>{clienteSeleccionado.telefono}</strong>
                  </div>

                  <div>
                    <span>Email</span>
                    <strong>
                      {clienteSeleccionado.email || 'No registrado'}
                    </strong>
                  </div>

                  <div>
                    <span>Dirección</span>
                    <strong>
                      {clienteSeleccionado.direccion || 'No registrada'}
                    </strong>
                  </div>

                  <div>
                    <span>Estado</span>
                    <strong>
                      {clienteSeleccionado.estado ? 'Activo' : 'Inactivo'}
                    </strong>
                  </div>
                </div>
                {puedeGestionarClientes && (
  <button
    type="button"
    className="btn-editar-detalle"
    onClick={() =>
      abrirEditarCliente(clienteSeleccionado)
    }
  >
    <FaPen />
    Editar Cliente
  </button>
)}
              </>
            )}
          </aside>
        )}
      </div>
    </section>
  )
}

export default Clientes