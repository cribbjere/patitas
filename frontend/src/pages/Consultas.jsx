import { useEffect, useState } from 'react'
import {
  FaMagnifyingGlass,
  FaPlus,
  FaEye,
  FaPen,
  FaTrash,
  FaFloppyDisk,
  FaXmark,
  FaStethoscope,
} from 'react-icons/fa6'

import { obtenerClientes } from '../services/clientesService'
import { obtenerMascotas } from '../services/mascotasService'
import { obtenerTurnos } from '../services/turnosService'
import { obtenerServicios } from '../services/serviciosService'
import {
  obtenerConsultas,
  crearConsulta,
  editarConsulta,
  eliminarConsulta as eliminarConsultaAPI,
} from '../services/consultasService'

import './Consultas.css'
const consultaVacia = {
  mascotaId: '',
  servicioId: '',
  turnoId: '',
  fecha: '',
  peso: '',
  temperatura: '',
  diagnostico: '',
  tratamiento: '',
  observaciones: '',
  estado: 'Pendiente',
  proximoControl: '',
}

function Consultas() {
  const [clientes, setClientes] = useState([])
  const [mascotas, setMascotas] = useState([])
  const [servicios, setServicios] = useState([])
  const [turnos, setTurnos] = useState([])
  const [consultas, setConsultas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [consultaSeleccionada, setConsultaSeleccionada] = useState(null)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [formulario, setFormulario] = useState(consultaVacia)

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
const cargarDatos = async () => {
  try {
    setCargando(true)

    const [
  clientesAPI,
  mascotasAPI,
  serviciosAPI,
  turnosAPI,
  consultasAPI,
] = await Promise.all([
  obtenerClientes(),
  obtenerMascotas(),
  obtenerServicios(),
  obtenerTurnos(),
  obtenerConsultas(),
])

    setClientes(clientesAPI)
    setMascotas(mascotasAPI)
    setServicios(serviciosAPI)
    setTurnos(turnosAPI)

    const consultasConvertidas = consultasAPI.map((consulta) => ({
      id: consulta.id,
      mascotaId: consulta.mascota,
      servicioId: consulta.servicio,
      fecha: consulta.fecha_consulta,
      peso: consulta.peso_actual ?? '',
      temperatura: consulta.temperatura ?? '',
      diagnostico: consulta.diagnostico,
      tratamiento: consulta.tratamiento,
      observaciones: consulta.observaciones || '',
      estado:
        consulta.estado === 'realizada'
          ? 'Realizada'
          : consulta.estado === 'cancelada'
            ? 'Cancelada'
            : 'Pendiente',
      proximoControl: consulta.proximo_control || '',
      precio: consulta.precio,
      turnoId: consulta.turno,
      usuarioId: consulta.usuario,
      usuarioNombre: consulta.usuario_nombre || '',
    }))

    setConsultas(consultasConvertidas)
  } catch (error) {
    console.error('Error al cargar las consultas:', error)

    window.alert(
      error.response?.data?.detail ||
      'No se pudieron cargar los datos de consultas.'
    )
  } finally {
    setCargando(false)
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
  const consultasFiltradas = consultas.filter((consulta) => {
    const mascota = obtenerMascota(consulta.mascotaId)
    const cliente = obtenerClienteDeMascota(consulta.mascotaId)

    const texto = `
      ${consulta.fecha}
      ${consulta.diagnostico}
      ${consulta.tratamiento}
      ${consulta.observaciones}
      ${mascota?.nombre}
      ${mascota?.especie}
      ${cliente?.nombre}
      ${cliente?.apellido}
    `.toLowerCase()

    return texto.includes(busqueda.toLowerCase())
  })

  const historialMascota = consultaSeleccionada
    ? consultas.filter(
        (consulta) => consulta.mascotaId === consultaSeleccionada.mascotaId
      )
    : []
  const servicioDetalle = consultaSeleccionada
  ? obtenerServicio(consultaSeleccionada.servicioId)
  : null

const turnoDetalle = consultaSeleccionada
  ? turnos.find(
      (turno) =>
        Number(turno.id) === Number(consultaSeleccionada.turnoId)
    )
  : null
  const abrirNuevaConsulta = () => {
    setFormulario(consultaVacia)
    setConsultaSeleccionada(null)
    setModoEdicion(false)
    setMostrarFormulario(true)
  }

  const abrirVerConsulta = (consulta) => {
    setConsultaSeleccionada(consulta)
    setMostrarFormulario(false)
    setModoEdicion(false)
  }

  const abrirEditarConsulta = (consulta) => {
    setFormulario({
      mascotaId: consulta.mascotaId,
      servicioId: consulta.servicioId,
      turnoId: consulta.turnoId || '',
      fecha: consulta.fecha,
      peso: consulta.peso,
      temperatura: consulta.temperatura,
      diagnostico: consulta.diagnostico,
      tratamiento: consulta.tratamiento,
      observaciones: consulta.observaciones,
      estado: consulta.estado,
      proximoControl: consulta.proximoControl,
})
    setConsultaSeleccionada(consulta)
    setModoEdicion(true)
    setMostrarFormulario(true)
  }

  const cerrarPanel = () => {
    setFormulario(consultaVacia)
    setConsultaSeleccionada(null)
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
      fecha: turnoSeleccionado?.fecha || formulario.fecha,
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

  const guardarConsulta = async (e) => {
  e.preventDefault()

  if (
    !formulario.mascotaId ||
    !formulario.servicioId ||
    !formulario.fecha ||
    !formulario.diagnostico ||
    !formulario.tratamiento
  ) {
    alert('Completá todos los campos obligatorios.')
    return
  }

  const datos = {
    mascota: formulario.mascotaId,
    servicio: formulario.servicioId,
    turno: formulario.turnoId || null,
    fecha_consulta: formulario.fecha,
    peso_actual: formulario.peso || null,
    temperatura: formulario.temperatura || null,
    diagnostico: formulario.diagnostico,
    tratamiento: formulario.tratamiento,
    observaciones: formulario.observaciones,
    estado: formulario.estado.toLowerCase(),
    proximo_control: formulario.proximoControl || null,
  }

  try {

    if (modoEdicion) {

      await editarConsulta(
        consultaSeleccionada.id,
        datos
      )

    } else {

      await crearConsulta(datos)

    }

    await cargarDatos()

    cerrarPanel()

  } catch (error) {

    console.error(error)

    alert(
      error.response?.data?.detail ||
      Object.values(error.response?.data || {})
        .flat()
        .join(' ') ||
      'No se pudo guardar la consulta.'
    )

  }
}

 const eliminarConsulta = async (id) => {
  const confirmar = window.confirm(
    '¿Seguro que querés eliminar esta consulta?'
  )

  if (!confirmar) return

  try {
    await eliminarConsultaAPI(id)

    setConsultas((consultasActuales) =>
      consultasActuales.filter((consulta) => consulta.id !== id)
    )

    if (consultaSeleccionada?.id === id) {
      cerrarPanel()
    }
  } catch (error) {
    console.error(error)

    window.alert(
      error.response?.data?.detail ||
      Object.values(error.response?.data || {})
        .flat()
        .join(' ') ||
      'No se pudo eliminar la consulta.'
    )
  }
}
  return (
    <section className="consultas-page">
      <div className="consultas-header">
        <div>
          <h1>Consultas</h1>
          <p>Registro de consultas clínicas e historial médico</p>
        </div>

        <button className="btn-nueva-consulta" onClick={abrirNuevaConsulta}>
          <FaPlus />
          Nueva Consulta
        </button>
      </div>

      <div className="consultas-content">
        <div className="consultas-main-card">
          <div className="consultas-toolbar">
            <div className="consultas-search">
              <FaMagnifyingGlass />

              <input
                type="text"
                placeholder="Buscar por mascota, dueño, fecha, diagnóstico o tratamiento"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <span className="consultas-total">
              {consultasFiltradas.length} consultas
            </span>
          </div>

          <div className="consultas-table-wrapper">
            <table className="consultas-table">
              <thead>
  <tr>
    <th>Consulta</th>
    <th>Mascota</th>
    <th>Dueño</th>
    <th>Servicio</th>
    <th>Estado</th>
    <th>Precio</th>
    <th>Diagnóstico</th>
    <th>Tratamiento</th>
    <th>Acciones</th>
  </tr>
</thead>

              <tbody>
                {consultasFiltradas.map((consulta) => {
                  const mascota = obtenerMascota(consulta.mascotaId)
                  const cliente = obtenerClienteDeMascota(consulta.mascotaId)
                  const servicio = obtenerServicio(consulta.servicioId)

                  return (
                    <tr key={consulta.id}>
                      <td>
                        <div className="consulta-fecha">
                          <div className="consulta-icono">
                            <FaStethoscope />
                          </div>

                          <div>
                            <strong>{consulta.fecha}</strong>
                            <small>
                              {consulta.peso} kg - {consulta.temperatura} °C
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>{mascota?.nombre}</td>

                     <td>
  {cliente?.nombre} {cliente?.apellido}
</td>

<td>
  {servicio?.descripcion || 'Sin servicio'}
</td>

<td>
  {consulta.estado}
</td>

<td>
  {consulta.precio !== null &&
  consulta.precio !== undefined
    ? `$${Number(consulta.precio).toLocaleString('es-AR')}`
    : 'Sin precio'}
</td>

<td>{consulta.diagnostico}</td>

<td>{consulta.tratamiento}</td>

                      <td>
                        <div className="acciones">
                          <button
                            className="btn-accion ver"
                            onClick={() => abrirVerConsulta(consulta)}
                            title="Ver consulta"
                          >
                            <FaEye />
                          </button>

                          <button
                            className="btn-accion editar"
                            onClick={() => abrirEditarConsulta(consulta)}
                            title="Editar consulta"
                          >
                            <FaPen />
                          </button>

                          <button
                            className="btn-accion eliminar"
                            onClick={() => eliminarConsulta(consulta.id)}
                            title="Eliminar consulta"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {consultasFiltradas.length === 0 && (
                  <tr>
                    <td colSpan="9" className="sin-resultados">
                      No se encontraron consultas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {(mostrarFormulario || consultaSeleccionada) && (
          <aside className="consultas-side-card">
            <button className="btn-cerrar" onClick={cerrarPanel}>
              <FaXmark />
            </button>

            {mostrarFormulario ? (
              <>
                <h2>{modoEdicion ? 'Editar Consulta' : 'Nueva Consulta'}</h2>

                <p>
                  {modoEdicion
                    ? 'Modificá los datos de la consulta seleccionada'
                    : 'Cargá una nueva consulta clínica'}
                </p>

                <form className="consulta-form" onSubmit={guardarConsulta}>
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

{formulario.mascotaId && turnosDisponibles.length === 0 && (
  <small>
    La mascota no tiene turnos pendientes disponibles.
  </small>
)}
                  <label>Servicio</label>

<select
  name="servicioId"
  value={formulario.servicioId}
  onChange={manejarCambio}
>
  <option value="">Seleccionar servicio</option>

  {servicios.map((servicio) => (
    <option key={servicio.id} value={servicio.id}>
      {servicio.descripcion} - ${servicio.precio}
    </option>
  ))}
</select>
                  <label>Fecha</label>
                  <input
                    type="date"
                    name="fecha"
                    value={formulario.fecha}
                    onChange={manejarCambio}
                  />

                  <label>Peso</label>
                  <input
                    type="number"
                    name="peso"
                    value={formulario.peso}
                    onChange={manejarCambio}
                    step="0.1"
                  />

                  <label>Temperatura</label>
                  <input
                    type="number"
                    name="temperatura"
                    value={formulario.temperatura}
                    onChange={manejarCambio}
                    step="0.1"
                  />

                  <label>Diagnóstico</label>
                  <textarea
                    name="diagnostico"
                    value={formulario.diagnostico}
                    onChange={manejarCambio}
                  />

                  <label>Tratamiento</label>
                  <textarea
                    name="tratamiento"
                    value={formulario.tratamiento}
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
  <option value="Realizada">Realizada</option>
  <option value="Cancelada">Cancelada</option>
</select>
<label>Próximo Control</label>

<input
  type="date"
  name="proximoControl"
  value={formulario.proximoControl}
  onChange={manejarCambio}
/>

                  <button type="submit" className="btn-guardar">
                    <FaFloppyDisk />
                    Guardar Consulta
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2>Detalle de Consulta</h2>
                <p>Información clínica registrada</p>

                <div className="consulta-detalle">
  <div>
    <span>Fecha</span>
    <strong>{consultaSeleccionada.fecha}</strong>
  </div>

  <div>
    <span>Mascota</span>
    <strong>
      {obtenerMascota(consultaSeleccionada.mascotaId)?.nombre}
    </strong>
  </div>

  <div>
    <span>Dueño</span>
    <strong>
      {
        obtenerClienteDeMascota(consultaSeleccionada.mascotaId)
          ?.nombre
      }{' '}
      {
        obtenerClienteDeMascota(consultaSeleccionada.mascotaId)
          ?.apellido
      }
    </strong>
  </div>

  <div>
    <span>Turno asociado</span>
    <strong>
      {turnoDetalle
        ? `${turnoDetalle.fecha} - ${turnoDetalle.hora?.slice(
            0,
            5
          )} - ${turnoDetalle.motivo_consulta}`
        : 'Sin turno asociado'}
    </strong>
  </div>

  <div>
    <span>Servicio</span>
    <strong>
      {servicioDetalle?.descripcion || 'Sin servicio'}
    </strong>
  </div>

  <div>
    <span>Estado</span>
    <strong>{consultaSeleccionada.estado}</strong>
  </div>

  <div>
    <span>Precio</span>
    <strong>
      {consultaSeleccionada.precio !== null &&
      consultaSeleccionada.precio !== undefined
        ? `$${Number(
            consultaSeleccionada.precio
          ).toLocaleString('es-AR')}`
        : 'Sin precio'}
    </strong>
  </div>

  <div>
    <span>Próximo control</span>
    <strong>
      {consultaSeleccionada.proximoControl ||
        'Sin próximo control'}
    </strong>
  </div>

  <div>
    <span>Usuario</span>
    <strong>
      {consultaSeleccionada.usuarioNombre ||
        (consultaSeleccionada.usuarioId
          ? `Usuario #${consultaSeleccionada.usuarioId}`
          : 'Sin usuario')}
    </strong>
  </div>

  <div>
    <span>Peso</span>
    <strong>
      {consultaSeleccionada.peso !== ''
        ? `${consultaSeleccionada.peso} kg`
        : 'Sin registrar'}
    </strong>
  </div>

  <div>
    <span>Temperatura</span>
    <strong>
      {consultaSeleccionada.temperatura !== ''
        ? `${consultaSeleccionada.temperatura} °C`
        : 'Sin registrar'}
    </strong>
  </div>

  <div>
    <span>Diagnóstico</span>
    <strong>{consultaSeleccionada.diagnostico}</strong>
  </div>

  <div>
    <span>Tratamiento</span>
    <strong>{consultaSeleccionada.tratamiento}</strong>
  </div>

  <div>
    <span>Observaciones</span>
    <strong>
      {consultaSeleccionada.observaciones ||
        'Sin observaciones'}
    </strong>
  </div>
</div>
                <div className="historial-clinico">
                  <h3>Historial clínico</h3>

                  {historialMascota.map((consulta) => (
                    <div className="historial-item" key={consulta.id}>
                      <strong>{consulta.fecha}</strong>
                      <span>{consulta.diagnostico}</span>
                    </div>
                  ))}
                </div>

                <button
                  className="btn-editar-detalle"
                  onClick={() => abrirEditarConsulta(consultaSeleccionada)}
                >
                  <FaPen />
                  Editar Consulta
                </button>
              </>
            )}
          </aside>
        )}
      </div>
    </section>
  )
}

export default Consultas