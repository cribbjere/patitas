import { useEffect, useState } from 'react'
import {
  FaMagnifyingGlass,
  FaPlus,
  FaEye,
  FaPen,
  FaTrash,
  FaFloppyDisk,
  FaXmark,
  FaSyringe,
} from 'react-icons/fa6'
import { obtenerClientes } from '../services/clientesService'
import { obtenerMascotas } from '../services/mascotasService'
import { obtenerTurnos } from '../services/turnosService'
import { obtenerServicios } from '../services/serviciosService'

import {
  obtenerVacunaciones,
  crearVacunacion,
  editarVacunacion,
  eliminarVacunacion as eliminarVacunacionAPI,
} from '../services/vacunacionesService'
import './Vacunaciones.css'

const vacunacionVacia = {
  mascotaId: '',
  servicioId: '',
  turnoId: '',
  fechaAplicacion: '',
  proximaDosis: '',
  observaciones: '',
  estado: 'Pendiente',
}

function obtenerEstadoVacuna(vacunacion) {
  if (vacunacion.estado === 'Cancelada') {
    return 'Cancelada'
  }

  if (vacunacion.estado === 'Pendiente') {
    return 'Pendiente'
  }

  if (!vacunacion.proximaDosis) {
    return 'Aplicada'
  }

  const hoy = new Date()
  const proxima = new Date(`${vacunacion.proximaDosis}T00:00:00`)

  hoy.setHours(0, 0, 0, 0)

  if (proxima < hoy) {
    return 'Vencida'
  }

  return 'Próxima'
}
function Vacunaciones() {
  const [clientes, setClientes] = useState([])
const [mascotas, setMascotas] = useState([])
const [servicios, setServicios] = useState([])
const [turnos, setTurnos] = useState([])
const [vacunaciones, setVacunaciones] = useState([])
  

  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [vacunacionSeleccionada, setVacunacionSeleccionada] = useState(null)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [formulario, setFormulario] = useState(vacunacionVacia)

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
const obtenerServicio = (servicioId) => {
  return servicios.find(
    (servicio) => Number(servicio.id) === Number(servicioId)
  )
}
const obtenerTurno = (turnoId) => {
  return turnos.find(
    (turno) => Number(turno.id) === Number(turnoId)
  )
}
const cargarDatos = async () => {
  try {
    const [
      clientesAPI,
      mascotasAPI,
      serviciosAPI,
      turnosAPI,
      vacunacionesAPI,
    ] = await Promise.all([
      obtenerClientes(),
      obtenerMascotas(),
      obtenerServicios(),
      obtenerTurnos(),
      obtenerVacunaciones(),
    ])

    setClientes(clientesAPI)
    setMascotas(mascotasAPI)
    setServicios(serviciosAPI)
    setTurnos(turnosAPI)

    const vacunacionesConvertidas = vacunacionesAPI.map(
      (vacunacion) => {
        const servicio = serviciosAPI.find(
          (item) =>
            Number(item.id) === Number(vacunacion.servicio)
        )

        return {
          id: vacunacion.id,
          mascotaId: vacunacion.mascota,
          servicioId: vacunacion.servicio,
          turnoId: vacunacion.turno,
          vacuna:
            servicio?.descripcion || 'Vacunación sin servicio',
          fechaAplicacion: vacunacion.fecha_aplicacion,
          proximaDosis: vacunacion.proxima_dosis || '',
          observaciones: vacunacion.observaciones || '',
          estado:
            vacunacion.estado === 'aplicada'
              ? 'Aplicada'
              : vacunacion.estado === 'cancelada'
                ? 'Cancelada'
                : 'Pendiente',
          precio: vacunacion.precio,
          usuarioId: vacunacion.usuario,
          usuarioNombre: vacunacion.usuario_nombre || '',
        }
      }
    )

    setVacunaciones(vacunacionesConvertidas)
  } catch (error) {
    console.error('Error al cargar las vacunaciones:', error)

    window.alert(
      error.response?.data?.detail ||
        'No se pudieron cargar las vacunaciones.'
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
  const vacunacionesFiltradas = vacunaciones.filter((vacunacion) => {
    const mascota = obtenerMascota(vacunacion.mascotaId)
    const cliente = obtenerClienteDeMascota(vacunacion.mascotaId)
    const estado = obtenerEstadoVacuna(vacunacion)

    const texto = `
      ${vacunacion.vacuna}
      ${vacunacion.fechaAplicacion}
      ${vacunacion.proximaDosis}
      ${estado}
      ${mascota?.nombre}
      ${mascota?.especie}
      ${cliente?.nombre}
      ${cliente?.apellido}
    `.toLowerCase()

    return texto.includes(busqueda.toLowerCase())
  })
  const turnoDetalle = vacunacionSeleccionada
  ? obtenerTurno(vacunacionSeleccionada.turnoId)
  : null
  const abrirNuevaVacunacion = () => {
    setFormulario(vacunacionVacia)
    setVacunacionSeleccionada(null)
    setModoEdicion(false)
    setMostrarFormulario(true)
  }

  const abrirVerVacunacion = (vacunacion) => {
    setVacunacionSeleccionada(vacunacion)
    setMostrarFormulario(false)
    setModoEdicion(false)
  }

  const abrirEditarVacunacion = (vacunacion) => {
  setFormulario({
    mascotaId: vacunacion.mascotaId,
    servicioId: vacunacion.servicioId,
    turnoId: vacunacion.turnoId || '',
    fechaAplicacion: vacunacion.fechaAplicacion,
    proximaDosis: vacunacion.proximaDosis,
    observaciones: vacunacion.observaciones,
    estado: vacunacion.estado,
  })

  setVacunacionSeleccionada(vacunacion)
  setModoEdicion(true)
  setMostrarFormulario(true)
}

  const cerrarPanel = () => {
    setFormulario(vacunacionVacia)
    setVacunacionSeleccionada(null)
    setMostrarFormulario(false)
    setModoEdicion(false)
  }

  const manejarCambio = (e) => {
  const { name, value } = e.target

  if (name === 'turnoId') {
    const turnoSeleccionado = turnos.find(
      (turno) => Number(turno.id) === Number(value)
    )

    setFormulario({
      ...formulario,
      turnoId: value ? Number(value) : '',
      fechaAplicacion:
        turnoSeleccionado?.fecha || formulario.fechaAplicacion,
    })

    return
  }

  if (name === 'mascotaId') {
    setFormulario({
      ...formulario,
      mascotaId: value ? Number(value) : '',
      turnoId: '',
    })

    return
  }

  setFormulario({
    ...formulario,
    [name]:
      name === 'servicioId'
        ? value
          ? Number(value)
          : ''
        : value,
  })
}

 const guardarVacunacion = async (e) => {
  e.preventDefault()

  if (
    !formulario.mascotaId ||
    !formulario.servicioId ||
    !formulario.fechaAplicacion
  ) {
    alert(
      'Completá mascota, servicio y fecha de aplicación.'
    )
    return
  }

  const datos = {
    mascota: formulario.mascotaId,
    servicio: formulario.servicioId,
    turno: formulario.turnoId || null,
    fecha_aplicacion: formulario.fechaAplicacion,
    proxima_dosis: formulario.proximaDosis || null,
    observaciones: formulario.observaciones,
    estado: formulario.estado.toLowerCase(),
  }

  try {
    if (modoEdicion) {
      await editarVacunacion(
        vacunacionSeleccionada.id,
        datos
      )
    } else {
      await crearVacunacion(datos)
    }

    await cargarDatos()
    cerrarPanel()
  } catch (error) {
    console.error('Error al guardar la vacunación:', error)

    alert(
      error.response?.data?.detail ||
        Object.values(error.response?.data || {})
          .flat()
          .join(' ') ||
        'No se pudo guardar la vacunación.'
    )
  }
}
const eliminarVacunacion = async (id) => {
  const confirmar = window.confirm(
    '¿Seguro que querés eliminar esta vacunación?'
  )

  if (!confirmar) return

  try {
    await eliminarVacunacionAPI(id)

    setVacunaciones((vacunacionesActuales) =>
      vacunacionesActuales.filter(
        (vacunacion) => vacunacion.id !== id
      )
    )

    if (vacunacionSeleccionada?.id === id) {
      cerrarPanel()
    }
  } catch (error) {
    console.error('Error al eliminar la vacunación:', error)

    window.alert(
      error.response?.data?.detail ||
        Object.values(error.response?.data || {})
          .flat()
          .join(' ') ||
        'No se pudo eliminar la vacunación.'
    )
  }
}
  return (
    <section className="vacunaciones-page">
      <div className="vacunaciones-header">
        <div>
          <h1>Vacunaciones</h1>
          <p>Control de vacunas aplicadas y próximas dosis</p>
        </div>

        <button
          className="btn-nueva-vacunacion"
          onClick={abrirNuevaVacunacion}
        >
          <FaPlus />
          Nueva Vacunación
        </button>
      </div>

      <div className="vacunaciones-content">
        <div className="vacunaciones-main-card">
          <div className="vacunaciones-toolbar">
            <div className="vacunaciones-search">
              <FaMagnifyingGlass />

              <input
                type="text"
                placeholder="Buscar por mascota, dueño, vacuna, fecha o estado"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <span className="vacunaciones-total">
              {vacunacionesFiltradas.length} vacunaciones
            </span>
          </div>

          <div className="vacunaciones-table-wrapper">
            <table className="vacunaciones-table">
              <thead>
  <tr>
    <th>Vacuna</th>
    <th>Mascota</th>
    <th>Dueño</th>
    <th>Aplicación</th>
    <th>Próxima dosis</th>
    <th>Estado</th>
    <th>Precio</th>
    <th>Turno</th>
    <th>Usuario</th>
    <th>Acciones</th>
  </tr>
</thead>

              <tbody>
                {vacunacionesFiltradas.map((vacunacion) => {
                  const mascota = obtenerMascota(vacunacion.mascotaId)
                  const cliente = obtenerClienteDeMascota(vacunacion.mascotaId)
                  const estado = obtenerEstadoVacuna(vacunacion)
                  const turno = obtenerTurno(vacunacion.turnoId)

                  return (
                    <tr key={vacunacion.id}>
                      <td>
                        <div className="vacunacion-nombre">
                          <div className="vacunacion-icono">
                            <FaSyringe />
                          </div>

                          <div>
                            <strong>{vacunacion.vacuna}</strong>
                            <small>{vacunacion.observaciones || 'Sin observaciones'}</small>
                          </div>
                        </div>
                      </td>

                      <td>{mascota?.nombre}</td>

                      <td>
                        {cliente?.nombre} {cliente?.apellido}
                      </td>

                      <td>{vacunacion.fechaAplicacion}</td>

                      <td>
                        {vacunacion.proximaDosis
                          ? vacunacion.proximaDosis
                          : 'No indicada'}
                      </td>

                      <td>
                        <span
                          className={
                            estado === 'Vencida'
                              ? 'estado-vacuna vencida'
                              : estado === 'Próxima'
                                ? 'estado-vacuna proxima'
                                : 'estado-vacuna aplicada'
                          }
                        >
                          {estado}
                        </span>
                      </td>
                      <td>
  {vacunacion.precio !== null &&
  vacunacion.precio !== undefined
    ? `$${Number(vacunacion.precio).toLocaleString('es-AR')}`
    : 'Sin precio'}
</td>

<td>
  {turno
    ? `${turno.fecha}${
        turno.hora
          ? ` - ${turno.hora.slice(0, 5)}`
          : ''
      }`
    : 'Sin turno'}
</td>

<td>
  {vacunacion.usuarioNombre ||
    (vacunacion.usuarioId
      ? `Usuario #${vacunacion.usuarioId}`
      : 'Sin usuario')}
</td>

                      <td>
                        <div className="acciones">
                          <button
                            className="btn-accion ver"
                            onClick={() => abrirVerVacunacion(vacunacion)}
                            title="Ver vacunación"
                          >
                            <FaEye />
                          </button>

                          <button
                            className="btn-accion editar"
                            onClick={() => abrirEditarVacunacion(vacunacion)}
                            title="Editar vacunación"
                          >
                            <FaPen />
                          </button>

                          <button
                            className="btn-accion eliminar"
                            onClick={() => eliminarVacunacion(vacunacion.id)}
                            title="Eliminar vacunación"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {vacunacionesFiltradas.length === 0 && (
                  <tr>
                    <td colSpan="10" className="sin-resultados">
                      No se encontraron vacunaciones.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {(mostrarFormulario || vacunacionSeleccionada) && (
          <aside className="vacunaciones-side-card">
            <button className="btn-cerrar" onClick={cerrarPanel}>
              <FaXmark />
            </button>

            {mostrarFormulario ? (
              <>
                <h2>
                  {modoEdicion ? 'Editar Vacunación' : 'Nueva Vacunación'}
                </h2>

                <p>
                  {modoEdicion
                    ? 'Modificá los datos de la vacunación seleccionada'
                    : 'Cargá una vacuna aplicada y su próxima dosis'}
                </p>

                <form className="vacunacion-form" onSubmit={guardarVacunacion}>
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
                  <label>Turno asociado</label>

<select
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
      {turno.fecha} - {turno.hora?.slice(0, 5)} -{' '}
      {turno.motivo_consulta}
    </option>
  ))}
</select>

{formulario.mascotaId &&
  turnosDisponibles.length === 0 && (
    <small>
      La mascota no tiene turnos pendientes disponibles.
    </small>
  )}

                  <label>Vacuna / Servicio</label>

<select
  name="servicioId"
  value={formulario.servicioId}
  onChange={manejarCambio}
>
  <option value="">Seleccionar vacuna</option>

  {servicios.map((servicio) => (
    <option key={servicio.id} value={servicio.id}>
      {servicio.descripcion} - ${servicio.precio}
    </option>
  ))}
</select>
                  <label>Fecha de aplicación</label>
                  <input
                    type="date"
                    name="fechaAplicacion"
                    value={formulario.fechaAplicacion}
                    onChange={manejarCambio}
                  />

                  <label>Próxima dosis</label>
                  <input
                    type="date"
                    name="proximaDosis"
                    value={formulario.proximaDosis}
                    onChange={manejarCambio}
                  />

                  <label>Observaciones</label>
                  <textarea
                    name="observaciones"
                    value={formulario.observaciones}
                    onChange={manejarCambio}
                  />
                  <label>Estado</label>

<select
  name="estado"
  value={formulario.estado}
  onChange={manejarCambio}
>
  <option value="Pendiente">Pendiente</option>
  <option value="Aplicada">Aplicada</option>
  <option value="Cancelada">Cancelada</option>
</select>

                  <button type="submit" className="btn-guardar">
                    <FaFloppyDisk />
                    Guardar Vacunación
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2>Detalle de Vacunación</h2>
                <p>Información de la vacuna registrada</p>

                <div className="vacunacion-detalle">
                  <div>
                    <span>Vacuna</span>
                    <strong>{vacunacionSeleccionada.vacuna}</strong>
                  </div>

                  <div>
                    <span>Mascota</span>
                    <strong>
                      {obtenerMascota(vacunacionSeleccionada.mascotaId)?.nombre}
                    </strong>
                  </div>

                  <div>
                    <span>Dueño</span>
                    <strong>
                      {
                        obtenerClienteDeMascota(
                          vacunacionSeleccionada.mascotaId
                        )?.nombre
                      }{' '}
                      {
                        obtenerClienteDeMascota(
                          vacunacionSeleccionada.mascotaId
                        )?.apellido
                      }
                    </strong>
                  </div>
                  <div>
  <span>Turno asociado</span>
  <strong>
    {turnoDetalle
      ? `${turnoDetalle.fecha}${
          turnoDetalle.hora
            ? ` - ${turnoDetalle.hora.slice(0, 5)}`
            : ''
        }${
          turnoDetalle.motivo_consulta
            ? ` - ${turnoDetalle.motivo_consulta}`
            : ''
        }`
      : 'Sin turno asociado'}
  </strong>
</div>

<div>
  <span>Precio</span>
  <strong>
    {vacunacionSeleccionada.precio !== null &&
    vacunacionSeleccionada.precio !== undefined
      ? `$${Number(
          vacunacionSeleccionada.precio
        ).toLocaleString('es-AR')}`
      : 'Sin precio'}
  </strong>
</div>

<div>
  <span>Usuario</span>
  <strong>
    {vacunacionSeleccionada.usuarioNombre ||
      (vacunacionSeleccionada.usuarioId
        ? `Usuario #${vacunacionSeleccionada.usuarioId}`
        : 'Sin usuario')}
  </strong>
</div>

                  <div>
                    <span>Fecha de aplicación</span>
                    <strong>{vacunacionSeleccionada.fechaAplicacion}</strong>
                  </div>

                  <div>
                    <span>Próxima dosis</span>
                    <strong>
                      {vacunacionSeleccionada.proximaDosis || 'No indicada'}
                    </strong>
                  </div>

                  <div>
                    <span>Estado</span>
                    <strong>{obtenerEstadoVacuna(vacunacionSeleccionada)}</strong>
                  </div>

                  <div>
                    <span>Observaciones</span>
                    <strong>
                      {vacunacionSeleccionada.observaciones ||
                        'Sin observaciones'}
                    </strong>
                  </div>
                </div>

                <button
                  className="btn-editar-detalle"
                  onClick={() => abrirEditarVacunacion(vacunacionSeleccionada)}
                >
                  <FaPen />
                  Editar Vacunación
                </button>
              </>
            )}
          </aside>
        )}
      </div>
    </section>
  )
}

export default Vacunaciones