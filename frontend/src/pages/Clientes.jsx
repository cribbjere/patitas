import { useState } from 'react'
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

  const clientesFiltrados = clientes.filter((cliente) => {
    const texto = `${cliente.nombre} ${cliente.apellido} ${cliente.telefono} ${cliente.email} ${cliente.direccion}`.toLowerCase()
    return texto.includes(busqueda.toLowerCase())
  })

  const abrirNuevoCliente = () => {
    setFormulario(clienteVacio)
    setModoEdicion(false)
    setClienteSeleccionado(null)
    setMostrarFormulario(true)
  }

  const abrirVerCliente = (cliente) => {
    setClienteSeleccionado(cliente)
    setMostrarFormulario(false)
    setModoEdicion(false)
  }

  const abrirEditarCliente = (cliente) => {
    setFormulario(cliente)
    setClienteSeleccionado(cliente)
    setModoEdicion(true)
    setMostrarFormulario(true)
  }

  const cerrarPanel = () => {
    setFormulario(clienteVacio)
    setClienteSeleccionado(null)
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

  const guardarCliente = (e) => {
    e.preventDefault()

    if (!formulario.nombre || !formulario.apellido || !formulario.telefono) {
      alert('Completá nombre, apellido y teléfono.')
      return
    }

    if (modoEdicion) {
      const clientesActualizados = clientes.map((cliente) => {
        if (cliente.id === clienteSeleccionado.id) {
          return {
            ...formulario,
            id: clienteSeleccionado.id,
          }
        }

        return cliente
      })

      setClientes(clientesActualizados)
    } else {
      const nuevoCliente = {
        ...formulario,
        id: Date.now(),
      }

      setClientes([...clientes, nuevoCliente])
    }

    cerrarPanel()
  }

  const eliminarCliente = (id) => {
    const confirmar = window.confirm('¿Seguro que querés eliminar este cliente?')

    if (!confirmar) return

    const clientesActualizados = clientes.filter((cliente) => cliente.id !== id)
    setClientes(clientesActualizados)

    if (clienteSeleccionado?.id === id) {
      cerrarPanel()
    }
  }

  return (
    <section className="clientes-page">
      <div className="clientes-header">
        <div>
          <h1>Clientes</h1>
          <p>Gestión de dueños registrados en la veterinaria</p>
        </div>

        <button className="btn-nuevo-cliente" onClick={abrirNuevoCliente}>
          <FaPlus />
          Nuevo Cliente
        </button>
      </div>

      <div className="clientes-content">
        <div className="clientes-main-card">
          <div className="clientes-toolbar">
            <div className="clientes-search">
              <FaMagnifyingGlass />

              <input
                type="text"
                placeholder="Buscar cliente por nombre, teléfono, email o dirección"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <span className="clientes-total">
              {clientesFiltrados.length} clientes
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

                      <small>{cliente.direccion}</small>
                    </td>

                    <td>{cliente.telefono}</td>

                    <td>{cliente.email}</td>

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
                          className="btn-accion ver"
                          onClick={() => abrirVerCliente(cliente)}
                          title="Ver cliente"
                        >
                          <FaEye />
                        </button>

                        <button
                          className="btn-accion editar"
                          onClick={() => abrirEditarCliente(cliente)}
                          title="Editar cliente"
                        >
                          <FaPen />
                        </button>

                        <button
                          className="btn-accion eliminar"
                          onClick={() => eliminarCliente(cliente.id)}
                          title="Eliminar cliente"
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
                      No se encontraron clientes.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {(mostrarFormulario || clienteSeleccionado) && (
          <aside className="clientes-side-card">
            <button className="btn-cerrar" onClick={cerrarPanel}>
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

                <form className="cliente-form" onSubmit={guardarCliente}>
                  <label>Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formulario.nombre}
                    onChange={manejarCambio}
                  />

                  <label>Apellido</label>
                  <input
                    type="text"
                    name="apellido"
                    value={formulario.apellido}
                    onChange={manejarCambio}
                  />

                  <label>Teléfono</label>
                  <input
                    type="text"
                    name="telefono"
                    value={formulario.telefono}
                    onChange={manejarCambio}
                  />

                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formulario.email}
                    onChange={manejarCambio}
                  />

                  <label>Dirección</label>
                  <input
                    type="text"
                    name="direccion"
                    value={formulario.direccion}
                    onChange={manejarCambio}
                  />

                  <label className="checkbox-cliente">
                    <input
                      type="checkbox"
                      name="estado"
                      checked={formulario.estado}
                      onChange={manejarCambio}
                    />
                    Cliente activo
                  </label>

                  <button type="submit" className="btn-guardar">
                    <FaFloppyDisk />
                    Guardar Cliente
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
                      {clienteSeleccionado.nombre} {clienteSeleccionado.apellido}
                    </strong>
                  </div>

                  <div>
                    <span>Teléfono</span>
                    <strong>{clienteSeleccionado.telefono}</strong>
                  </div>

                  <div>
                    <span>Email</span>
                    <strong>{clienteSeleccionado.email}</strong>
                  </div>

                  <div>
                    <span>Dirección</span>
                    <strong>{clienteSeleccionado.direccion}</strong>
                  </div>

                  <div>
                    <span>Estado</span>
                    <strong>
                      {clienteSeleccionado.estado ? 'Activo' : 'Inactivo'}
                    </strong>
                  </div>
                </div>

                <button
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