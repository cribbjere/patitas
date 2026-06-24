import { useState } from 'react'
import {
  FaMagnifyingGlass,
  FaPlus,
  FaEye,
  FaPen,
  FaTrash,
  FaFloppyDisk,
  FaXmark,
  FaScissors,
} from 'react-icons/fa6'

import {
  clientes as clientesIniciales,
  mascotas as mascotasIniciales,
} from '../data/mockData'

import './Higiene.css'

const serviciosIniciales = [
  {
    id: 1,
    mascotaId: 1,
    fecha: '2026-06-18',
    tipoServicio: 'Baño completo',
    importe: 12000,
    estado: 'Realizado',
    observaciones: 'Se realizó baño con shampoo neutro.',
  },
  {
    id: 2,
    mascotaId: 2,
    fecha: '2026-06-19',
    tipoServicio: 'Corte de uñas',
    importe: 5000,
    estado: 'Realizado',
    observaciones: 'Mascota tranquila durante el servicio.',
  },
  {
    id: 3,
    mascotaId: 3,
    fecha: '2026-06-25',
    tipoServicio: 'Baño y cepillado',
    importe: 15000,
    estado: 'Pendiente',
    observaciones: 'Servicio programado.',
  },
]

const servicioVacio = {
  mascotaId: '',
  fecha: '',
  tipoServicio: '',
  importe: '',
  estado: 'Pendiente',
  observaciones: '',
}

function Higiene() {
  const [clientes] = useState(clientesIniciales)
  const [mascotas] = useState(mascotasIniciales)
  const [servicios, setServicios] = useState(serviciosIniciales)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [formulario, setFormulario] = useState(servicioVacio)

  const formatoDinero = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  })

  const obtenerMascota = (mascotaId) => {
    return mascotas.find((mascota) => mascota.id === mascotaId)
  }

  const obtenerClienteDeMascota = (mascotaId) => {
    const mascota = obtenerMascota(mascotaId)

    if (!mascota) return null

    return clientes.find((cliente) => cliente.id === mascota.clienteId)
  }

  const serviciosFiltrados = servicios.filter((servicio) => {
    const mascota = obtenerMascota(servicio.mascotaId)
    const cliente = obtenerClienteDeMascota(servicio.mascotaId)

    const texto = `
      ${servicio.fecha}
      ${servicio.tipoServicio}
      ${servicio.estado}
      ${servicio.observaciones}
      ${mascota?.nombre}
      ${mascota?.especie}
      ${cliente?.nombre}
      ${cliente?.apellido}
    `.toLowerCase()

    return texto.includes(busqueda.toLowerCase())
  })

  const abrirNuevoServicio = () => {
    setFormulario(servicioVacio)
    setServicioSeleccionado(null)
    setModoEdicion(false)
    setMostrarFormulario(true)
  }

  const abrirVerServicio = (servicio) => {
    setServicioSeleccionado(servicio)
    setMostrarFormulario(false)
    setModoEdicion(false)
  }

  const abrirEditarServicio = (servicio) => {
    setFormulario({
      mascotaId: servicio.mascotaId,
      fecha: servicio.fecha,
      tipoServicio: servicio.tipoServicio,
      importe: servicio.importe,
      estado: servicio.estado,
      observaciones: servicio.observaciones,
    })

    setServicioSeleccionado(servicio)
    setModoEdicion(true)
    setMostrarFormulario(true)
  }

  const cerrarPanel = () => {
    setFormulario(servicioVacio)
    setServicioSeleccionado(null)
    setMostrarFormulario(false)
    setModoEdicion(false)
  }

  const manejarCambio = (e) => {
    const { name, value } = e.target

    setFormulario({
      ...formulario,
      [name]: name === 'mascotaId' ? Number(value) : value,
    })
  }

  const guardarServicio = (e) => {
    e.preventDefault()

    if (
      !formulario.mascotaId ||
      !formulario.fecha ||
      !formulario.tipoServicio ||
      !formulario.importe
    ) {
      alert('Completá mascota, fecha, tipo de servicio e importe.')
      return
    }

    if (modoEdicion) {
      const serviciosActualizados = servicios.map((servicio) => {
        if (servicio.id === servicioSeleccionado.id) {
          return {
            id: servicioSeleccionado.id,
            mascotaId: formulario.mascotaId,
            fecha: formulario.fecha,
            tipoServicio: formulario.tipoServicio,
            importe: Number(formulario.importe),
            estado: formulario.estado,
            observaciones: formulario.observaciones,
          }
        }

        return servicio
      })

      setServicios(serviciosActualizados)
    } else {
      const nuevoServicio = {
        id: Date.now(),
        mascotaId: formulario.mascotaId,
        fecha: formulario.fecha,
        tipoServicio: formulario.tipoServicio,
        importe: Number(formulario.importe),
        estado: formulario.estado,
        observaciones: formulario.observaciones,
      }

      setServicios([...servicios, nuevoServicio])
    }

    cerrarPanel()
  }

  const eliminarServicio = (id) => {
    const confirmar = window.confirm(
      '¿Seguro que querés eliminar este servicio de higiene?'
    )

    if (!confirmar) return

    const serviciosActualizados = servicios.filter(
      (servicio) => servicio.id !== id
    )

    setServicios(serviciosActualizados)

    if (servicioSeleccionado?.id === id) {
      cerrarPanel()
    }
  }

  return (
    <section className="higiene-page">
      <div className="higiene-header">
        <div>
          <h1>Higiene</h1>
          <p>Registro de servicios de baño, corte y peluquería</p>
        </div>

        <button className="btn-nuevo-servicio" onClick={abrirNuevoServicio}>
          <FaPlus />
          Nuevo Servicio
        </button>
      </div>

      <div className="higiene-content">
        <div className="higiene-main-card">
          <div className="higiene-toolbar">
            <div className="higiene-search">
              <FaMagnifyingGlass />

              <input
                type="text"
                placeholder="Buscar por mascota, dueño, servicio, fecha o estado"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <span className="higiene-total">
              {serviciosFiltrados.length} servicios
            </span>
          </div>

          <div className="higiene-table-wrapper">
            <table className="higiene-table">
              <thead>
                <tr>
                  <th>Servicio</th>
                  <th>Mascota</th>
                  <th>Dueño</th>
                  <th>Fecha</th>
                  <th>Importe</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {serviciosFiltrados.map((servicio) => {
                  const mascota = obtenerMascota(servicio.mascotaId)
                  const cliente = obtenerClienteDeMascota(servicio.mascotaId)

                  return (
                    <tr key={servicio.id}>
                      <td>
                        <div className="servicio-nombre">
                          <div className="servicio-icono">
                            <FaScissors />
                          </div>

                          <div>
                            <strong>{servicio.tipoServicio}</strong>
                            <small>
                              {servicio.observaciones || 'Sin observaciones'}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>{mascota?.nombre}</td>

                      <td>
                        {cliente?.nombre} {cliente?.apellido}
                      </td>

                      <td>{servicio.fecha}</td>

                      <td>{formatoDinero.format(servicio.importe)}</td>

                      <td>
                        <span
                          className={
                            servicio.estado === 'Realizado'
                              ? 'estado-servicio realizado'
                              : servicio.estado === 'Cancelado'
                                ? 'estado-servicio cancelado'
                                : 'estado-servicio pendiente'
                          }
                        >
                          {servicio.estado}
                        </span>
                      </td>

                      <td>
                        <div className="acciones">
                          <button
                            className="btn-accion ver"
                            onClick={() => abrirVerServicio(servicio)}
                            title="Ver servicio"
                          >
                            <FaEye />
                          </button>

                          <button
                            className="btn-accion editar"
                            onClick={() => abrirEditarServicio(servicio)}
                            title="Editar servicio"
                          >
                            <FaPen />
                          </button>

                          <button
                            className="btn-accion eliminar"
                            onClick={() => eliminarServicio(servicio.id)}
                            title="Eliminar servicio"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {serviciosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan="7" className="sin-resultados">
                      No se encontraron servicios de higiene.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {(mostrarFormulario || servicioSeleccionado) && (
          <aside className="higiene-side-card">
            <button className="btn-cerrar" onClick={cerrarPanel}>
              <FaXmark />
            </button>

            {mostrarFormulario ? (
              <>
                <h2>{modoEdicion ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>

                <p>
                  {modoEdicion
                    ? 'Modificá los datos del servicio seleccionado'
                    : 'Cargá un nuevo servicio de higiene'}
                </p>

                <form className="higiene-form" onSubmit={guardarServicio}>
                  <label>Mascota</label>
                  <select
                    name="mascotaId"
                    value={formulario.mascotaId}
                    onChange={manejarCambio}
                  >
                    <option value="">Seleccionar mascota</option>

                    {mascotas.map((mascota) => {
                      const cliente = obtenerClienteDeMascota(mascota.id)

                      return (
                        <option key={mascota.id} value={mascota.id}>
                          {mascota.nombre} - {cliente?.nombre}{' '}
                          {cliente?.apellido}
                        </option>
                      )
                    })}
                  </select>

                  <label>Tipo de servicio</label>
                  <select
                    name="tipoServicio"
                    value={formulario.tipoServicio}
                    onChange={manejarCambio}
                  >
                    <option value="">Seleccionar servicio</option>
                    <option value="Baño completo">Baño completo</option>
                    <option value="Corte de pelo">Corte de pelo</option>
                    <option value="Corte de uñas">Corte de uñas</option>
                    <option value="Baño y cepillado">Baño y cepillado</option>
                    <option value="Limpieza de oídos">Limpieza de oídos</option>
                    <option value="Peluquería completa">
                      Peluquería completa
                    </option>
                  </select>

                  <label>Fecha</label>
                  <input
                    type="date"
                    name="fecha"
                    value={formulario.fecha}
                    onChange={manejarCambio}
                  />

                  <label>Importe</label>
                  <input
                    type="number"
                    name="importe"
                    value={formulario.importe}
                    onChange={manejarCambio}
                  />

                  <label>Estado</label>
                  <select
                    name="estado"
                    value={formulario.estado}
                    onChange={manejarCambio}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Realizado">Realizado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>

                  <label>Observaciones</label>
                  <textarea
                    name="observaciones"
                    value={formulario.observaciones}
                    onChange={manejarCambio}
                  />

                  <button type="submit" className="btn-guardar">
                    <FaFloppyDisk />
                    Guardar Servicio
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2>Detalle del Servicio</h2>
                <p>Información del servicio de higiene</p>

                <div className="servicio-detalle">
                  <div>
                    <span>Tipo de servicio</span>
                    <strong>{servicioSeleccionado.tipoServicio}</strong>
                  </div>

                  <div>
                    <span>Mascota</span>
                    <strong>
                      {obtenerMascota(servicioSeleccionado.mascotaId)?.nombre}
                    </strong>
                  </div>

                  <div>
                    <span>Dueño</span>
                    <strong>
                      {
                        obtenerClienteDeMascota(servicioSeleccionado.mascotaId)
                          ?.nombre
                      }{' '}
                      {
                        obtenerClienteDeMascota(servicioSeleccionado.mascotaId)
                          ?.apellido
                      }
                    </strong>
                  </div>

                  <div>
                    <span>Fecha</span>
                    <strong>{servicioSeleccionado.fecha}</strong>
                  </div>

                  <div>
                    <span>Importe</span>
                    <strong>
                      {formatoDinero.format(servicioSeleccionado.importe)}
                    </strong>
                  </div>

                  <div>
                    <span>Estado</span>
                    <strong>{servicioSeleccionado.estado}</strong>
                  </div>

                  <div>
                    <span>Observaciones</span>
                    <strong>
                      {servicioSeleccionado.observaciones ||
                        'Sin observaciones'}
                    </strong>
                  </div>
                </div>

                <button
                  className="btn-editar-detalle"
                  onClick={() => abrirEditarServicio(servicioSeleccionado)}
                >
                  <FaPen />
                  Editar Servicio
                </button>
              </>
            )}
          </aside>
        )}
      </div>
    </section>
  )
}

export default Higiene