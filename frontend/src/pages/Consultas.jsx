import { useState } from 'react'
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

  const obtenerMascota = (mascotaId) => {
    return mascotas.find((mascota) => mascota.id === mascotaId)
  }

  const obtenerClienteDeMascota = (mascotaId) => {
    const mascota = obtenerMascota(mascotaId)

    if (!mascota) return null

    return clientes.find((cliente) => cliente.id === mascota.clienteId)
  }

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
      fecha: consulta.fecha,
      peso: consulta.peso,
      temperatura: consulta.temperatura,
      diagnostico: consulta.diagnostico,
      tratamiento: consulta.tratamiento,
      observaciones: consulta.observaciones,
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

    setFormulario({
      ...formulario,
      [name]: name === 'mascotaId' ? Number(value) : value,
    })
  }

  const guardarConsulta = (e) => {
    e.preventDefault()

    if (
      !formulario.mascotaId ||
      !formulario.fecha ||
      !formulario.diagnostico ||
      !formulario.tratamiento
    ) {
      alert('Completá mascota, fecha, diagnóstico y tratamiento.')
      return
    }

    if (modoEdicion) {
      const consultasActualizadas = consultas.map((consulta) => {
        if (consulta.id === consultaSeleccionada.id) {
          return {
            id: consultaSeleccionada.id,
            mascotaId: formulario.mascotaId,
            fecha: formulario.fecha,
            peso: Number(formulario.peso),
            temperatura: Number(formulario.temperatura),
            diagnostico: formulario.diagnostico,
            tratamiento: formulario.tratamiento,
            observaciones: formulario.observaciones,
          }
        }

        return consulta
      })

      setConsultas(consultasActualizadas)
    } else {
      const nuevaConsulta = {
        id: Date.now(),
        mascotaId: formulario.mascotaId,
        fecha: formulario.fecha,
        peso: Number(formulario.peso),
        temperatura: Number(formulario.temperatura),
        diagnostico: formulario.diagnostico,
        tratamiento: formulario.tratamiento,
        observaciones: formulario.observaciones,
      }

      setConsultas([...consultas, nuevaConsulta])
    }

    cerrarPanel()
  }

  const eliminarConsulta = (id) => {
    const confirmar = window.confirm('¿Seguro que querés eliminar esta consulta?')

    if (!confirmar) return

    const consultasActualizadas = consultas.filter(
      (consulta) => consulta.id !== id
    )

    setConsultas(consultasActualizadas)

    if (consultaSeleccionada?.id === id) {
      cerrarPanel()
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