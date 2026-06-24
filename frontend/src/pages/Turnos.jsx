import { crearAlertaSistema } from '../utils/alertasSistema'
import { useEffect, useState } from 'react'
import {
  FaMagnifyingGlass,
  FaPlus,
  FaEye,
  FaPen,
  FaTrash,
  FaFloppyDisk,
  FaXmark,
  FaCalendarDays,
  FaPhone,
  FaWhatsapp,
  FaTriangleExclamation,
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
  const [alertaSeguimiento, setAlertaSeguimiento] = useState(null)

  const obtenerMascota = (mascotaId) => {
    return mascotas.find((mascota) => mascota.id === mascotaId)
  }

  const obtenerClienteDeMascota = (mascotaId) => {
    const mascota = obtenerMascota(mascotaId)

    if (!mascota) return null

    return clientes.find((cliente) => cliente.id === mascota.clienteId)
  }

  const crearAlertaSeguimiento = (turno, tipo) => {
    const mascota = obtenerMascota(turno.mascotaId)
    const cliente = obtenerClienteDeMascota(turno.mascotaId)

    let mensaje = ''

    if (tipo === 'Cancelado') {
      mensaje =
        'El turno fue cancelado. Se recomienda contactar al cliente y ofrecer otro horario.'
    }

    if (tipo === 'Ausente') {
      mensaje =
        'El cliente no asistió al turno. Se recomienda llamar o enviar un mensaje para reprogramar.'
    }

    if (tipo === 'Vacunación pendiente') {
      mensaje =
        'La vacunación no fue realizada. Se recomienda contactar al cliente para coordinar una nueva fecha.'
    }

    setAlertaSeguimiento({
      turno,
      mascota,
      cliente,
      tipo,
      mensaje,
    })
    crearAlertaSistema({
  titulo: tipo,
  mensaje,
  origen: 'Turnos',
  cliente: `${cliente?.nombre || ''} ${cliente?.apellido || ''}`.trim(),
  telefono: cliente?.telefono || '',
  mascota: mascota?.nombre || '',
})
  }

  const cerrarAlertaSeguimiento = () => {
    setAlertaSeguimiento(null)
  }

  const armarTelefono = (telefono) => {
    if (!telefono) return ''

    return telefono.replace(/\D/g, '')
  }

  const llamarCliente = (cliente) => {
    const telefono = armarTelefono(cliente?.telefono)

    if (!telefono) {
      alert('El cliente no tiene teléfono cargado.')
      return
    }

    window.location.href = `tel:${telefono}`
  }

  const enviarWhatsapp = (cliente, mascota, motivo) => {
    const telefono = armarTelefono(cliente?.telefono)

    if (!telefono) {
      alert('El cliente no tiene teléfono cargado.')
      return
    }

    const mensaje = `Hola ${cliente.nombre}, te contactamos de Veterinaria Patitas por el turno de ${mascota?.nombre}. Queríamos coordinar una nueva fecha para ${motivo}.`

    window.open(
      `https://wa.me/54${telefono}?text=${encodeURIComponent(mensaje)}`,
      '_blank'
    )
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

  const reprogramarDesdeAlerta = () => {
    if (!alertaSeguimiento?.turno) return

    abrirEditarTurno(alertaSeguimiento.turno)
    cerrarAlertaSeguimiento()
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

    if (formulario.horaFin <= formulario.horaInicio) {
      alert('La hora de fin debe ser posterior a la hora de inicio.')
      return
    }

    const fechaInicio = `${formulario.fecha}T${formulario.horaInicio}:00`
    const fechaFin = `${formulario.fecha}T${formulario.horaFin}:00`

    const existeTurnoSuperpuesto = turnos.some((turno) => {
      if (modoEdicion && turno.id === turnoSeleccionado.id) {
        return false
      }

      if (turno.estado === 'Cancelado' || turno.estado === 'Ausente') {
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

      const turnoActualizado = turnosActualizados.find(
        (turno) => turno.id === turnoSeleccionado.id
      )

      if (formulario.estado === 'Cancelado') {
        crearAlertaSeguimiento(turnoActualizado, 'Cancelado')
      }

      if (formulario.estado === 'Ausente') {
        crearAlertaSeguimiento(turnoActualizado, 'Ausente')
      }

      if (
        formulario.estado !== 'Realizado' &&
        formulario.motivo === 'Vacunación'
      ) {
        crearAlertaSeguimiento(turnoActualizado, 'Vacunación pendiente')
      }
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

  const cambiarEstadoTurno = (id, nuevoEstado) => {
    const turnoEncontrado = turnos.find((turno) => turno.id === id)

    if (!turnoEncontrado) return

    if (nuevoEstado === 'Cancelado') {
      const confirmar = window.confirm('¿Seguro que querés cancelar este turno?')

      if (!confirmar) return
    }

    if (nuevoEstado === 'Ausente') {
      const confirmar = window.confirm(
        '¿Seguro que querés marcar este turno como ausente?'
      )

      if (!confirmar) return
    }

    const turnosActualizados = turnos.map((turno) => {
      if (turno.id === id) {
        return {
          ...turno,
          estado: nuevoEstado,
        }
      }

      return turno
    })

    setTurnos(turnosActualizados)

    const turnoActualizado = turnosActualizados.find((turno) => turno.id === id)

    if (turnoSeleccionado?.id === id) {
      setTurnoSeleccionado(turnoActualizado)
    }

    if (nuevoEstado === 'Cancelado') {
      crearAlertaSeguimiento(turnoActualizado, 'Cancelado')
    }

    if (nuevoEstado === 'Ausente') {
      crearAlertaSeguimiento(turnoActualizado, 'Ausente')
    }

    if (
      nuevoEstado !== 'Realizado' &&
      turnoActualizado.motivo === 'Vacunación'
    ) {
      crearAlertaSeguimiento(turnoActualizado, 'Vacunación pendiente')
    }
  }

  const cancelarTurno = (id) => {
    cambiarEstadoTurno(id, 'Cancelado')
  }

  const marcarAusente = (id) => {
    cambiarEstadoTurno(id, 'Ausente')
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

  const obtenerClaseEstado = (estado) => {
    if (estado === 'Cancelado') return 'estado-turno cancelado'
    if (estado === 'Realizado') return 'estado-turno realizado'
    if (estado === 'Ausente') return 'estado-turno ausente'

    return 'estado-turno programado'
    useEffect(() => {
  const revisarTurnosVencidos = () => {
    const ahora = new Date()

    setTurnos((turnosActuales) => {
      let huboCambios = false

      const turnosActualizados = turnosActuales.map((turno) => {
        const estadoActual = turno.estado || 'Programado'
        const fechaFinTurno = new Date(turno.fechaFin)

        const turnoYaPaso = fechaFinTurno < ahora
        const sigueProgramado = estadoActual === 'Programado'

        if (!turnoYaPaso || !sigueProgramado) {
          return turno
        }

        huboCambios = true

        const mascota = mascotas.find(
          (mascota) => mascota.id === turno.mascotaId
        )

        const cliente = clientes.find(
          (cliente) => cliente.id === mascota?.clienteId
        )

        const mensaje =
          'El horario del turno ya pasó y el turno seguía como programado. Se recomienda contactar al cliente para reprogramar.'

        crearAlertaSistema({
          clave: `turno-vencido-${turno.id}`,
          titulo: 'Turno vencido',
          mensaje,
          origen: 'Turnos',
          cliente: `${cliente?.nombre || ''} ${cliente?.apellido || ''}`.trim(),
          telefono: cliente?.telefono || '',
          mascota: mascota?.nombre || '',
        })

        setAlertaSeguimiento({
          turno: {
            ...turno,
            estado: 'Ausente',
          },
          mascota,
          cliente,
          tipo: 'Turno vencido',
          mensaje,
        })

        return {
          ...turno,
          estado: 'Ausente',
          observaciones:
            turno.observaciones ||
            'Marcado automáticamente como ausente porque pasó el horario del turno.',
        }
      })

      if (!huboCambios) {
        return turnosActuales
      }

      return turnosActualizados
    })
  }

  revisarTurnosVencidos()

  const intervalo = setInterval(revisarTurnosVencidos, 60000)

  return () => clearInterval(intervalo)
}, [clientes, mascotas])
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

      {alertaSeguimiento && (
        <div className="alerta-seguimiento-turno">
          <div className="alerta-icono">
            <FaTriangleExclamation />
          </div>

          <div className="alerta-contenido">
            <strong>{alertaSeguimiento.tipo}</strong>
            <p>{alertaSeguimiento.mensaje}</p>

            <small>
              Cliente: {alertaSeguimiento.cliente?.nombre}{' '}
              {alertaSeguimiento.cliente?.apellido} | Mascota:{' '}
              {alertaSeguimiento.mascota?.nombre}
            </small>
          </div>

          <div className="alerta-acciones">
            <button
              type="button"
              className="btn-alerta llamar"
              onClick={() => llamarCliente(alertaSeguimiento.cliente)}
            >
              <FaPhone />
              Llamar
            </button>

            <button
              type="button"
              className="btn-alerta whatsapp"
              onClick={() =>
                enviarWhatsapp(
                  alertaSeguimiento.cliente,
                  alertaSeguimiento.mascota,
                  alertaSeguimiento.turno.motivo
                )
              }
            >
              <FaWhatsapp />
              WhatsApp
            </button>

            <button
              type="button"
              className="btn-alerta reprogramar"
              onClick={reprogramarDesdeAlerta}
            >
              <FaPen />
              Reprogramar
            </button>

            <button
              type="button"
              className="btn-alerta cerrar"
              onClick={cerrarAlertaSeguimiento}
            >
              <FaXmark />
            </button>
          </div>
        </div>
      )}

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
                        <span className={obtenerClaseEstado(turno.estado)}>
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
                            className="btn-accion ausente"
                            onClick={() => marcarAusente(turno.id)}
                            title="Marcar como ausente"
                          >
                            A
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
                    <option value="Ausente">Ausente</option>
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
                    <span>Teléfono</span>
                    <strong>
                      {
                        obtenerClienteDeMascota(turnoSeleccionado.mascotaId)
                          ?.telefono
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

                {(turnoSeleccionado.estado === 'Cancelado' ||
                  turnoSeleccionado.estado === 'Ausente' ||
                  (turnoSeleccionado.motivo === 'Vacunación' &&
                    turnoSeleccionado.estado !== 'Realizado')) && (
                  <div className="seguimiento-detalle">
                    <FaTriangleExclamation />
                    <div>
                      <strong>Seguimiento recomendado</strong>
                      <p>
                        Contactar al cliente para coordinar un nuevo turno.
                      </p>
                    </div>
                  </div>
                )}

                <div className="acciones-detalle-turno">
                  <button
                    className="btn-editar-detalle"
                    onClick={() => abrirEditarTurno(turnoSeleccionado)}
                  >
                    <FaPen />
                    Reprogramar
                  </button>

                  <button
                    className="btn-contacto-turno llamar"
                    onClick={() =>
                      llamarCliente(
                        obtenerClienteDeMascota(turnoSeleccionado.mascotaId)
                      )
                    }
                  >
                    <FaPhone />
                    Llamar
                  </button>

                  <button
                    className="btn-contacto-turno whatsapp"
                    onClick={() =>
                      enviarWhatsapp(
                        obtenerClienteDeMascota(turnoSeleccionado.mascotaId),
                        obtenerMascota(turnoSeleccionado.mascotaId),
                        turnoSeleccionado.motivo
                      )
                    }
                  >
                    <FaWhatsapp />
                    WhatsApp
                  </button>
                </div>
              </>
            )}
          </aside>
        )}
      </div>
    </section>
  )
}

export default Turnos