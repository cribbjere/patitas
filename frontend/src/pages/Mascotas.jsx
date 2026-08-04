import { useEffect, useMemo, useState } from 'react'
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

import { obtenerClientes } from '../services/clientesService'

import {
  obtenerEspecies,
  obtenerMascotas,
  crearMascota,
  actualizarMascota,
  eliminarMascota as eliminarMascotaApi,
} from '../services/mascotasService'

import {
  soloLetras,
  soloNumerosDecimales,
} from '../utils/validaciones'
import { obtenerUsuarioGuardado } from '../utils/permisos'
import './Mascotas.css'

const mascotaVacia = {
  nombre: '',
  especieId: '',
  raza: '',
  fechaNacimiento: '',
  sexo: '',
  peso: '',
  estado: 'activo',
  alergias: '',
  grupoSanguineo: '',
  observaciones: '',
  clienteId: '',
}

function Mascotas() {
  const usuario = obtenerUsuarioGuardado()

  const rol = String(usuario?.rol || '')
    .trim()
    .toLowerCase()

  const puedeGestionarMascotas = [
    'administrador',
    'recepcionista',
  ].includes(rol)
  const [clientes, setClientes] = useState([])
  const [especies, setEspecies] = useState([])
  const [mascotas, setMascotas] = useState([])

  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState(null)
  const [modoEdicion, setModoEdicion] = useState(false)

  const [formulario, setFormulario] = useState({
    ...mascotaVacia,
  })

  const [errorFormulario, setErrorFormulario] = useState('')
  const [errorCarga, setErrorCarga] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const fechaActual = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true)
        setErrorCarga('')

        const [
          clientesRecibidos,
          especiesRecibidas,
          mascotasRecibidas,
        ] = await Promise.all([
          obtenerClientes(),
          obtenerEspecies(),
          obtenerMascotas(),
        ])

        setClientes(clientesRecibidos)
        setEspecies(especiesRecibidas)

        const mascotasAdaptadas = mascotasRecibidas.map(
          adaptarMascotaBackend
        )

        setMascotas(mascotasAdaptadas)
      } catch (error) {
        console.error('Error al cargar mascotas:', error)

        setErrorCarga(
          'No se pudieron cargar las mascotas. Verificá que el backend esté funcionando.'
        )
      } finally {
        setCargando(false)
      }
    }

    cargarDatos()
  }, [])

  const adaptarMascotaBackend = (mascota) => ({
    id: mascota.id,
    nombre: mascota.nombre,
    especieId: mascota.especie,
    raza: mascota.raza || '',
    fechaNacimiento: mascota.fecha_nacimiento || '',
    sexo: mascota.sexo || '',
    peso: mascota.peso ?? '',
    estado: mascota.estado || 'activo',
    alergias: mascota.alergias || '',
    grupoSanguineo: mascota.grupo_sanguineo || '',
    observaciones: mascota.observaciones_generales || '',
    clienteId: mascota.cliente,
  })

  const obtenerCliente = (clienteId) => {
    return clientes.find(
      (cliente) => cliente.id === Number(clienteId)
    )
  }

  const obtenerEspecie = (especieId) => {
    return especies.find(
      (especie) => especie.id === Number(especieId)
    )
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
      const especie = obtenerEspecie(mascota.especieId)

      const textoMascota = [
        mascota.nombre,
        especie?.nombre,
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
  }, [mascotas, busqueda, clientes, especies])

    const abrirNuevaMascota = () => {
    if (!puedeGestionarMascotas) {
      return
    }
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
    if (!puedeGestionarMascotas) {
      return
    }
    setFormulario({
      ...mascota,
      clienteId: mascota.clienteId ?? '',
      especieId: mascota.especieId ?? '',
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

    if (name === 'clienteId' || name === 'especieId') {
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

    if (!formulario.especieId) {
      return 'Seleccioná la especie de la mascota.'
    }

    if (!raza) {
      return 'Ingresá la raza de la mascota.'
    }

    if (raza.length < 2) {
      return 'La raza debe tener al menos 2 letras.'
    }

    if (!formulario.sexo) {
      return 'Seleccioná el sexo de la mascota.'
    }

    if (
      formulario.fechaNacimiento &&
      formulario.fechaNacimiento > fechaActual
    ) {
      return 'La fecha de nacimiento no puede ser posterior a la fecha actual.'
    }

    if (
      formulario.peso !== '' &&
      (!peso || peso <= 0)
    ) {
      return 'Ingresá un peso mayor a cero.'
    }

    return ''
  }

  const obtenerMensajeError = (error) => {
    const datos = error.response?.data

    if (!datos) {
      return 'No se pudo conectar con el servidor.'
    }

    const campos = {
      nombre: 'Nombre',
      raza: 'Raza',
      sexo: 'Sexo',
      peso: 'Peso',
      estado: 'Estado',
      cliente: 'Dueño',
      especie: 'Especie',
      fecha_nacimiento: 'Fecha de nacimiento',
      alergias: 'Alergias',
      grupo_sanguineo: 'Grupo sanguíneo',
      observaciones_generales: 'Observaciones',
    }

    for (const [campo, etiqueta] of Object.entries(campos)) {
      if (datos[campo]) {
        const mensaje = Array.isArray(datos[campo])
          ? datos[campo].join(' ')
          : datos[campo]

        return `${etiqueta}: ${mensaje}`
      }
    }

    if (datos.detail) {
      return datos.detail
    }

    return 'No se pudo guardar la mascota.'
  }

  const guardarMascota = async (evento) => {
  evento.preventDefault()

    if (!puedeGestionarMascotas) {
      setErrorFormulario(
        'Tu rol solamente puede consultar mascotas.',
      )
      return
    }

    const error = validarFormulario()

    if (error) {
      setErrorFormulario(error)
      return
    }

    const datosMascota = {
      nombre: formulario.nombre.trim(),
      fecha_nacimiento:
        formulario.fechaNacimiento || null,
      raza: formulario.raza.trim(),
      peso:
        formulario.peso === ''
          ? null
          : formulario.peso,
      sexo: formulario.sexo,
      estado: formulario.estado,
      alergias:
        formulario.alergias.trim() || null,
      grupo_sanguineo:
        formulario.grupoSanguineo.trim() || null,
      observaciones_generales:
        formulario.observaciones.trim() || null,
      cliente: Number(formulario.clienteId),
      especie: Number(formulario.especieId),
    }

    try {
      setGuardando(true)
      setErrorFormulario('')

      if (modoEdicion && mascotaSeleccionada) {
        const mascotaActualizada =
          await actualizarMascota(
            mascotaSeleccionada.id,
            datosMascota
          )

        const mascotaAdaptada =
          adaptarMascotaBackend(mascotaActualizada)

        setMascotas((mascotasAnteriores) =>
          mascotasAnteriores.map((mascota) =>
            mascota.id === mascotaSeleccionada.id
              ? mascotaAdaptada
              : mascota
          )
        )
      } else {
        const nuevaMascota =
          await crearMascota(datosMascota)

        const mascotaAdaptada =
          adaptarMascotaBackend(nuevaMascota)

        setMascotas((mascotasAnteriores) => [
          ...mascotasAnteriores,
          mascotaAdaptada,
        ])
      }

      cerrarPanel()
    } catch (errorGuardar) {
      console.error(
        'Error al guardar mascota:',
        errorGuardar
      )

      setErrorFormulario(
        obtenerMensajeError(errorGuardar)
      )
    } finally {
      setGuardando(false)
    }
  }

  const eliminarMascota = async (mascota) => {
    if (!puedeGestionarMascotas) {
      return
    }

    const confirmar = window.confirm(
      `¿Seguro que querés eliminar a ${mascota.nombre}?`
    )

    if (!confirmar) {
      return
    }

    try {
      await eliminarMascotaApi(mascota.id)

      setMascotas((mascotasAnteriores) =>
        mascotasAnteriores.filter(
          (item) => item.id !== mascota.id
        )
      )

      if (mascotaSeleccionada?.id === mascota.id) {
        cerrarPanel()
      }
    } catch (error) {
      console.error('Error al eliminar mascota:', error)

      window.alert(
        'No se pudo eliminar la mascota. Puede tener turnos, consultas, vacunas u otros registros relacionados.'
      )
    }
  }

  return (
    <section className="mascotas-page">
      <header className="mascotas-header">
        <div>
          <h1>Mascotas</h1>
          <p>Registro de mascotas y relación con sus dueños</p>
        </div>

        {puedeGestionarMascotas && (
  <button
    type="button"
    className="btn-nueva-mascota"
    onClick={abrirNuevaMascota}
  >
    <FaPlus />
    Nueva Mascota
  </button>
)}
      </header>

      {errorCarga && (
        <div className="mascota-form-error" role="alert">
          {errorCarga}
        </div>
      )}

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
                onChange={(evento) =>
                  setBusqueda(evento.target.value)
                }
                aria-label="Buscar mascotas"
              />
            </div>

            <span className="mascotas-total">
              {mascotasFiltradas.length}{' '}
              {mascotasFiltradas.length === 1
                ? 'mascota'
                : 'mascotas'}
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
                {cargando && (
                  <tr>
                    <td colSpan="6" className="sin-resultados">
                      Cargando mascotas...
                    </td>
                  </tr>
                )}

                {!cargando &&
                  mascotasFiltradas.map((mascota) => {
                    const cliente = obtenerCliente(
                      mascota.clienteId
                    )

                    const especie = obtenerEspecie(
                      mascota.especieId
                    )

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
                                {mascota.raza ||
                                  'Raza no registrada'}
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
                            {especie?.nombre ||
                              'Especie no encontrada'}
                          </span>
                        </td>

                        <td>
                          {mascota.sexo === 'macho'
                            ? 'Macho'
                            : mascota.sexo === 'hembra'
                              ? 'Hembra'
                              : 'No registrado'}
                        </td>

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
                              onClick={() =>
                                abrirVerMascota(mascota)
                              }
                              title="Ver mascota"
                              aria-label={`Ver a ${mascota.nombre}`}
                            >
                              <FaEye />
                            </button>

                            {puedeGestionarMascotas && (
  <>
    <button
      type="button"
      className="btn-accion editar"
      onClick={() =>
        abrirEditarMascota(mascota)
      }
      title="Editar mascota"
      aria-label={`Editar a ${mascota.nombre}`}
    >
      <FaPen />
    </button>

    <button
      type="button"
      className="btn-accion eliminar"
      onClick={() =>
        eliminarMascota(mascota)
      }
      title="Eliminar mascota"
      aria-label={`Eliminar a ${mascota.nombre}`}
    >
      <FaTrash />
    </button>
  </>
)}

                            <button
                              type="button"
                              className="btn-accion eliminar"
                              onClick={() =>
                                eliminarMascota(mascota)
                              }
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

                {!cargando &&
                  mascotasFiltradas.length === 0 && (
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
                  {modoEdicion
                    ? 'Editar Mascota'
                    : 'Nueva Mascota'}
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
                    disabled={guardando}
                  >
                    <option value="">
                      Seleccionar dueño
                    </option>

                    {clientes.map((cliente) => (
                      <option
                        key={cliente.id}
                        value={cliente.id}
                      >
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
                    disabled={guardando}
                  />

                  <label htmlFor="mascota-especie">
                    Especie <span>*</span>
                  </label>

                  <select
                    id="mascota-especie"
                    name="especieId"
                    value={formulario.especieId}
                    onChange={manejarCambio}
                    disabled={guardando}
                  >
                    <option value="">
                      Seleccionar especie
                    </option>

                    {especies.map((especie) => (
                      <option
                        key={especie.id}
                        value={especie.id}
                      >
                        {especie.nombre}
                      </option>
                    ))}
                  </select>

                  <label htmlFor="mascota-raza">
                    Raza <span>*</span>
                  </label>

                  <input
                    id="mascota-raza"
                    type="text"
                    name="raza"
                    value={formulario.raza}
                    onChange={manejarCambio}
                    maxLength={50}
                    placeholder="Ejemplo: Labrador"
                    autoComplete="off"
                    disabled={guardando}
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
                    disabled={guardando}
                  />

                  <label htmlFor="mascota-sexo">
                    Sexo <span>*</span>
                  </label>

                  <select
                    id="mascota-sexo"
                    name="sexo"
                    value={formulario.sexo}
                    onChange={manejarCambio}
                    disabled={guardando}
                  >
                    <option value="">
                      Seleccionar sexo
                    </option>
                    <option value="macho">Macho</option>
                    <option value="hembra">Hembra</option>
                  </select>

                  <label htmlFor="mascota-peso">
                    Peso en kilogramos
                  </label>

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
                    disabled={guardando}
                  />

                  <label htmlFor="mascota-estado">
                    Estado
                  </label>

                  <select
                    id="mascota-estado"
                    name="estado"
                    value={formulario.estado}
                    onChange={manejarCambio}
                    disabled={guardando}
                  >
                    <option value="activo">Activo</option>
                    <option value="fallecido">
                      Fallecido
                    </option>
                  </select>

                  <label htmlFor="mascota-alergias">
                    Alergias
                  </label>

                  <textarea
                    id="mascota-alergias"
                    name="alergias"
                    value={formulario.alergias}
                    onChange={manejarCambio}
                    maxLength={500}
                    placeholder="Ejemplo: alergia a determinado medicamento"
                    disabled={guardando}
                  />

                  <label htmlFor="mascota-grupo">
                    Grupo sanguíneo
                  </label>

                  <input
                    id="mascota-grupo"
                    type="text"
                    name="grupoSanguineo"
                    value={formulario.grupoSanguineo}
                    onChange={manejarCambio}
                    maxLength={50}
                    placeholder="Ejemplo: DEA 1.1"
                    autoComplete="off"
                    disabled={guardando}
                  />

                  <label htmlFor="mascota-observaciones">
                    Observaciones generales
                  </label>

                  <textarea
                    id="mascota-observaciones"
                    name="observaciones"
                    value={formulario.observaciones}
                    onChange={manejarCambio}
                    maxLength={500}
                    placeholder="Información adicional sobre la mascota"
                    disabled={guardando}
                  />

                  {errorFormulario && (
                    <div
                      className="mascota-form-error"
                      role="alert"
                    >
                      {errorFormulario}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn-guardar"
                    disabled={guardando}
                  >
                    <FaFloppyDisk />

                    {guardando
                      ? 'Guardando...'
                      : modoEdicion
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
                    <strong>
                      {mascotaSeleccionada.nombre}
                    </strong>

                    <span>
                      {obtenerEspecie(
                        mascotaSeleccionada.especieId
                      )?.nombre || 'Especie no encontrada'}

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
                      {obtenerCliente(
                        mascotaSeleccionada.clienteId
                      )
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
                    <strong>
                      {obtenerEspecie(
                        mascotaSeleccionada.especieId
                      )?.nombre || 'No registrada'}
                    </strong>
                  </div>

                  <div>
                    <span>Raza</span>
                    <strong>
                      {mascotaSeleccionada.raza ||
                        'No registrada'}
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
                      {mascotaSeleccionada.sexo === 'macho'
                        ? 'Macho'
                        : mascotaSeleccionada.sexo === 'hembra'
                          ? 'Hembra'
                          : 'No registrado'}
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
                    <span>Estado</span>
                    <strong>
                      {mascotaSeleccionada.estado ===
                      'fallecido'
                        ? 'Fallecido'
                        : 'Activo'}
                    </strong>
                  </div>

                  <div>
                    <span>Alergias</span>
                    <strong>
                      {mascotaSeleccionada.alergias ||
                        'Sin alergias registradas'}
                    </strong>
                  </div>

                  <div>
                    <span>Grupo sanguíneo</span>
                    <strong>
                      {mascotaSeleccionada.grupoSanguineo ||
                        'No registrado'}
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

                {puedeGestionarMascotas && (
  <button
    type="button"
    className="btn-editar-detalle"
    onClick={() =>
      abrirEditarMascota(
        mascotaSeleccionada
      )
    }
  >
    <FaPen />
    Editar Mascota
  </button>
)}
              </>
            )}
          </aside>
        )}
      </div>
    </section>
  )
}

export default Mascotas