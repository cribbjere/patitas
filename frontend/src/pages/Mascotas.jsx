import { useMemo, useState } from 'react'
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

import {
  soloLetras,
  soloNumerosDecimales,
} from '../utils/validaciones'

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
  const [formulario, setFormulario] = useState({ ...mascotaVacia })
  const [errorFormulario, setErrorFormulario] = useState('')

  const fechaActual = new Date().toISOString().split('T')[0]

  const obtenerCliente = (clienteId) => {
    return clientes.find((cliente) => cliente.id === Number(clienteId))
  }

  const formatearFecha = (fecha) => {
    if (!fecha) {
      return 'No registrada'
    }

    const [anio, mes, dia] = fecha.split('-')

    if (!anio || !mes || !dia) {
      return fecha
    }

    return `${dia}/${mes}/${anio}`
  }

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) {
      return 'Edad no registrada'
    }

    const nacimiento = new Date(`${fechaNacimiento}T00:00:00`)
    const hoy = new Date()

    let anios = hoy.getFullYear() - nacimiento.getFullYear()
    let meses = hoy.getMonth() - nacimiento.getMonth()

    if (hoy.getDate() < nacimiento.getDate()) {
      meses -= 1
    }

    if (meses < 0) {
      anios -= 1
      meses += 12
    }

    if (anios < 0) {
      return 'Fecha inválida'
    }

    if (anios === 0) {
      if (meses === 0) {
        return 'Menos de un mes'
      }

      return `${meses} ${meses === 1 ? 'mes' : 'meses'}`
    }

    return `${anios} ${anios === 1 ? 'año' : 'años'}`
  }

  const mascotasFiltradas = useMemo(() => {
    const textoBusqueda = busqueda.trim().toLowerCase()

    if (!textoBusqueda) {
      return mascotas
    }

    return mascotas.filter((mascota) => {
      const cliente = obtenerCliente(mascota.clienteId)

      const textoMascota = [
        mascota.nombre,
        mascota.especie,
        mascota.raza,
        mascota.sexo,
        cliente?.nombre,
        cliente?.apellido,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return textoMascota.includes(textoBusqueda)
    })
  }, [mascotas, busqueda, clientes])

  const abrirNuevaMascota = () => {
    setFormulario({ ...mascotaVacia })
    setMascotaSeleccionada(null)
    setModoEdicion(false)
    setErrorFormulario('')
    setMostrarFormulario(true)
  }

  const abrirVerMascota = (mascota) => {
    setMascotaSeleccionada(mascota)
    setMostrarFormulario(false)
    setModoEdicion(false)
    setErrorFormulario('')
  }

  const abrirEditarMascota = (mascota) => {
    setFormulario({
      ...mascota,
      clienteId: mascota.clienteId ?? '',
      peso: mascota.peso ?? '',
    })

    setMascotaSeleccionada(mascota)
    setModoEdicion(true)
    setMostrarFormulario(true)
    setErrorFormulario('')
  }

  const cerrarPanel = () => {
    setFormulario({ ...mascotaVacia })
    setMascotaSeleccionada(null)
    setMostrarFormulario(false)
    setModoEdicion(false)
    setErrorFormulario('')
  }

  const manejarCambio = (evento) => {
    const { name, value } = evento.target

    let nuevoValor = value

    if (name === 'nombre' || name === 'raza') {
      nuevoValor = soloLetras(value)
    }

    if (name === 'peso') {
      nuevoValor = soloNumerosDecimales(value)
    }

    if (name === 'clienteId') {
      nuevoValor = value ? Number(value) : ''
    }

    setFormulario((formularioAnterior) => ({
      ...formularioAnterior,
      [name]: nuevoValor,
    }))

    if (errorFormulario) {
      setErrorFormulario('')
    }
  }

  const validarFormulario = () => {
    const nombre = formulario.nombre.trim()
    const raza = formulario.raza.trim()
    const peso = Number(formulario.peso)

    if (!formulario.clienteId) {
      return 'Seleccioná el dueño de la mascota.'
    }

    if (!nombre) {
      return 'Ingresá el nombre de la mascota.'
    }

    if (nombre.length < 2) {
      return 'El nombre debe tener al menos 2 letras.'
    }

    if (!formulario.especie) {
      return 'Seleccioná la especie de la mascota.'
    }

    if (raza && raza.length < 2) {
      return 'La raza debe tener al menos 2 letras.'
    }

    if (
      formulario.fechaNacimiento &&
      formulario.fechaNacimiento > fechaActual
    ) {
      return 'La fecha de nacimiento no puede ser posterior a la fecha actual.'
    }

    if (formulario.peso !== '' && (!peso || peso <= 0)) {
      return 'Ingresá un peso mayor a cero.'
    }

    return ''
  }

  const guardarMascota = (evento) => {
    evento.preventDefault()

    const error = validarFormulario()

    if (error) {
      setErrorFormulario(error)
      return
    }

    const datosMascota = {
      ...formulario,
      nombre: formulario.nombre.trim(),
      raza: formulario.raza.trim(),
      peso:
        formulario.peso === ''
          ? ''
          : Number(formulario.peso),
      observaciones: formulario.observaciones.trim(),
    }

    if (modoEdicion && mascotaSeleccionada) {
      setMascotas((mascotasAnteriores) =>
        mascotasAnteriores.map((mascota) =>
          mascota.id === mascotaSeleccionada.id
            ? {
                ...datosMascota,
                id: mascotaSeleccionada.id,
              }
            : mascota
        )
      )
    } else {
      const nuevaMascota = {
        ...datosMascota,
        id: Date.now(),
      }

      setMascotas((mascotasAnteriores) => [
        ...mascotasAnteriores,
        nuevaMascota,
      ])
    }

    cerrarPanel()
  }

  const eliminarMascota = (mascota) => {
    const confirmar = window.confirm(
      `¿Seguro que querés eliminar a ${mascota.nombre}?`
    )

    if (!confirmar) {
      return
    }

    setMascotas((mascotasAnteriores) =>
      mascotasAnteriores.filter((item) => item.id !== mascota.id)
    )

    if (mascotaSeleccionada?.id === mascota.id) {
      cerrarPanel()
    }
  }

  return (
    <section className="mascotas-page">
      <header className="mascotas-header">
        <div>
          <h1>Mascotas</h1>
          <p>Registro de mascotas y relación con sus dueños</p>
        </div>

        <button
          type="button"
          className="btn-nueva-mascota"
          onClick={abrirNuevaMascota}
        >
          <FaPlus />
          Nueva Mascota
        </button>
      </header>

      <div
        className={`mascotas-content ${
          mostrarFormulario || mascotaSeleccionada
            ? 'con-panel'
            : 'sin-panel'
        }`}
      >
        <div className="mascotas-main-card">
          <div className="mascotas-toolbar">
            <div className="mascotas-search">
              <FaMagnifyingGlass />

              <input
                type="search"
                placeholder="Buscar por nombre, especie, raza o dueño"
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
                aria-label="Buscar mascotas"
              />
            </div>

            <span className="mascotas-total">
              {mascotasFiltradas.length}{' '}
              {mascotasFiltradas.length === 1 ? 'mascota' : 'mascotas'}
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
                            <small>
                              {mascota.raza || 'Raza no registrada'}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        {cliente
                          ? `${cliente.nombre} ${cliente.apellido}`
                          : 'Dueño no encontrado'}
                      </td>

                      <td>
                        <span className="mascota-especie">
                          {mascota.especie}
                        </span>
                      </td>

                      <td>{mascota.sexo || 'No registrado'}</td>

                      <td>
                        {mascota.peso
                          ? `${mascota.peso} kg`
                          : 'No registrado'}
                      </td>

                      <td>
                        <div className="acciones">
                          <button
                            type="button"
                            className="btn-accion ver"
                            onClick={() => abrirVerMascota(mascota)}
                            title="Ver mascota"
                            aria-label={`Ver a ${mascota.nombre}`}
                          >
                            <FaEye />
                          </button>

                          <button
                            type="button"
                            className="btn-accion editar"
                            onClick={() => abrirEditarMascota(mascota)}
                            title="Editar mascota"
                            aria-label={`Editar a ${mascota.nombre}`}
                          >
                            <FaPen />
                          </button>

                          <button
                            type="button"
                            className="btn-accion eliminar"
                            onClick={() => eliminarMascota(mascota)}
                            title="Eliminar mascota"
                            aria-label={`Eliminar a ${mascota.nombre}`}
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
                      {busqueda
                        ? 'No se encontraron mascotas con esa búsqueda.'
                        : 'Todavía no hay mascotas registradas.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {(mostrarFormulario || mascotaSeleccionada) && (
          <aside className="mascotas-side-card">
            <button
              type="button"
              className="btn-cerrar"
              onClick={cerrarPanel}
              title="Cerrar panel"
              aria-label="Cerrar panel"
            >
              <FaXmark />
            </button>

            {mostrarFormulario ? (
              <>
                <h2>
                  {modoEdicion ? 'Editar Mascota' : 'Nueva Mascota'}
                </h2>

                <p>
                  {modoEdicion
                    ? 'Modificá los datos de la mascota seleccionada'
                    : 'Cargá los datos de la mascota y asignale un dueño'}
                </p>

                <form
                  className="mascota-form"
                  onSubmit={guardarMascota}
                  noValidate
                >
                  <label htmlFor="mascota-duenio">
                    Dueño <span>*</span>
                  </label>

                  <select
                    id="mascota-duenio"
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

                  <label htmlFor="mascota-nombre">
                    Nombre <span>*</span>
                  </label>

                  <input
                    id="mascota-nombre"
                    type="text"
                    name="nombre"
                    value={formulario.nombre}
                    onChange={manejarCambio}
                    maxLength={50}
                    placeholder="Ejemplo: Mora"
                    autoComplete="off"
                  />

                  <label htmlFor="mascota-especie">
                    Especie <span>*</span>
                  </label>

                  <select
                    id="mascota-especie"
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

                  <label htmlFor="mascota-raza">Raza</label>

                  <input
                    id="mascota-raza"
                    type="text"
                    name="raza"
                    value={formulario.raza}
                    onChange={manejarCambio}
                    maxLength={50}
                    placeholder="Ejemplo: Labrador"
                    autoComplete="off"
                  />

                  <label htmlFor="mascota-fecha">
                    Fecha de nacimiento
                  </label>

                  <input
                    id="mascota-fecha"
                    type="date"
                    name="fechaNacimiento"
                    value={formulario.fechaNacimiento}
                    onChange={manejarCambio}
                    max={fechaActual}
                  />

                  <label htmlFor="mascota-sexo">Sexo</label>

                  <select
                    id="mascota-sexo"
                    name="sexo"
                    value={formulario.sexo}
                    onChange={manejarCambio}
                  >
                    <option value="">Seleccionar sexo</option>
                    <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                  </select>

                  <label htmlFor="mascota-peso">Peso en kilogramos</label>

                  <input
                    id="mascota-peso"
                    type="text"
                    name="peso"
                    value={formulario.peso}
                    onChange={manejarCambio}
                    inputMode="decimal"
                    maxLength={7}
                    placeholder="Ejemplo: 12.5"
                    autoComplete="off"
                  />

                  <label htmlFor="mascota-observaciones">
                    Observaciones
                  </label>

                  <textarea
                    id="mascota-observaciones"
                    name="observaciones"
                    value={formulario.observaciones}
                    onChange={manejarCambio}
                    maxLength={500}
                    placeholder="Información adicional sobre la mascota"
                  />

                  {errorFormulario && (
                    <div className="mascota-form-error" role="alert">
                      {errorFormulario}
                    </div>
                  )}

                  <button type="submit" className="btn-guardar">
                    <FaFloppyDisk />

                    {modoEdicion
                      ? 'Guardar Cambios'
                      : 'Guardar Mascota'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2>Ficha de Mascota</h2>
                <p>Información registrada de la mascota</p>

                <div className="mascota-detalle-encabezado">
                  <div className="mascota-detalle-icono">
                    <FaPaw />
                  </div>

                  <div>
                    <strong>{mascotaSeleccionada.nombre}</strong>
                    <span>
                      {mascotaSeleccionada.especie}
                      {mascotaSeleccionada.raza
                        ? ` · ${mascotaSeleccionada.raza}`
                        : ''}
                    </span>
                  </div>
                </div>

                <div className="mascota-detalle">
                  <div>
                    <span>Dueño</span>
                    <strong>
                      {obtenerCliente(mascotaSeleccionada.clienteId)
                        ? `${obtenerCliente(
                            mascotaSeleccionada.clienteId
                          ).nombre} ${
                            obtenerCliente(
                              mascotaSeleccionada.clienteId
                            ).apellido
                          }`
                        : 'Dueño no encontrado'}
                    </strong>
                  </div>

                  <div>
                    <span>Especie</span>
                    <strong>{mascotaSeleccionada.especie}</strong>
                  </div>

                  <div>
                    <span>Raza</span>
                    <strong>
                      {mascotaSeleccionada.raza || 'No registrada'}
                    </strong>
                  </div>

                  <div>
                    <span>Fecha de nacimiento</span>
                    <strong>
                      {formatearFecha(
                        mascotaSeleccionada.fechaNacimiento
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Edad aproximada</span>
                    <strong>
                      {calcularEdad(
                        mascotaSeleccionada.fechaNacimiento
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Sexo</span>
                    <strong>
                      {mascotaSeleccionada.sexo || 'No registrado'}
                    </strong>
                  </div>

                  <div>
                    <span>Peso</span>
                    <strong>
                      {mascotaSeleccionada.peso
                        ? `${mascotaSeleccionada.peso} kg`
                        : 'No registrado'}
                    </strong>
                  </div>

                  <div>
                    <span>Observaciones</span>
                    <strong>
                      {mascotaSeleccionada.observaciones ||
                        'Sin observaciones'}
                    </strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-editar-detalle"
                  onClick={() =>
                    abrirEditarMascota(mascotaSeleccionada)
                  }
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