import { useMemo, useState } from 'react'
import {
  FaMagnifyingGlass,
  FaPlus,
  FaEye,
  FaPen,
  FaTrash,
  FaFloppyDisk,
  FaXmark,
} from 'react-icons/fa6'

import { clientes as clientesIniciales } from '../data/mockData'
import { soloLetras, soloNumeros } from '../utils/validaciones'
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
  const [clientes, setClientes] = useState(clientesIniciales)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [formulario, setFormulario] = useState(clienteVacio)
  const [errorFormulario, setErrorFormulario] = useState('')

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

    if (!nombre || !apellido || !telefono) {
      return 'Completá el nombre, el apellido y el teléfono.'
    }

    if (nombre.length < 2 || apellido.length < 2) {
      return 'El nombre y el apellido deben tener al menos 2 letras.'
    }

    if (telefono.length < 7) {
      return 'Ingresá un número de teléfono válido.'
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Ingresá un correo electrónico válido.'
    }

    return ''
  }

  const guardarCliente = (evento) => {
    evento.preventDefault()

    const error = validarFormulario()

    if (error) {
      setErrorFormulario(error)
      return
    }

    const datosCliente = {
      ...formulario,
      nombre: formulario.nombre.trim(),
      apellido: formulario.apellido.trim(),
      telefono: formulario.telefono.trim(),
      email: formulario.email.trim(),
      direccion: formulario.direccion.trim(),
    }

    if (modoEdicion && clienteSeleccionado) {
      setClientes((clientesAnteriores) =>
        clientesAnteriores.map((cliente) =>
          cliente.id === clienteSeleccionado.id
            ? {
                ...datosCliente,
                id: clienteSeleccionado.id,
              }
            : cliente
        )
      )
    } else {
      const nuevoCliente = {
        ...datosCliente,
        id: Date.now(),
      }

      setClientes((clientesAnteriores) => [
        ...clientesAnteriores,
        nuevoCliente,
      ])
    }

    cerrarPanel()
  }

  const eliminarCliente = (cliente) => {
    const confirmar = window.confirm(
      `¿Seguro que querés eliminar a ${cliente.nombre} ${cliente.apellido}?`
    )

    if (!confirmar) {
      return
    }

    setClientes((clientesAnteriores) =>
      clientesAnteriores.filter((item) => item.id !== cliente.id)
    )

    if (clienteSeleccionado?.id === cliente.id) {
      cerrarPanel()
    }
  }

  return (
    <section className="clientes-page">
      <header className="clientes-header">
        <div>
          <h1>Clientes</h1>
          <p>Gestión de dueños registrados en la veterinaria</p>
        </div>

        <button
          type="button"
          className="btn-nuevo-cliente"
          onClick={abrirNuevoCliente}
        >
          <FaPlus />
          Nuevo Cliente
        </button>
      </header>

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
                {clientesFiltrados.map((cliente) => (
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
                          cliente.estado ? 'estado activo' : 'estado inactivo'
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
                      </div>
                    </td>
                  </tr>
                ))}

                {clientesFiltrados.length === 0 && (
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
                    maxLength={15}
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="Ejemplo: 3415551234"
                  />

                  <label htmlFor="cliente-email">Email</label>

                  <input
                    id="cliente-email"
                    type="email"
                    name="email"
                    value={formulario.email}
                    onChange={manejarCambio}
                    maxLength={100}
                    autoComplete="email"
                    placeholder="Ejemplo: cliente@gmail.com"
                  />

                  <label htmlFor="cliente-direccion">Dirección</label>

                  <input
                    id="cliente-direccion"
                    type="text"
                    name="direccion"
                    value={formulario.direccion}
                    onChange={manejarCambio}
                    maxLength={120}
                    autoComplete="street-address"
                    placeholder="Ejemplo: San Martín 1240"
                  />

                  <label className="checkbox-cliente">
                    <input
                      type="checkbox"
                      name="estado"
                      checked={formulario.estado}
                      onChange={manejarCambio}
                    />

                    <span>Cliente activo</span>
                  </label>

                  {errorFormulario && (
                    <div className="cliente-form-error" role="alert">
                      {errorFormulario}
                    </div>
                  )}

                  <button type="submit" className="btn-guardar">
                    <FaFloppyDisk />
                    {modoEdicion ? 'Guardar Cambios' : 'Guardar Cliente'}
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

                <button
                  type="button"
                  className="btn-editar-detalle"
                  onClick={() => abrirEditarCliente(clienteSeleccionado)}
                >
                  <FaPen />
                  Editar Cliente
                </button>
              </>
            )}
          </aside>
        )}
      </div>
    </section>
  )
}

export default Clientes