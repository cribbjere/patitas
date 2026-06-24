import { useState } from 'react'
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

import {
  clientes as clientesIniciales,
  mascotas as mascotasIniciales,
  vacunaciones as vacunacionesIniciales,
} from '../data/mockData'

import './Vacunaciones.css'

const vacunacionVacia = {
  mascotaId: '',
  vacuna: '',
  fechaAplicacion: '',
  proximaDosis: '',
  observaciones: '',
}

function normalizarVacunaciones(vacunaciones) {
  return vacunaciones.map((vacunacion) => ({
    id: vacunacion.id,
    mascotaId: vacunacion.mascotaId,
    vacuna: vacunacion.vacuna,
    fechaAplicacion: vacunacion.fechaAplicacion || vacunacion.fecha || '',
    proximaDosis: vacunacion.proximaDosis || '',
    observaciones: vacunacion.observaciones || '',
  }))
}

function obtenerEstadoVacuna(vacunacion) {
  if (!vacunacion.proximaDosis) {
    return 'Aplicada'
  }

  const hoy = new Date()
  const proxima = new Date(vacunacion.proximaDosis)

  hoy.setHours(0, 0, 0, 0)
  proxima.setHours(0, 0, 0, 0)

  if (proxima < hoy) {
    return 'Vencida'
  }

  return 'Próxima'
}

function Vacunaciones() {
  const [clientes] = useState(clientesIniciales)
  const [mascotas] = useState(mascotasIniciales)
  const [vacunaciones, setVacunaciones] = useState(
    normalizarVacunaciones(vacunacionesIniciales)
  )

  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [vacunacionSeleccionada, setVacunacionSeleccionada] = useState(null)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [formulario, setFormulario] = useState(vacunacionVacia)

  const obtenerMascota = (mascotaId) => {
    return mascotas.find((mascota) => mascota.id === mascotaId)
  }

  const obtenerClienteDeMascota = (mascotaId) => {
    const mascota = obtenerMascota(mascotaId)

    if (!mascota) return null

    return clientes.find((cliente) => cliente.id === mascota.clienteId)
  }

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
      vacuna: vacunacion.vacuna,
      fechaAplicacion: vacunacion.fechaAplicacion,
      proximaDosis: vacunacion.proximaDosis,
      observaciones: vacunacion.observaciones,
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

    setFormulario({
      ...formulario,
      [name]: name === 'mascotaId' ? Number(value) : value,
    })
  }

  const guardarVacunacion = (e) => {
    e.preventDefault()

    if (
      !formulario.mascotaId ||
      !formulario.vacuna ||
      !formulario.fechaAplicacion
    ) {
      alert('Completá mascota, vacuna y fecha de aplicación.')
      return
    }

    if (modoEdicion) {
      const vacunacionesActualizadas = vacunaciones.map((vacunacion) => {
        if (vacunacion.id === vacunacionSeleccionada.id) {
          return {
            id: vacunacionSeleccionada.id,
            mascotaId: formulario.mascotaId,
            vacuna: formulario.vacuna,
            fechaAplicacion: formulario.fechaAplicacion,
            proximaDosis: formulario.proximaDosis,
            observaciones: formulario.observaciones,
          }
        }

        return vacunacion
      })

      setVacunaciones(vacunacionesActualizadas)
    } else {
      const nuevaVacunacion = {
        id: Date.now(),
        mascotaId: formulario.mascotaId,
        vacuna: formulario.vacuna,
        fechaAplicacion: formulario.fechaAplicacion,
        proximaDosis: formulario.proximaDosis,
        observaciones: formulario.observaciones,
      }

      setVacunaciones([...vacunaciones, nuevaVacunacion])
    }

    cerrarPanel()
  }

  const eliminarVacunacion = (id) => {
    const confirmar = window.confirm(
      '¿Seguro que querés eliminar esta vacunación?'
    )

    if (!confirmar) return

    const vacunacionesActualizadas = vacunaciones.filter(
      (vacunacion) => vacunacion.id !== id
    )

    setVacunaciones(vacunacionesActualizadas)

    if (vacunacionSeleccionada?.id === id) {
      cerrarPanel()
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
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {vacunacionesFiltradas.map((vacunacion) => {
                  const mascota = obtenerMascota(vacunacion.mascotaId)
                  const cliente = obtenerClienteDeMascota(vacunacion.mascotaId)
                  const estado = obtenerEstadoVacuna(vacunacion)

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
                    <td colSpan="7" className="sin-resultados">
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

                  <label>Vacuna</label>
                  <input
                    type="text"
                    name="vacuna"
                    value={formulario.vacuna}
                    onChange={manejarCambio}
                  />

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