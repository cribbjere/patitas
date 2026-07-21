import { useMemo, useState } from 'react'
import {
  FaMagnifyingGlass,
  FaPlus,
  FaEye,
  FaPen,
  FaTrash,
  FaFloppyDisk,
  FaXmark,
  FaStethoscope,
  FaTriangleExclamation,
} from 'react-icons/fa6'

import {
  clientes as clientesIniciales,
  mascotas as mascotasIniciales,
} from '../data/mockData'

import './Consultas.css'

const consultasIniciales = [
  {
    id: 1,
    mascotaId: 1,
    fecha: '2026-06-20',
    peso: 18.5,
    temperatura: 38.2,
    diagnostico: 'Control general sin complicaciones.',
    tratamiento: 'Continuar alimentación habitual.',
    observaciones: 'Paciente tranquilo durante la revisión.',
  },
  {
    id: 2,
    mascotaId: 2,
    fecha: '2026-06-21',
    peso: 4.2,
    temperatura: 38.6,
    diagnostico: 'Revisión por vacunación.',
    tratamiento: 'Aplicar refuerzo según calendario.',
    observaciones: 'Se recomienda próximo control en 30 días.',
  },
  {
    id: 3,
    mascotaId: 3,
    fecha: '2026-06-22',
    peso: 5.1,
    temperatura: 38.4,
    diagnostico: 'Control de rutina.',
    tratamiento: 'Sin medicación indicada.',
    observaciones: 'Buen estado general.',
  },
]

const consultaVacia = {
  mascotaId: '',
  fecha: '',
  peso: '',
  temperatura: '',
  diagnostico: '',
  tratamiento: '',
  observaciones: '',
}

function Consultas() {
  const [clientes] = useState(clientesIniciales)
  const [mascotas] = useState(mascotasIniciales)
  const [consultas, setConsultas] = useState(consultasIniciales)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [consultaSeleccionada, setConsultaSeleccionada] = useState(null)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [formulario, setFormulario] = useState(consultaVacia)
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

  const consultasFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()

    return consultas.filter((consulta) => {
      const mascota = obtenerMascota(consulta.mascotaId)
      const cliente = obtenerClienteDeMascota(consulta.mascotaId)

      const texto = `
        ${consulta.fecha}
        ${consulta.diagnostico}
        ${consulta.tratamiento}
        ${consulta.observaciones}
        ${mascota?.nombre || ''}
        ${mascota?.especie || ''}
        ${cliente?.nombre || ''}
        ${cliente?.apellido || ''}
      `.toLowerCase()

      return texto.includes(termino)
    })
  }, [busqueda, consultas, clientes, mascotas])

  const historialMascota = useMemo(() => {
    if (!consultaSeleccionada) return []

    return consultas
      .filter(
        (consulta) =>
          consulta.mascotaId === consultaSeleccionada.mascotaId
      )
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  }, [consultaSeleccionada, consultas])

  const abrirNuevaConsulta = () => {
    setFormulario(consultaVacia)
    setConsultaSeleccionada(null)
    setModoEdicion(false)
    setErrorFormulario('')
    setMostrarFormulario(true)
  }

  const abrirVerConsulta = (consulta) => {
    setConsultaSeleccionada(consulta)
    setMostrarFormulario(false)
    setModoEdicion(false)
    setErrorFormulario('')
  }

  const abrirEditarConsulta = (consulta) => {
    setFormulario({
      mascotaId: consulta.mascotaId,
      fecha: consulta.fecha,
      peso: consulta.peso ?? '',
      temperatura: consulta.temperatura ?? '',
      diagnostico: consulta.diagnostico,
      tratamiento: consulta.tratamiento,
      observaciones: consulta.observaciones,
    })

    setConsultaSeleccionada(consulta)
    setModoEdicion(true)
    setErrorFormulario('')
    setMostrarFormulario(true)
  }

  const cerrarPanel = () => {
    setFormulario(consultaVacia)
    setConsultaSeleccionada(null)
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

    if (!formulario.fecha) {
      return 'Ingresá la fecha de la consulta.'
    }

    if (!formulario.peso || Number(formulario.peso) <= 0) {
      return 'Ingresá un peso válido.'
    }

    if (
      !formulario.temperatura ||
      Number(formulario.temperatura) < 30 ||
      Number(formulario.temperatura) > 45
    ) {
      return 'Ingresá una temperatura válida entre 30 °C y 45 °C.'
    }

    if (!formulario.diagnostico.trim()) {
      return 'Ingresá el diagnóstico.'
    }

    if (!formulario.tratamiento.trim()) {
      return 'Ingresá el tratamiento.'
    }

    return ''
  }

  const guardarConsulta = (e) => {
    e.preventDefault()

    const error = validarFormulario()

    if (error) {
      setErrorFormulario(error)
      return
    }

    const datosConsulta = {
      mascotaId: Number(formulario.mascotaId),
      fecha: formulario.fecha,
      peso: Number(formulario.peso),
      temperatura: Number(formulario.temperatura),
      diagnostico: formulario.diagnostico.trim(),
      tratamiento: formulario.tratamiento.trim(),
      observaciones: formulario.observaciones.trim(),
    }

    if (modoEdicion && consultaSeleccionada) {
      setConsultas((consultasActuales) =>
        consultasActuales.map((consulta) =>
          consulta.id === consultaSeleccionada.id
            ? { ...consulta, ...datosConsulta }
            : consulta
        )
      )
    } else {
      setConsultas((consultasActuales) => [
        ...consultasActuales,
        {
          id: Date.now(),
          ...datosConsulta,
        },
      ])
    }

    cerrarPanel()
  }

  const eliminarConsulta = (id) => {
    const confirmar = window.confirm(
      '¿Seguro que querés eliminar esta consulta?'
    )

    if (!confirmar) return

    setConsultas((consultasActuales) =>
      consultasActuales.filter((consulta) => consulta.id !== id)
    )

    if (consultaSeleccionada?.id === id) {
      cerrarPanel()
    }
  }

  const mascotaSeleccionada = consultaSeleccionada
    ? obtenerMascota(consultaSeleccionada.mascotaId)
    : null

  const clienteSeleccionado = consultaSeleccionada
    ? obtenerClienteDeMascota(consultaSeleccionada.mascotaId)
    : null

  return (
    <section className="consultas-page">
      <div className="consultas-header">
        <div>
          <h1>Consultas</h1>
          <p>Registro de consultas clínicas e historial médico</p>
        </div>

        <button
          type="button"
          className="btn-nueva-consulta"
          onClick={abrirNuevaConsulta}
        >
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
              {consultasFiltradas.length}{' '}
              {consultasFiltradas.length === 1 ? 'consulta' : 'consultas'}
            </span>
          </div>

          <div className="consultas-table-wrapper">
            <table className="consultas-table">
              <thead>
                <tr>
                  <th>Consulta</th>
                  <th>Mascota</th>
                  <th>Dueño</th>
                  <th>Diagnóstico</th>
                  <th>Tratamiento</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {consultasFiltradas.map((consulta) => {
                  const mascota = obtenerMascota(consulta.mascotaId)
                  const cliente = obtenerClienteDeMascota(consulta.mascotaId)

                  return (
                    <tr key={consulta.id}>
                      <td>
                        <div className="consulta-fecha">
                          <div className="consulta-icono">
                            <FaStethoscope />
                          </div>

                          <div>
                            <strong>{formatearFecha(consulta.fecha)}</strong>
                            <small>
                              {consulta.peso} kg · {consulta.temperatura} °C
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

                      <td className="texto-recortado">
                        {consulta.diagnostico}
                      </td>

                      <td className="texto-recortado">
                        {consulta.tratamiento}
                      </td>

                      <td>
                        <div className="acciones">
                          <button
                            type="button"
                            className="btn-accion ver"
                            onClick={() => abrirVerConsulta(consulta)}
                            title="Ver consulta"
                            aria-label="Ver consulta"
                          >
                            <FaEye />
                          </button>

                          <button
                            type="button"
                            className="btn-accion editar"
                            onClick={() => abrirEditarConsulta(consulta)}
                            title="Editar consulta"
                            aria-label="Editar consulta"
                          >
                            <FaPen />
                          </button>

                          <button
                            type="button"
                            className="btn-accion eliminar"
                            onClick={() => eliminarConsulta(consulta.id)}
                            title="Eliminar consulta"
                            aria-label="Eliminar consulta"
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
                    <td colSpan="6" className="sin-resultados">
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
                <h2>{modoEdicion ? 'Editar Consulta' : 'Nueva Consulta'}</h2>

                <p>
                  {modoEdicion
                    ? 'Modificá los datos de la consulta seleccionada'
                    : 'Cargá una nueva consulta clínica'}
                </p>

                <form className="consulta-form" onSubmit={guardarConsulta}>
                  {errorFormulario && (
                    <div className="consulta-form-error" role="alert">
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

                  <label htmlFor="fecha">Fecha</label>
                  <input
                    id="fecha"
                    type="date"
                    name="fecha"
                    value={formulario.fecha}
                    onChange={manejarCambio}
                  />

                  <label htmlFor="peso">Peso (kg)</label>
                  <input
                    id="peso"
                    type="number"
                    name="peso"
                    value={formulario.peso}
                    onChange={manejarCambio}
                    min="0.1"
                    step="0.1"
                    placeholder="Ejemplo: 8.5"
                  />

                  <label htmlFor="temperatura">Temperatura (°C)</label>
                  <input
                    id="temperatura"
                    type="number"
                    name="temperatura"
                    value={formulario.temperatura}
                    onChange={manejarCambio}
                    min="30"
                    max="45"
                    step="0.1"
                    placeholder="Ejemplo: 38.5"
                  />

                  <label htmlFor="diagnostico">Diagnóstico</label>
                  <textarea
                    id="diagnostico"
                    name="diagnostico"
                    value={formulario.diagnostico}
                    onChange={manejarCambio}
                    placeholder="Describí el diagnóstico"
                  />

                  <label htmlFor="tratamiento">Tratamiento</label>
                  <textarea
                    id="tratamiento"
                    name="tratamiento"
                    value={formulario.tratamiento}
                    onChange={manejarCambio}
                    placeholder="Indicá el tratamiento"
                  />

                  <label htmlFor="observaciones">Observaciones</label>
                  <textarea
                    id="observaciones"
                    name="observaciones"
                    value={formulario.observaciones}
                    onChange={manejarCambio}
                    placeholder="Información adicional"
                  />

                  <button type="submit" className="btn-guardar">
                    <FaFloppyDisk />
                    {modoEdicion ? 'Guardar Cambios' : 'Guardar Consulta'}
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
                    <strong>{formatearFecha(consultaSeleccionada.fecha)}</strong>
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
                    <span>Peso</span>
                    <strong>{consultaSeleccionada.peso} kg</strong>
                  </div>

                  <div>
                    <span>Temperatura</span>
                    <strong>{consultaSeleccionada.temperatura} °C</strong>
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
                      {consultaSeleccionada.observaciones || 'Sin observaciones'}
                    </strong>
                  </div>
                </div>

                <div className="historial-clinico">
                  <h3>Historial clínico</h3>

                  {historialMascota.map((consulta) => (
                    <div
                      className={`historial-item ${
                        consulta.id === consultaSeleccionada.id
                          ? 'historial-item-activo'
                          : ''
                      }`}
                      key={consulta.id}
                    >
                      <strong>{formatearFecha(consulta.fecha)}</strong>
                      <span>{consulta.diagnostico}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
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