import { useEffect, useMemo, useState } from 'react'
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

import { obtenerClientes } from '../services/clientesService'
import { obtenerMascotas } from '../services/mascotasService'
import { obtenerTurnos } from '../services/turnosService'
import { obtenerServicios } from '../services/serviciosService'
import {
  obtenerServiciosHigiene,
  crearServicioHigiene,
  editarServicioHigiene,
  eliminarServicioHigiene,
} from '../services/higieneService'

import './Higiene.css'


const servicioVacio = {
  mascotaId: '',
  servicioId: '',
  turnoId: '',
  fecha: '',
  estado: 'Pendiente',
  observaciones: '',
}

const formatoDinero = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

function Higiene() {
  const [clientes, setClientes] = useState([])
const [mascotas, setMascotas] = useState([])
const [catalogoServicios, setCatalogoServicios] = useState([])
const [turnos, setTurnos] = useState([])
const [servicios, setServicios] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [formulario, setFormulario] = useState(servicioVacio)
  const [errorFormulario, setErrorFormulario] = useState('')

  const obtenerMascota = (mascotaId) => {
  return mascotas.find(
    (mascota) => Number(mascota.id) === Number(mascotaId)
  )
}
  const obtenerClienteDeMascota = (mascotaId) => {
  const mascota = obtenerMascota(mascotaId)

  if (!mascota) return null

  const clienteId =
    mascota.clienteId ??
    mascota.cliente?.id ??
    mascota.cliente

  return clientes.find(
    (cliente) => Number(cliente.id) === Number(clienteId)
  )
}
const cargarDatos = async () => {
  try {
    const [
      clientesAPI,
      mascotasAPI,
      catalogoServiciosAPI,
      turnosAPI,
      serviciosHigieneAPI,
    ] = await Promise.all([
      obtenerClientes(),
      obtenerMascotas(),
      obtenerServicios(),
      obtenerTurnos(),
      obtenerServiciosHigiene(),
    ])

    setClientes(clientesAPI)
    setMascotas(mascotasAPI)
    setCatalogoServicios(catalogoServiciosAPI)
    setTurnos(turnosAPI)

    const serviciosConvertidos = serviciosHigieneAPI.map(
      (servicioHigiene) => {
        const servicioEncontrado = catalogoServiciosAPI.find(
          (servicio) =>
            Number(servicio.id) ===
            Number(servicioHigiene.servicio)
        )

        return {
          id: servicioHigiene.id,
          mascotaId: servicioHigiene.mascota,
          servicioId: servicioHigiene.servicio,
          turnoId: servicioHigiene.turno,
          fecha: servicioHigiene.fecha,
          tipoServicio:
            servicioEncontrado?.descripcion ||
            'Servicio sin descripción',
          importe: servicioHigiene.precio,
          estado:
            servicioHigiene.estado === 'realizado'
              ? 'Realizado'
              : servicioHigiene.estado === 'cancelado'
                ? 'Cancelado'
                : 'Pendiente',
          observaciones: servicioHigiene.observaciones || '',
          usuarioId: servicioHigiene.usuario,
          usuarioNombre:
            servicioHigiene.usuario_nombre || '',
        }
      }
    )

    setServicios(serviciosConvertidos)
  } catch (error) {
    console.error(
      'Error al cargar los servicios de higiene:',
      error
    )

    window.alert(
      error.response?.data?.detail ||
        'No se pudieron cargar los servicios de higiene.'
    )
  }
}

useEffect(() => {
  cargarDatos()
}, [])
const turnosDisponibles = turnos.filter((turno) => {
  if (!formulario.mascotaId) {
    return false
  }

  const mascotaDelTurno =
    turno.mascota?.id ??
    turno.mascotaId ??
    turno.mascota

  const perteneceAMascota =
    Number(mascotaDelTurno) === Number(formulario.mascotaId)

  const estaPendiente = turno.estado === 'pendiente'

  const esTurnoActual =
    Number(turno.id) === Number(formulario.turnoId)

  return perteneceAMascota && (estaPendiente || esTurnoActual)
})

const servicioFormulario = catalogoServicios.find(
  (servicio) =>
    Number(servicio.id) === Number(formulario.servicioId)
)
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
    servicioId: servicio.servicioId,
    turnoId: servicio.turnoId || '',
    fecha: servicio.fecha,
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

  if (name === 'turnoId') {
    const turnoSeleccionado = turnos.find(
      (turno) => Number(turno.id) === Number(value)
    )

    setFormulario((formularioActual) => ({
      ...formularioActual,
      turnoId: value ? Number(value) : '',
      fecha: turnoSeleccionado?.fecha || formularioActual.fecha,
    }))
  } else if (name === 'mascotaId') {
    setFormulario((formularioActual) => ({
      ...formularioActual,
      mascotaId: value ? Number(value) : '',
      turnoId: '',
    }))
  } else if (name === 'servicioId') {
    setFormulario((formularioActual) => ({
      ...formularioActual,
      servicioId: value ? Number(value) : '',
    }))
  } else {
    setFormulario((formularioActual) => ({
      ...formularioActual,
      [name]: value,
    }))
  }

  if (errorFormulario) {
    setErrorFormulario('')
  }
}

 const validarFormulario = () => {
  if (!formulario.mascotaId) {
    return 'Seleccioná una mascota.'
  }

  if (!formulario.servicioId) {
    return 'Seleccioná el tipo de servicio.'
  }

  if (!formulario.fecha) {
    return 'Ingresá la fecha del servicio.'
  }

  if (!formulario.estado) {
    return 'Seleccioná el estado del servicio.'
  }

  return ''
}

  const guardarServicio = async (e) => {
  e.preventDefault()

  const error = validarFormulario()

  if (error) {
    setErrorFormulario(error)
    return
  }

  const datos = {
    mascota: formulario.mascotaId,
    servicio: formulario.servicioId,
    turno: formulario.turnoId || null,
    fecha: formulario.fecha,
    estado: formulario.estado.toLowerCase(),
    observaciones: formulario.observaciones.trim(),
  }

  try {
    setErrorFormulario('')

    if (modoEdicion && servicioSeleccionado) {
      await editarServicioHigiene(
        servicioSeleccionado.id,
        datos
      )
    } else {
      await crearServicioHigiene(datos)
    }

    await cargarDatos()
    cerrarPanel()
  } catch (errorGuardar) {
    console.error(
      'Error al guardar el servicio de higiene:',
      errorGuardar
    )

    setErrorFormulario(
      errorGuardar.response?.data?.detail ||
        Object.values(errorGuardar.response?.data || {})
          .flat()
          .join(' ') ||
        'No se pudo guardar el servicio de higiene.'
    )
  }
}

  const eliminarServicio = async (id) => {
  const confirmar = window.confirm(
    '¿Seguro que querés eliminar este servicio de higiene?'
  )

  if (!confirmar) return

  try {
    await eliminarServicioHigiene(id)

    setServicios((serviciosActuales) =>
      serviciosActuales.filter(
        (servicio) => servicio.id !== id
      )
    )

    if (servicioSeleccionado?.id === id) {
      cerrarPanel()
    }
  } catch (error) {
    console.error(
      'Error al eliminar el servicio de higiene:',
      error
    )

    window.alert(
      error.response?.data?.detail ||
        Object.values(error.response?.data || {})
          .flat()
          .join(' ') ||
        'No se pudo eliminar el servicio de higiene.'
    )
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
                  <label htmlFor="turnoId">Turno asociado</label>

<select
  id="turnoId"
  name="turnoId"
  value={formulario.turnoId}
  onChange={manejarCambio}
  disabled={!formulario.mascotaId}
>
  <option value="">
    {formulario.mascotaId
      ? 'Sin turno asociado'
      : 'Primero seleccioná una mascota'}
  </option>

  {turnosDisponibles.map((turno) => (
    <option key={turno.id} value={turno.id}>
      {turno.fecha}
      {turno.hora ? ` - ${turno.hora.slice(0, 5)}` : ''}
      {turno.motivo_consulta
        ? ` - ${turno.motivo_consulta}`
        : ''}
    </option>
  ))}
</select>

{formulario.mascotaId &&
  turnosDisponibles.length === 0 && (
    <small>
      La mascota no tiene turnos pendientes disponibles.
    </small>
  )}
                  <label htmlFor="servicioId">Tipo de servicio</label>

<select
  id="servicioId"
  name="servicioId"
  value={formulario.servicioId}
  onChange={manejarCambio}
>
  <option value="">Seleccionar servicio</option>

  {catalogoServicios.map((servicio) => (
    <option key={servicio.id} value={servicio.id}>
      {servicio.descripcion} - ${servicio.precio}
    </option>
  ))}
</select>

                  <label htmlFor="fecha">Fecha</label>
                  <input
                    id="fecha"
                    type="date"
                    name="fecha"
                    value={formulario.fecha}
                    onChange={manejarCambio}
                  />

                  <label htmlFor="importe">Importe automático</label>

<input
  id="importe"
  type="text"
  value={
    servicioFormulario
      ? formatoDinero.format(Number(servicioFormulario.precio))
      : ''
  }
  readOnly
  placeholder="Se completa al elegir el servicio"
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