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
  obtenerCirugias,
  crearCirugia,
  editarCirugia,
  eliminarCirugia as eliminarCirugiaAPI,
} from '../services/cirugiasService'

import './Cirugias.css'

const cirugiaVacia = {
  mascotaId: '',
  servicioId: '',
  turnoId: '',
  fecha: '',
  diagnosticoPrevio: '',
  procedimiento: '',
  observaciones: '',
  estado: 'Programada',
}

const formatearPrecio = (precio) => {
  if (precio === null || precio === undefined || precio === '') {
    return 'Sin precio'
  }

  return `$${Number(precio).toLocaleString('es-AR')}`
}

function Cirugias() {
  const [clientes, setClientes] = useState([])
  const [mascotas, setMascotas] = useState([])
  const [servicios, setServicios] = useState([])
  const [turnos, setTurnos] = useState([])
  const [cirugias, setCirugias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [cirugiaSeleccionada, setCirugiaSeleccionada] = useState(null)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [formulario, setFormulario] = useState(cirugiaVacia)

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
      setCargando(true)

      const [
        clientesAPI,
        mascotasAPI,
        serviciosAPI,
        turnosAPI,
        cirugiasAPI,
      ] = await Promise.all([
        obtenerClientes(),
        obtenerMascotas(),
        obtenerServicios(),
        obtenerTurnos(),
        obtenerCirugias(),
      ])

      setClientes(clientesAPI)
      setMascotas(mascotasAPI)
      setServicios(serviciosAPI)
      setTurnos(turnosAPI)

      const cirugiasConvertidas = cirugiasAPI.map((cirugia) => ({
        id: cirugia.id,
        mascotaId: cirugia.mascota,
        servicioId: cirugia.servicio,
        turnoId: cirugia.turno,
        fecha: cirugia.fecha,
        diagnosticoPrevio: cirugia.diagnostico_previo || '',
        procedimiento: cirugia.procedimiento,
        observaciones: cirugia.observaciones || '',
        estado:
          cirugia.estado === 'realizada'
            ? 'Realizada'
            : cirugia.estado === 'cancelada'
              ? 'Cancelada'
              : 'Programada',
        precio: cirugia.precio,
        usuarioId: cirugia.usuario,
        usuarioNombre: cirugia.usuario_nombre || '',
      }))

      setCirugias(cirugiasConvertidas)
    } catch (error) {
      console.error('Error al cargar las cirugías:', error)

      window.alert(
        error.response?.data?.detail ||
          'No se pudieron cargar los datos de cirugías.'
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

  const cirugiasFiltradas = cirugias.filter((cirugia) => {
    const mascota = obtenerMascota(cirugia.mascotaId)
    const cliente = obtenerClienteDeMascota(cirugia.mascotaId)
    const servicio = obtenerServicio(cirugia.servicioId)

    const texto = `
      ${cirugia.fecha}
      ${cirugia.estado}
      ${cirugia.diagnosticoPrevio}
      ${cirugia.procedimiento}
      ${cirugia.observaciones}
      ${cirugia.usuarioNombre}
      ${servicio?.descripcion}
      ${mascota?.nombre}
      ${mascota?.especie}
      ${cliente?.nombre}
      ${cliente?.apellido}
    `.toLowerCase()

    return texto.includes(busqueda.toLowerCase())
  })

  const servicioDetalle = cirugiaSeleccionada
    ? obtenerServicio(cirugiaSeleccionada.servicioId)
    : null

  const turnoDetalle = cirugiaSeleccionada
    ? obtenerTurno(cirugiaSeleccionada.turnoId)
    : null

  const abrirNuevaCirugia = () => {
    setFormulario(cirugiaVacia)
    setCirugiaSeleccionada(null)
    setModoEdicion(false)
    setMostrarFormulario(true)
  }

  const abrirVerCirugia = (cirugia) => {
    setCirugiaSeleccionada(cirugia)
    setMostrarFormulario(false)
    setModoEdicion(false)
  }

  const abrirEditarCirugia = (cirugia) => {
    setFormulario({
      mascotaId: cirugia.mascotaId,
      servicioId: cirugia.servicioId,
      turnoId: cirugia.turnoId || '',
      fecha: cirugia.fecha,
      diagnosticoPrevio: cirugia.diagnosticoPrevio,
      procedimiento: cirugia.procedimiento,
      observaciones: cirugia.observaciones,
      estado: cirugia.estado,
    })

    setCirugiaSeleccionada(cirugia)
    setModoEdicion(true)
    setMostrarFormulario(true)
  }

  const cerrarPanel = () => {
    setFormulario(cirugiaVacia)
    setCirugiaSeleccionada(null)
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

  const guardarCirugia = async (e) => {
    e.preventDefault()

    if (
      !formulario.mascotaId ||
      !formulario.servicioId ||
      !formulario.fecha ||
      !formulario.procedimiento.trim()
    ) {
      window.alert(
        'Completá mascota, servicio, fecha y procedimiento.'
      )
      return
    }

    const datos = {
      mascota: formulario.mascotaId,
      servicio: formulario.servicioId,
      turno: formulario.turnoId || null,
      fecha: formulario.fecha,
      diagnostico_previo: formulario.diagnosticoPrevio || null,
      procedimiento: formulario.procedimiento,
      observaciones: formulario.observaciones || null,
      estado: formulario.estado.toLowerCase(),
    }

    try {
      if (modoEdicion) {
        await editarCirugia(cirugiaSeleccionada.id, datos)
      } else {
        await crearCirugia(datos)
      }

      await cargarDatos()
      cerrarPanel()
    } catch (error) {
      console.error('Error al guardar la cirugía:', error)

      window.alert(
        error.response?.data?.detail ||
          Object.values(error.response?.data || {})
            .flat()
            .join(' ') ||
          'No se pudo guardar la cirugía.'
      )
    }
  }

  const eliminarCirugia = async (id) => {
    const confirmar = window.confirm(
      '¿Seguro que querés eliminar esta cirugía?'
    )

    if (!confirmar) return

    try {
      await eliminarCirugiaAPI(id)

      setCirugias((cirugiasActuales) =>
        cirugiasActuales.filter((cirugia) => cirugia.id !== id)
      )

      if (cirugiaSeleccionada?.id === id) {
        cerrarPanel()
      }
    } catch (error) {
      console.error('Error al eliminar la cirugía:', error)

      window.alert(
        error.response?.data?.detail ||
          Object.values(error.response?.data || {})
            .flat()
            .join(' ') ||
          'No se pudo eliminar la cirugía.'
      )
    }
  }

  return (
    <section className="cirugias-page">
      <div className="cirugias-header">
        <div>
          <h1>Cirugías</h1>
          <p>Programación y registro de procedimientos quirúrgicos</p>
        </div>

        <button className="btn-nueva-cirugia" onClick={abrirNuevaCirugia}>
          <FaPlus />
          Nueva Cirugía
        </button>
      </div>

      <div className="cirugias-content">
        <div className="cirugias-main-card">
          <div className="cirugias-toolbar">
            <div className="cirugias-search">
              <FaMagnifyingGlass />

              <input
                type="text"
                placeholder="Buscar por mascota, dueño, servicio, fecha, estado o procedimiento"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <span className="cirugias-total">
              {cirugiasFiltradas.length} cirugías
            </span>
          </div>

          <div className="cirugias-table-wrapper">
            <table className="cirugias-table">
              <thead>
                <tr>
                  <th>Cirugía</th>
                  <th>Mascota</th>
                  <th>Dueño</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Precio</th>
                  <th>Turno</th>
                  <th>Usuario</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {cirugiasFiltradas.map((cirugia) => {
                  const mascota = obtenerMascota(cirugia.mascotaId)
                  const cliente = obtenerClienteDeMascota(cirugia.mascotaId)
                  const servicio = obtenerServicio(cirugia.servicioId)
                  const turno = obtenerTurno(cirugia.turnoId)

                  return (
                    <tr key={cirugia.id}>
                      <td>
                        <div className="cirugia-nombre">
                          <div className="cirugia-icono">
                            <FaStethoscope />
                          </div>

                          <div>
                            <strong>
                              {servicio?.descripcion || 'Sin servicio'}
                            </strong>
                            <small>
                              {cirugia.procedimiento || 'Sin procedimiento'}
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

                      <td>{cirugia.fecha}</td>

                      <td>
                        <span
                          className={`estado-cirugia ${cirugia.estado.toLowerCase()}`}
                        >
                          {cirugia.estado}
                        </span>
                      </td>

                      <td>{formatearPrecio(cirugia.precio)}</td>

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
                        {cirugia.usuarioNombre ||
                          (cirugia.usuarioId
                            ? `Usuario #${cirugia.usuarioId}`
                            : 'Sin usuario')}
                      </td>

                      <td>
                        <div className="acciones">
                          <button
                            className="btn-accion ver"
                            onClick={() => abrirVerCirugia(cirugia)}
                            title="Ver cirugía"
                          >
                            <FaEye />
                          </button>

                          <button
                            className="btn-accion editar"
                            onClick={() => abrirEditarCirugia(cirugia)}
                            title="Editar cirugía"
                          >
                            <FaPen />
                          </button>

                          <button
                            className="btn-accion eliminar"
                            onClick={() => eliminarCirugia(cirugia.id)}
                            title="Eliminar cirugía"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {!cargando && cirugiasFiltradas.length === 0 && (
                  <tr>
                    <td colSpan="9" className="sin-resultados">
                      No se encontraron cirugías.
                    </td>
                  </tr>
                )}

                {cargando && (
                  <tr>
                    <td colSpan="9" className="sin-resultados">
                      Cargando cirugías...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {(mostrarFormulario || cirugiaSeleccionada) && (
          <aside className="cirugias-side-card">
            <button className="btn-cerrar" onClick={cerrarPanel}>
              <FaXmark />
            </button>

            {mostrarFormulario ? (
              <>
                <h2>{modoEdicion ? 'Editar Cirugía' : 'Nueva Cirugía'}</h2>

                <p>
                  {modoEdicion
                    ? 'Modificá los datos de la cirugía seleccionada'
                    : 'Registrá un procedimiento quirúrgico'}
                </p>

                <form className="cirugia-form" onSubmit={guardarCirugia}>
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
                      <small className="sin-turnos">
                        La mascota no tiene turnos pendientes disponibles.
                      </small>
                    )}

                  <label>Cirugía / Servicio</label>
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

                  <label>Diagnóstico previo</label>
                  <textarea
                    name="diagnosticoPrevio"
                    value={formulario.diagnosticoPrevio}
                    onChange={manejarCambio}
                  />

                  <label>Procedimiento</label>
                  <textarea
                    name="procedimiento"
                    value={formulario.procedimiento}
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
                    <option value="Programada">Programada</option>
                    <option value="Realizada">Realizada</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>

                  <button type="submit" className="btn-guardar">
                    <FaFloppyDisk />
                    Guardar Cirugía
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2>Detalle de Cirugía</h2>
                <p>Información del procedimiento registrado</p>

                <div className="cirugia-detalle">
                  <div>
                    <span>Cirugía / Servicio</span>
                    <strong>
                      {servicioDetalle?.descripcion || 'Sin servicio'}
                    </strong>
                  </div>

                  <div>
                    <span>Mascota</span>
                    <strong>
                      {obtenerMascota(cirugiaSeleccionada.mascotaId)?.nombre ||
                        'Sin mascota'}
                    </strong>
                  </div>

                  <div>
                    <span>Dueño</span>
                    <strong>
                      {
                        obtenerClienteDeMascota(cirugiaSeleccionada.mascotaId)
                          ?.nombre
                      }{' '}
                      {
                        obtenerClienteDeMascota(cirugiaSeleccionada.mascotaId)
                          ?.apellido
                      }
                    </strong>
                  </div>

                  <div>
                    <span>Fecha</span>
                    <strong>{cirugiaSeleccionada.fecha}</strong>
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
                    <span>Estado</span>
                    <strong>{cirugiaSeleccionada.estado}</strong>
                  </div>

                  <div>
                    <span>Precio</span>
                    <strong>{formatearPrecio(cirugiaSeleccionada.precio)}</strong>
                  </div>

                  <div>
                    <span>Usuario</span>
                    <strong>
                      {cirugiaSeleccionada.usuarioNombre ||
                        (cirugiaSeleccionada.usuarioId
                          ? `Usuario #${cirugiaSeleccionada.usuarioId}`
                          : 'Sin usuario')}
                    </strong>
                  </div>

                  <div>
                    <span>Diagnóstico previo</span>
                    <strong>
                      {cirugiaSeleccionada.diagnosticoPrevio ||
                        'Sin diagnóstico previo'}
                    </strong>
                  </div>

                  <div>
                    <span>Procedimiento</span>
                    <strong>{cirugiaSeleccionada.procedimiento}</strong>
                  </div>

                  <div>
                    <span>Observaciones</span>
                    <strong>
                      {cirugiaSeleccionada.observaciones ||
                        'Sin observaciones'}
                    </strong>
                  </div>
                </div>

                <button
                  className="btn-editar-detalle"
                  onClick={() => abrirEditarCirugia(cirugiaSeleccionada)}
                >
                  <FaPen />
                  Editar Cirugía
                </button>
              </>
            )}
          </aside>
        )}
      </div>
    </section>
  )
}

export default Cirugias