import { useMemo, useState } from 'react'
import {
  FaMagnifyingGlass,
  FaPlus,
  FaEye,
  FaPen,
  FaTrash,
  FaFloppyDisk,
  FaXmark,
  FaScissors,
  FaTriangleExclamation,
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

const formatoDinero = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

function Higiene() {
  const [clientes] = useState(clientesIniciales)
  const [mascotas] = useState(mascotasIniciales)
  const [servicios, setServicios] = useState(serviciosIniciales)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [formulario, setFormulario] = useState(servicioVacio)
  const [errorFormulario, setErrorFormulario] = useState('')

  const obtenerMascota = (mascotaId) => {
    return mascotas.find((mascota) => mascota.id === Number(mascotaId))
  }

  const obtenerClienteDeMascota = (mascotaId) => {
    const mascota = obtenerMascota(mascotaId)

    if (!mascota) return null

    return clientes.find((cliente) => cliente.id === mascota.clienteId)
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha'

    const fechaLocal = new Date(`${fecha}T00:00:00`)

    if (Number.isNaN(fechaLocal.getTime())) return fecha

    return fechaLocal.toLocaleDateString('es-AR')
  }

  const serviciosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()

    return servicios.filter((servicio) => {
      const mascota = obtenerMascota(servicio.mascotaId)
      const cliente = obtenerClienteDeMascota(servicio.mascotaId)

      const texto = `
        ${servicio.fecha}
        ${servicio.tipoServicio}
        ${servicio.estado}
        ${servicio.observaciones}
        ${servicio.importe}
        ${mascota?.nombre || ''}
        ${mascota?.especie || ''}
        ${cliente?.nombre || ''}
        ${cliente?.apellido || ''}
      `.toLowerCase()

      return texto.includes(termino)
    })
  }, [busqueda, servicios, clientes, mascotas])

  const abrirNuevoServicio = () => {
    setFormulario(servicioVacio)
    setServicioSeleccionado(null)
    setModoEdicion(false)
    setErrorFormulario('')
    setMostrarFormulario(true)
  }

  const abrirVerServicio = (servicio) => {
    setServicioSeleccionado(servicio)
    setMostrarFormulario(false)
    setModoEdicion(false)
    setErrorFormulario('')
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
    setErrorFormulario('')
    setMostrarFormulario(true)
  }

  const cerrarPanel = () => {
    setFormulario(servicioVacio)
    setServicioSeleccionado(null)
    setMostrarFormulario(false)
    setModoEdicion(false)
    setErrorFormulario('')
  }

  const manejarCambio = (e) => {
    const { name, value } = e.target

    setFormulario((formularioActual) => ({
      ...formularioActual,
      [name]: name === 'mascotaId' && value ? Number(value) : value,
    }))

    if (errorFormulario) {
      setErrorFormulario('')
    }
  }

  const validarFormulario = () => {
    if (!formulario.mascotaId) {
      return 'Seleccioná una mascota.'
    }

    if (!formulario.tipoServicio) {
      return 'Seleccioná el tipo de servicio.'
    }

    if (!formulario.fecha) {
      return 'Ingresá la fecha del servicio.'
    }

    if (!formulario.importe || Number(formulario.importe) <= 0) {
      return 'Ingresá un importe válido mayor que cero.'
    }

    if (!formulario.estado) {
      return 'Seleccioná el estado del servicio.'
    }

    return ''
  }

  const guardarServicio = (e) => {
    e.preventDefault()

    const error = validarFormulario()

    if (error) {
      setErrorFormulario(error)
      return
    }

    const datosServicio = {
      mascotaId: Number(formulario.mascotaId),
      fecha: formulario.fecha,
      tipoServicio: formulario.tipoServicio,
      importe: Number(formulario.importe),
      estado: formulario.estado,
      observaciones: formulario.observaciones.trim(),
    }

    if (modoEdicion && servicioSeleccionado) {
      setServicios((serviciosActuales) =>
        serviciosActuales.map((servicio) =>
          servicio.id === servicioSeleccionado.id
            ? { ...servicio, ...datosServicio }
            : servicio
        )
      )
    } else {
      setServicios((serviciosActuales) => [
        ...serviciosActuales,
        {
          id: Date.now(),
          ...datosServicio,
        },
      ])
    }

    cerrarPanel()
  }

  const eliminarServicio = (id) => {
    const confirmar = window.confirm(
      '¿Seguro que querés eliminar este servicio de higiene?'
    )

    if (!confirmar) return

    setServicios((serviciosActuales) =>
      serviciosActuales.filter((servicio) => servicio.id !== id)
    )

    if (servicioSeleccionado?.id === id) {
      cerrarPanel()
    }
  }

  const mascotaSeleccionada = servicioSeleccionado
    ? obtenerMascota(servicioSeleccionado.mascotaId)
    : null

  const clienteSeleccionado = servicioSeleccionado
    ? obtenerClienteDeMascota(servicioSeleccionado.mascotaId)
    : null

  const claseEstado = (estado) => {
    if (estado === 'Realizado') return 'estado-servicio realizado'
    if (estado === 'Cancelado') return 'estado-servicio cancelado'
    return 'estado-servicio pendiente'
  }

  return (
    <section className="higiene-page">
      <div className="higiene-header">
        <div>
          <h1>Higiene</h1>
          <p>Registro de servicios de baño, corte y peluquería</p>
        </div>

        <button
          type="button"
          className="btn-nuevo-servicio"
          onClick={abrirNuevoServicio}
        >
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
              {serviciosFiltrados.length}{' '}
              {serviciosFiltrados.length === 1 ? 'servicio' : 'servicios'}
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

                      <td>{mascota?.nombre || 'Sin mascota'}</td>

                      <td>
                        {cliente
                          ? `${cliente.nombre} ${cliente.apellido}`
                          : 'Sin dueño'}
                      </td>

                      <td>{formatearFecha(servicio.fecha)}</td>

                      <td>{formatoDinero.format(servicio.importe)}</td>

                      <td>
                        <span className={claseEstado(servicio.estado)}>
                          {servicio.estado}
                        </span>
                      </td>

                      <td>
                        <div className="acciones">
                          <button
                            type="button"
                            className="btn-accion ver"
                            onClick={() => abrirVerServicio(servicio)}
                            title="Ver servicio"
                            aria-label="Ver servicio"
                          >
                            <FaEye />
                          </button>

                          <button
                            type="button"
                            className="btn-accion editar"
                            onClick={() => abrirEditarServicio(servicio)}
                            title="Editar servicio"
                            aria-label="Editar servicio"
                          >
                            <FaPen />
                          </button>

                          <button
                            type="button"
                            className="btn-accion eliminar"
                            onClick={() => eliminarServicio(servicio.id)}
                            title="Eliminar servicio"
                            aria-label="Eliminar servicio"
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
                <h2>{modoEdicion ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>

                <p>
                  {modoEdicion
                    ? 'Modificá los datos del servicio seleccionado'
                    : 'Cargá un nuevo servicio de higiene'}
                </p>

                <form className="higiene-form" onSubmit={guardarServicio}>
                  {errorFormulario && (
                    <div className="higiene-form-error" role="alert">
                      <FaTriangleExclamation />
                      <span>{errorFormulario}</span>
                    </div>
                  )}

                  <label htmlFor="mascotaId">Mascota</label>
                  <select
                    id="mascotaId"
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

                  <label htmlFor="tipoServicio">Tipo de servicio</label>
                  <select
                    id="tipoServicio"
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

                  <label htmlFor="fecha">Fecha</label>
                  <input
                    id="fecha"
                    type="date"
                    name="fecha"
                    value={formulario.fecha}
                    onChange={manejarCambio}
                  />

                  <label htmlFor="importe">Importe</label>
                  <input
                    id="importe"
                    type="number"
                    name="importe"
                    value={formulario.importe}
                    onChange={manejarCambio}
                    min="1"
                    step="1"
                    placeholder="Ejemplo: 12000"
                  />

                  <label htmlFor="estado">Estado</label>
                  <select
                    id="estado"
                    name="estado"
                    value={formulario.estado}
                    onChange={manejarCambio}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Realizado">Realizado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>

                  <label htmlFor="observaciones">Observaciones</label>
                  <textarea
                    id="observaciones"
                    name="observaciones"
                    value={formulario.observaciones}
                    onChange={manejarCambio}
                    placeholder="Información adicional del servicio"
                  />

                  <button type="submit" className="btn-guardar">
                    <FaFloppyDisk />
                    {modoEdicion ? 'Guardar Cambios' : 'Guardar Servicio'}
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
                    <strong>{mascotaSeleccionada?.nombre || 'Sin mascota'}</strong>
                  </div>

                  <div>
                    <span>Dueño</span>
                    <strong>
                      {clienteSeleccionado
                        ? `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`
                        : 'Sin dueño'}
                    </strong>
                  </div>

                  <div>
                    <span>Fecha</span>
                    <strong>{formatearFecha(servicioSeleccionado.fecha)}</strong>
                  </div>

                  <div>
                    <span>Importe</span>
                    <strong>
                      {formatoDinero.format(servicioSeleccionado.importe)}
                    </strong>
                  </div>

                  <div>
                    <span>Estado</span>
                    <span className={claseEstado(servicioSeleccionado.estado)}>
                      {servicioSeleccionado.estado}
                    </span>
                  </div>

                  <div>
                    <span>Observaciones</span>
                    <strong>
                      {servicioSeleccionado.observaciones || 'Sin observaciones'}
                    </strong>
                  </div>
                </div>

                <button
                  type="button"
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