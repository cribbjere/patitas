import { useState } from 'react'
import {
  FaMagnifyingGlass,
  FaPlus,
  FaEye,
  FaPen,
  FaTrash,
  FaFloppyDisk,
  FaXmark,
  FaCalendarDays,
} from 'react-icons/fa6'

import {
  clientes as clientesIniciales,
  mascotas as mascotasIniciales,
  turnos as turnosIniciales,
} from '../data/mockData'

import './Turnos.css'

const turnoVacio = {
  mascotaId: '',
  fecha: '',
  horaInicio: '',
  horaFin: '',
  motivo: '',
  estado: 'Programado',
  observaciones: '',
}

function obtenerFecha(fechaCompleta) {
  if (!fechaCompleta) return ''
  return fechaCompleta.split('T')[0]
}

function obtenerHora(fechaCompleta) {
  if (!fechaCompleta) return ''
  return fechaCompleta.split('T')[1]?.slice(0, 5)
}

function Turnos() {
  const [clientes] = useState(clientesIniciales)
  const [mascotas] = useState(mascotasIniciales)
  const [turnos, setTurnos] = useState(turnosIniciales)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [formulario, setFormulario] = useState(turnoVacio)

  const obtenerMascota = (mascotaId) => {
    return mascotas.find((mascota) => mascota.id === mascotaId)
  }

  const obtenerClienteDeMascota = (mascotaId) => {
    const mascota = obtenerMascota(mascotaId)

    if (!mascota) return null

    return clientes.find((cliente) => cliente.id === mascota.clienteId)
  }

  const turnosFiltrados = turnos.filter((turno) => {
    const mascota = obtenerMascota(turno.mascotaId)
    const cliente = obtenerClienteDeMascota(turno.mascotaId)

    const texto = `
      ${turno.motivo}
      ${turno.estado}
      ${turno.fechaInicio}
      ${mascota?.nombre}
      ${mascota?.especie}
      ${cliente?.nombre}
      ${cliente?.apellido}
    `.toLowerCase()

    return texto.includes(busqueda.toLowerCase())
  })

  const abrirNuevoTurno = () => {
    setFormulario(turnoVacio)
    setTurnoSeleccionado(null)
    setModoEdicion(false)
    setMostrarFormulario(true)
  }

  const abrirVerTurno = (turno) => {
    setTurnoSeleccionado(turno)
    setMostrarFormulario(false)
    setModoEdicion(false)
  }

  const abrirEditarTurno = (turno) => {
    setFormulario({
      mascotaId: turno.mascotaId,
      fecha: obtenerFecha(turno.fechaInicio),
      horaInicio: obtenerHora(turno.fechaInicio),
      horaFin: obtenerHora(turno.fechaFin),
      motivo: turno.motivo,
      estado: turno.estado || 'Programado',
      observaciones: turno.observaciones || '',
    })

    setTurnoSeleccionado(turno)
    setModoEdicion(true)
    setMostrarFormulario(true)
  }

  const cerrarPanel = () => {
    setFormulario(turnoVacio)
    setTurnoSeleccionado(null)
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

  const guardarTurno = (e) => {
    e.preventDefault()

    if (
      !formulario.mascotaId ||
      !formulario.fecha ||
      !formulario.horaInicio ||
      !formulario.horaFin ||
      !formulario.motivo
    ) {
      alert('Completá mascota, fecha, horario y motivo.')
      return
    }

    const fechaInicio = `${formulario.fecha}T${formulario.horaInicio}:00`
    const fechaFin = `${formulario.fecha}T${formulario.horaFin}:00`

    const existeTurnoSuperpuesto = turnos.some((turno) => {
      if (modoEdicion && turno.id === turnoSeleccionado.id) {
        return false
      }

      const mismaMascota = turno.mascotaId === formulario.mascotaId
      const mismoDia = obtenerFecha(turno.fechaInicio) === formulario.fecha

      const inicioExistente = obtenerHora(turno.fechaInicio)
      const finExistente = obtenerHora(turno.fechaFin)

      const seSuperpone =
        formulario.horaInicio < finExistente &&
        formulario.horaFin > inicioExistente

      return mismaMascota && mismoDia && seSuperpone
    })

    if (existeTurnoSuperpuesto) {
      alert('Esta mascota ya tiene un turno en ese horario.')
      return
    }

    if (modoEdicion) {
      const turnosActualizados = turnos.map((turno) => {
        if (turno.id === turnoSeleccionado.id) {
          return {
            id: turnoSeleccionado.id,
            mascotaId: formulario.mascotaId,
            motivo: formulario.motivo,
            fechaInicio,
            fechaFin,
            estado: formulario.estado,
            observaciones: formulario.observaciones,
          }
        }

        return turno
      })

      setTurnos(turnosActualizados)
    } else {
      const nuevoTurno = {
        id: Date.now(),
        mascotaId: formulario.mascotaId,
        motivo: formulario.motivo,
        fechaInicio,
        fechaFin,
        estado: formulario.estado,
        observaciones: formulario.observaciones,
      }

      setTurnos([...turnos, nuevoTurno])
    }

    cerrarPanel()
  }

  const cancelarTurno = (id) => {
    const confirmar = window.confirm('¿Seguro que querés cancelar este turno?')

    if (!confirmar) return

    const turnosActualizados = turnos.map((turno) => {
      if (turno.id === id) {
        return {
          ...turno,
          estado: 'Cancelado',
        }
      }

      return turno
    })

    setTurnos(turnosActualizados)

    if (turnoSeleccionado?.id === id) {
      setTurnoSeleccionado({
        ...turnoSeleccionado,
        estado: 'Cancelado',
      })
    }
  }

  const eliminarTurno = (id) => {
    const confirmar = window.confirm('¿Seguro que querés eliminar este turno?')

    if (!confirmar) return

    const turnosActualizados = turnos.filter((turno) => turno.id !== id)

    setTurnos(turnosActualizados)

    if (turnoSeleccionado?.id === id) {
      cerrarPanel()
    }
  }

  return (
    <section className="turnos-page">
      <div className="turnos-header">
        <div>
          <h1>Turnos</h1>
          <p>Agenda, asignación y control de turnos</p>
        </div>

        <button className="btn-nuevo-turno" onClick={abrirNuevoTurno}>
          <FaPlus />
          Nuevo Turno
        </button>
      </div>

      <div className="turnos-content">
        <div className="turnos-main-card">
          <div className="turnos-toolbar">
            <div className="turnos-search">
              <FaMagnifyingGlass />

              <input
                type="text"
                placeholder="Buscar por mascota, dueño, fecha, motivo o estado"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <span className="turnos-total">
              {turnosFiltrados.length} turnos
            </span>
          </div>

          <div className="turnos-table-wrapper">
            <table className="turnos-table">
              <thead>
                <tr>
                  <th>Turno</th>
                  <th>Mascota</th>
                  <th>Dueño</th>
                  <th>Motivo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {turnosFiltrados.map((turno) => {
                  const mascota = obtenerMascota(turno.mascotaId)
                  const cliente = obtenerClienteDeMascota(turno.mascotaId)

                  return (
                    <tr key={turno.id}>
                      <td>
                        <div className="turno-fecha">
                          <div className="turno-icono">
                            <FaCalendarDays />
                          </div>

                          <div>
                            <strong>{obtenerFecha(turno.fechaInicio)}</strong>
                            <small>
                              {obtenerHora(turno.fechaInicio)} -{' '}
                              {obtenerHora(turno.fechaFin)}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>{mascota?.nombre}</td>

                      <td>
                        {cliente?.nombre} {cliente?.apellido}
                      </td>

                      <td>{turno.motivo}</td>

                      <td>
                        <span
                          className={
                            turno.estado === 'Cancelado'
                              ? 'estado-turno cancelado'
                              : turno.estado === 'Realizado'
                                ? 'estado-turno realizado'
                                : 'estado-turno programado'
                          }
                        >
                          {turno.estado || 'Programado'}
                        </span>
                      </td>

                      <td>
                        <div className="acciones">
                          <button
                            className="btn-accion ver"
                            onClick={() => abrirVerTurno(turno)}
                            title="Ver turno"
                          >
                            <FaEye />
                          </button>

                          <button
                            className="btn-accion editar"
                            onClick={() => abrirEditarTurno(turno)}
                            title="Reprogramar / editar turno"
                          >
                            <FaPen />
                          </button>

                          <button
                            className="btn-accion cancelar"
                            onClick={() => cancelarTurno(turno.id)}
                            title="Cancelar turno"
                          >
                            <FaXmark />
                          </button>

                          <button
                            className="btn-accion eliminar"
                            onClick={() => eliminarTurno(turno.id)}
                            title="Eliminar turno"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {turnosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan="6" className="sin-resultados">
                      No se encontraron turnos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {(mostrarFormulario || turnoSeleccionado) && (
          <aside className="turnos-side-card">
            <button className="btn-cerrar" onClick={cerrarPanel}>
              <FaXmark />
            </button>

            {mostrarFormulario ? (
              <>
                <h2>{modoEdicion ? 'Editar Turno' : 'Nuevo Turno'}</h2>

                <p>
                  {modoEdicion
                    ? 'Reprogramá o modificá el turno seleccionado'
                    : 'Cargá un nuevo turno en la agenda'}
                </p>

                <form className="turno-form" onSubmit={guardarTurno}>
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

                  <label>Fecha</label>
                  <input
                    type="date"
                    name="fecha"
                    value={formulario.fecha}
                    onChange={manejarCambio}
                  />

                  <label>Hora inicio</label>
                  <input
                    type="time"
                    name="horaInicio"
                    value={formulario.horaInicio}
                    onChange={manejarCambio}
                  />

                  <label>Hora fin</label>
                  <input
                    type="time"
                    name="horaFin"
                    value={formulario.horaFin}
                    onChange={manejarCambio}
                  />

                  <label>Motivo</label>
                  <select
                    name="motivo"
                    value={formulario.motivo}
                    onChange={manejarCambio}
                  >
                    <option value="">Seleccionar motivo</option>
                    <option value="Consulta">Consulta</option>
                    <option value="Vacunación">Vacunación</option>
                    <option value="Control">Control</option>
                    <option value="Higiene">Higiene</option>
                    <option value="Cirugía">Cirugía</option>
                    <option value="Otro">Otro</option>
                  </select>

                  <label>Estado</label>
                  <select
                    name="estado"
                    value={formulario.estado}
                    onChange={manejarCambio}
                  >
                    <option value="Programado">Programado</option>
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
                    Guardar Turno
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2>Detalle del Turno</h2>
                <p>Información registrada en la agenda</p>

                <div className="turno-detalle">
                  <div>
                    <span>Fecha</span>
                    <strong>{obtenerFecha(turnoSeleccionado.fechaInicio)}</strong>
                  </div>

                  <div>
                    <span>Horario</span>
                    <strong>
                      {obtenerHora(turnoSeleccionado.fechaInicio)} -{' '}
                      {obtenerHora(turnoSeleccionado.fechaFin)}
                    </strong>
                  </div>

                  <div>
                    <span>Mascota</span>
                    <strong>
                      {obtenerMascota(turnoSeleccionado.mascotaId)?.nombre}
                    </strong>
                  </div>

                  <div>
                    <span>Dueño</span>
                    <strong>
                      {
                        obtenerClienteDeMascota(turnoSeleccionado.mascotaId)
                          ?.nombre
                      }{' '}
                      {
                        obtenerClienteDeMascota(turnoSeleccionado.mascotaId)
                          ?.apellido
                      }
                    </strong>
                  </div>

                  <div>
                    <span>Motivo</span>
                    <strong>{turnoSeleccionado.motivo}</strong>
                  </div>

                  <div>
                    <span>Estado</span>
                    <strong>{turnoSeleccionado.estado || 'Programado'}</strong>
                  </div>

                  <div>
                    <span>Observaciones</span>
                    <strong>
                      {turnoSeleccionado.observaciones || 'Sin observaciones'}
                    </strong>
                  </div>
                </div>

                <button
                  className="btn-editar-detalle"
                  onClick={() => abrirEditarTurno(turnoSeleccionado)}
                >
                  <FaPen />
                  Reprogramar Turno
                </button>
              </>
            )}
          </aside>
        )}
      </div>
    </section>
  )
}

export default Turnos