import { useState } from 'react'
import {
  FaMagnifyingGlass,
  FaPlus,
  FaEye,
  FaPen,
  FaTrash,
  FaFloppyDisk,
  FaXmark,
  FaPaw,
} from 'react-icons/fa6'

import {
  clientes as clientesIniciales,
  mascotas as mascotasIniciales,
} from '../data/mockData'

import './Mascotas.css'

const mascotaVacia = {
  nombre: '',
  especie: '',
  raza: '',
  fechaNacimiento: '',
  sexo: '',
  peso: '',
  observaciones: '',
  clienteId: '',
}

function Mascotas() {
  const [clientes] = useState(clientesIniciales)
  const [mascotas, setMascotas] = useState(mascotasIniciales)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState(null)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [formulario, setFormulario] = useState(mascotaVacia)

  const obtenerCliente = (clienteId) => {
    return clientes.find((cliente) => cliente.id === clienteId)
  }

  const mascotasFiltradas = mascotas.filter((mascota) => {
    const cliente = obtenerCliente(mascota.clienteId)

    const texto = `
      ${mascota.nombre}
      ${mascota.especie}
      ${mascota.raza}
      ${mascota.sexo}
      ${cliente?.nombre}
      ${cliente?.apellido}
    `.toLowerCase()

    return texto.includes(busqueda.toLowerCase())
  })

  const abrirNuevaMascota = () => {
    setFormulario(mascotaVacia)
    setMascotaSeleccionada(null)
    setModoEdicion(false)
    setMostrarFormulario(true)
  }

  const abrirVerMascota = (mascota) => {
    setMascotaSeleccionada(mascota)
    setMostrarFormulario(false)
    setModoEdicion(false)
  }

  const abrirEditarMascota = (mascota) => {
    setFormulario({
      ...mascota,
    })

    setMascotaSeleccionada(mascota)
    setModoEdicion(true)
    setMostrarFormulario(true)
  }

  const cerrarPanel = () => {
    setFormulario(mascotaVacia)
    setMascotaSeleccionada(null)
    setMostrarFormulario(false)
    setModoEdicion(false)
  }

  const manejarCambio = (e) => {
    const { name, value } = e.target

    setFormulario({
      ...formulario,
      [name]:
        name === 'clienteId'
          ? Number(value)
          : name === 'peso'
            ? value
            : value,
    })
  }

  const guardarMascota = (e) => {
    e.preventDefault()

    if (!formulario.nombre || !formulario.especie || !formulario.clienteId) {
      alert('Completá nombre, especie y dueño.')
      return
    }

    if (modoEdicion) {
      const mascotasActualizadas = mascotas.map((mascota) => {
        if (mascota.id === mascotaSeleccionada.id) {
          return {
            ...formulario,
            id: mascotaSeleccionada.id,
            peso: Number(formulario.peso),
          }
        }

        return mascota
      })

      setMascotas(mascotasActualizadas)
    } else {
      const nuevaMascota = {
        ...formulario,
        id: Date.now(),
        peso: Number(formulario.peso),
      }

      setMascotas([...mascotas, nuevaMascota])
    }

    cerrarPanel()
  }

  const eliminarMascota = (id) => {
    const confirmar = window.confirm('¿Seguro que querés eliminar esta mascota?')

    if (!confirmar) return

    const mascotasActualizadas = mascotas.filter((mascota) => mascota.id !== id)

    setMascotas(mascotasActualizadas)

    if (mascotaSeleccionada?.id === id) {
      cerrarPanel()
    }
  }

  return (
    <section className="mascotas-page">
      <div className="mascotas-header">
        <div>
          <h1>Mascotas</h1>
          <p>Registro de mascotas y relación con sus dueños</p>
        </div>

        <button className="btn-nueva-mascota" onClick={abrirNuevaMascota}>
          <FaPlus />
          Nueva Mascota
        </button>
      </div>

      <div className="mascotas-content">
        <div className="mascotas-main-card">
          <div className="mascotas-toolbar">
            <div className="mascotas-search">
              <FaMagnifyingGlass />

              <input
                type="text"
                placeholder="Buscar mascota por nombre, especie, raza o dueño"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <span className="mascotas-total">
              {mascotasFiltradas.length} mascotas
            </span>
          </div>

          <div className="mascotas-table-wrapper">
            <table className="mascotas-table">
              <thead>
                <tr>
                  <th>Mascota</th>
                  <th>Dueño</th>
                  <th>Especie</th>
                  <th>Sexo</th>
                  <th>Peso</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {mascotasFiltradas.map((mascota) => {
                  const cliente = obtenerCliente(mascota.clienteId)

                  return (
                    <tr key={mascota.id}>
                      <td>
                        <div className="mascota-nombre">
                          <div className="mascota-icono">
                            <FaPaw />
                          </div>

                          <div>
                            <strong>{mascota.nombre}</strong>
                            <small>{mascota.raza}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        {cliente?.nombre} {cliente?.apellido}
                      </td>

                      <td>{mascota.especie}</td>

                      <td>{mascota.sexo}</td>

                      <td>{mascota.peso} kg</td>

                      <td>
                        <div className="acciones">
                          <button
                            className="btn-accion ver"
                            onClick={() => abrirVerMascota(mascota)}
                            title="Ver mascota"
                          >
                            <FaEye />
                          </button>

                          <button
                            className="btn-accion editar"
                            onClick={() => abrirEditarMascota(mascota)}
                            title="Editar mascota"
                          >
                            <FaPen />
                          </button>

                          <button
                            className="btn-accion eliminar"
                            onClick={() => eliminarMascota(mascota.id)}
                            title="Eliminar mascota"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {mascotasFiltradas.length === 0 && (
                  <tr>
                    <td colSpan="6" className="sin-resultados">
                      No se encontraron mascotas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {(mostrarFormulario || mascotaSeleccionada) && (
          <aside className="mascotas-side-card">
            <button className="btn-cerrar" onClick={cerrarPanel}>
              <FaXmark />
            </button>

            {mostrarFormulario ? (
              <>
                <h2>{modoEdicion ? 'Editar Mascota' : 'Nueva Mascota'}</h2>

                <p>
                  {modoEdicion
                    ? 'Modificá los datos de la mascota seleccionada'
                    : 'Cargá los datos de la mascota y asignale un dueño'}
                </p>

                <form className="mascota-form" onSubmit={guardarMascota}>
                  <label>Dueño</label>
                  <select
                    name="clienteId"
                    value={formulario.clienteId}
                    onChange={manejarCambio}
                  >
                    <option value="">Seleccionar dueño</option>

                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre} {cliente.apellido}
                      </option>
                    ))}
                  </select>

                  <label>Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formulario.nombre}
                    onChange={manejarCambio}
                  />

                  <label>Especie</label>
                  <select
                    name="especie"
                    value={formulario.especie}
                    onChange={manejarCambio}
                  >
                    <option value="">Seleccionar especie</option>
                    <option value="Perro">Perro</option>
                    <option value="Gato">Gato</option>
                    <option value="Ave">Ave</option>
                    <option value="Conejo">Conejo</option>
                    <option value="Otro">Otro</option>
                  </select>

                  <label>Raza</label>
                  <input
                    type="text"
                    name="raza"
                    value={formulario.raza}
                    onChange={manejarCambio}
                  />

                  <label>Fecha de nacimiento</label>
                  <input
                    type="date"
                    name="fechaNacimiento"
                    value={formulario.fechaNacimiento}
                    onChange={manejarCambio}
                  />

                  <label>Sexo</label>
                  <select
                    name="sexo"
                    value={formulario.sexo}
                    onChange={manejarCambio}
                  >
                    <option value="">Seleccionar sexo</option>
                    <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                  </select>

                  <label>Peso</label>
                  <input
                    type="number"
                    name="peso"
                    value={formulario.peso}
                    onChange={manejarCambio}
                    step="0.1"
                  />

                  <label>Observaciones</label>
                  <textarea
                    name="observaciones"
                    value={formulario.observaciones}
                    onChange={manejarCambio}
                  />

                  <button type="submit" className="btn-guardar">
                    <FaFloppyDisk />
                    Guardar Mascota
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2>Ficha de Mascota</h2>
                <p>Información registrada de la mascota</p>

                <div className="mascota-detalle">
                  <div>
                    <span>Nombre</span>
                    <strong>{mascotaSeleccionada.nombre}</strong>
                  </div>

                  <div>
                    <span>Dueño</span>
                    <strong>
                      {obtenerCliente(mascotaSeleccionada.clienteId)?.nombre}{' '}
                      {obtenerCliente(mascotaSeleccionada.clienteId)?.apellido}
                    </strong>
                  </div>

                  <div>
                    <span>Especie</span>
                    <strong>{mascotaSeleccionada.especie}</strong>
                  </div>

                  <div>
                    <span>Raza</span>
                    <strong>{mascotaSeleccionada.raza}</strong>
                  </div>

                  <div>
                    <span>Fecha de nacimiento</span>
                    <strong>{mascotaSeleccionada.fechaNacimiento}</strong>
                  </div>

                  <div>
                    <span>Sexo</span>
                    <strong>{mascotaSeleccionada.sexo}</strong>
                  </div>

                  <div>
                    <span>Peso</span>
                    <strong>{mascotaSeleccionada.peso} kg</strong>
                  </div>

                  <div>
                    <span>Observaciones</span>
                    <strong>{mascotaSeleccionada.observaciones}</strong>
                  </div>
                </div>

                <button
                  className="btn-editar-detalle"
                  onClick={() => abrirEditarMascota(mascotaSeleccionada)}
                >
                  <FaPen />
                  Editar Mascota
                </button>
              </>
            )}
          </aside>
        )}
      </div>
    </section>
  )
}

export default Mascotas