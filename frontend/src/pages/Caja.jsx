import { useEffect, useMemo, useState } from 'react'
import {
  FaArrowTrendDown,
  FaArrowTrendUp,
  FaCashRegister,
  FaEye,
  FaFloppyDisk,
  FaMagnifyingGlass,
  FaPlus,
  FaReceipt,
  FaScaleBalanced,
  FaTrash,
  FaTriangleExclamation,
  FaWallet,
  FaXmark,
} from 'react-icons/fa6'

import {
  crearCierreCaja,
  crearMovimientoCaja,
  eliminarCierreCaja,
  eliminarMovimientoCaja,
  obtenerCierresCaja,
  obtenerMovimientosCaja,
} from '../services/cajaService'

import { soloNumerosDecimales } from '../utils/validaciones'
import './Caja.css'

const movimientoVacio = {
  tipoMovimiento: 'ingreso',
  motivo: 'ajuste_manual',
  descripcion: '',
  monto: '',
}

const cierreVacio = {
  saldoInicial: '0',
  observaciones: '',
}

const formatoDinero = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

const etiquetasMotivo = {
  venta: 'Venta',
  compra: 'Compra',
  servicio_clinico: 'Servicio clínico',
  ajuste_manual: 'Ajuste manual',
}

function normalizarLista(respuesta) {
  if (Array.isArray(respuesta)) {
    return respuesta
  }

  if (Array.isArray(respuesta?.results)) {
    return respuesta.results
  }

  return []
}

function formatearFechaHora(fecha) {
  if (!fecha) return 'Sin fecha'

  const fechaConvertida = new Date(fecha)

  if (Number.isNaN(fechaConvertida.getTime())) {
    return fecha
  }

  return fechaConvertida.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function fechaParaFiltro(fecha) {
  if (!fecha) return ''

  return String(fecha).slice(0, 10)
}

function obtenerMensajeError(error, mensajePredeterminado) {
  const datos = error.response?.data

  if (typeof datos?.detail === 'string') {
    return datos.detail
  }

  if (typeof datos === 'string') {
    return datos
  }

  if (datos && typeof datos === 'object') {
    const mensajes = Object.values(datos)
      .flatMap((valor) => (Array.isArray(valor) ? valor : [valor]))
      .filter(Boolean)
      .map(String)

    if (mensajes.length > 0) {
      return mensajes.join(' ')
    }
  }

  return mensajePredeterminado
}

function Caja() {
  const [movimientos, setMovimientos] = useState([])
  const [cierres, setCierres] = useState([])
  const [seccionActiva, setSeccionActiva] = useState('movimientos')
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroMotivo, setFiltroMotivo] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [mostrarFormularioMovimiento, setMostrarFormularioMovimiento] =
    useState(false)
  const [mostrarFormularioCierre, setMostrarFormularioCierre] = useState(false)
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState(null)
  const [cierreSeleccionado, setCierreSeleccionado] = useState(null)
  const [formularioMovimiento, setFormularioMovimiento] =
    useState(movimientoVacio)
  const [formularioCierre, setFormularioCierre] = useState(cierreVacio)
  const [mensaje, setMensaje] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const mostrarMensaje = (texto, tipo = 'error') => {
    setMensaje({ texto, tipo })
  }

  const limpiarMensaje = () => {
    setMensaje(null)
  }

  const cargarDatos = async () => {
    try {
      setCargando(true)

      const [respuestaMovimientos, respuestaCierres] = await Promise.all([
        obtenerMovimientosCaja(),
        obtenerCierresCaja(),
      ])

      setMovimientos(normalizarLista(respuestaMovimientos))
      setCierres(normalizarLista(respuestaCierres))
    } catch (error) {
      console.error('Error al cargar la caja:', error)
      mostrarMensaje(
        obtenerMensajeError(
          error,
          'No se pudieron cargar los movimientos de caja.'
        )
      )
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const resumen = useMemo(() => {
    const ingresos = movimientos
      .filter((movimiento) => movimiento.tipo_movimiento === 'ingreso')
      .reduce((total, movimiento) => total + Number(movimiento.monto || 0), 0)

    const egresos = movimientos
      .filter((movimiento) => movimiento.tipo_movimiento === 'egreso')
      .reduce((total, movimiento) => total + Number(movimiento.monto || 0), 0)

    return {
      ingresos,
      egresos,
      saldo: ingresos - egresos,
      cantidad: movimientos.length,
    }
  }, [movimientos])

  const movimientosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()

    return movimientos.filter((movimiento) => {
      const fechaMovimiento = fechaParaFiltro(movimiento.fecha)
      const coincideTipo =
        !filtroTipo || movimiento.tipo_movimiento === filtroTipo
      const coincideMotivo = !filtroMotivo || movimiento.motivo === filtroMotivo
      const coincideDesde = !fechaDesde || fechaMovimiento >= fechaDesde
      const coincideHasta = !fechaHasta || fechaMovimiento <= fechaHasta

      const texto = `
        ${movimiento.id}
        ${movimiento.descripcion || ''}
        ${movimiento.monto || ''}
        ${movimiento.tipo_movimiento || ''}
        ${movimiento.tipo_movimiento_nombre || ''}
        ${movimiento.motivo || ''}
        ${movimiento.motivo_nombre || ''}
        ${movimiento.usuario_nombre || ''}
        ${movimiento.fecha || ''}
      `.toLowerCase()

      return (
        coincideTipo &&
        coincideMotivo &&
        coincideDesde &&
        coincideHasta &&
        texto.includes(termino)
      )
    })
  }, [
    busqueda,
    fechaDesde,
    fechaHasta,
    filtroMotivo,
    filtroTipo,
    movimientos,
  ])

  const cierresFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()

    return cierres.filter((cierre) => {
      const fechaCierre = fechaParaFiltro(cierre.fecha_cierre)
      const coincideDesde = !fechaDesde || fechaCierre >= fechaDesde
      const coincideHasta = !fechaHasta || fechaCierre <= fechaHasta

      const texto = `
        ${cierre.id}
        ${cierre.fecha_cierre || ''}
        ${cierre.saldo_inicial || ''}
        ${cierre.ingresos || ''}
        ${cierre.egresos || ''}
        ${cierre.saldo_final || ''}
        ${cierre.observaciones || ''}
        ${cierre.usuario_nombre || ''}
      `.toLowerCase()

      return coincideDesde && coincideHasta && texto.includes(termino)
    })
  }, [busqueda, cierres, fechaDesde, fechaHasta])

  const cerrarPaneles = () => {
    setMostrarFormularioMovimiento(false)
    setMostrarFormularioCierre(false)
    setMovimientoSeleccionado(null)
    setCierreSeleccionado(null)
    setFormularioMovimiento(movimientoVacio)
    setFormularioCierre(cierreVacio)
  }

  const abrirNuevoMovimiento = () => {
    limpiarMensaje()
    setSeccionActiva('movimientos')
    setMovimientoSeleccionado(null)
    setCierreSeleccionado(null)
    setMostrarFormularioCierre(false)
    setFormularioMovimiento(movimientoVacio)
    setMostrarFormularioMovimiento(true)
  }

  const abrirNuevoCierre = () => {
    limpiarMensaje()
    setSeccionActiva('cierres')
    setMovimientoSeleccionado(null)
    setCierreSeleccionado(null)
    setMostrarFormularioMovimiento(false)
    setFormularioCierre(cierreVacio)
    setMostrarFormularioCierre(true)
  }

  const abrirDetalleMovimiento = (movimiento) => {
    limpiarMensaje()
    setMostrarFormularioMovimiento(false)
    setMostrarFormularioCierre(false)
    setCierreSeleccionado(null)
    setMovimientoSeleccionado(movimiento)
  }

  const abrirDetalleCierre = (cierre) => {
    limpiarMensaje()
    setMostrarFormularioMovimiento(false)
    setMostrarFormularioCierre(false)
    setMovimientoSeleccionado(null)
    setCierreSeleccionado(cierre)
  }

  const manejarCambioMovimiento = (evento) => {
    const { name, value } = evento.target
    limpiarMensaje()

    let nuevoValor = value

    if (name === 'monto') {
      nuevoValor = soloNumerosDecimales(value)
    }

    setFormularioMovimiento((formularioActual) => {
      const siguiente = {
        ...formularioActual,
        [name]: nuevoValor,
      }

      if (name === 'motivo' && value === 'compra') {
        siguiente.tipoMovimiento = 'egreso'
      }

      return siguiente
    })
  }

  const manejarCambioCierre = (evento) => {
    const { name, value } = evento.target
    limpiarMensaje()

    setFormularioCierre((formularioActual) => ({
      ...formularioActual,
      [name]:
        name === 'saldoInicial' ? soloNumerosDecimales(value) : value,
    }))
  }

  const guardarMovimiento = async (evento) => {
    evento.preventDefault()

    if (!formularioMovimiento.descripcion.trim()) {
      mostrarMensaje('Ingresá una descripción para el movimiento.')
      return
    }

    if (!formularioMovimiento.monto || Number(formularioMovimiento.monto) <= 0) {
      mostrarMensaje('Ingresá un monto mayor que cero.')
      return
    }

    try {
      setGuardando(true)
      limpiarMensaje()

      await crearMovimientoCaja({
        tipo_movimiento: formularioMovimiento.tipoMovimiento,
        motivo: formularioMovimiento.motivo,
        descripcion: formularioMovimiento.descripcion.trim(),
        monto: formularioMovimiento.monto,
      })

      await cargarDatos()
      cerrarPaneles()
      mostrarMensaje('Movimiento registrado correctamente.', 'exito')
    } catch (error) {
      console.error('Error al guardar el movimiento:', error)
      mostrarMensaje(
        obtenerMensajeError(error, 'No se pudo registrar el movimiento.')
      )
    } finally {
      setGuardando(false)
    }
  }

  const guardarCierre = async (evento) => {
    evento.preventDefault()

    if (
      formularioCierre.saldoInicial === '' ||
      Number(formularioCierre.saldoInicial) < 0
    ) {
      mostrarMensaje('El saldo inicial no puede ser negativo.')
      return
    }

    try {
      setGuardando(true)
      limpiarMensaje()

      const cierreCreado = await crearCierreCaja({
        saldo_inicial: formularioCierre.saldoInicial || 0,
        observaciones: formularioCierre.observaciones.trim(),
      })

      await cargarDatos()
      cerrarPaneles()
      setSeccionActiva('cierres')
      setCierreSeleccionado(cierreCreado)
      mostrarMensaje('Cierre de caja registrado correctamente.', 'exito')
    } catch (error) {
      console.error('Error al registrar el cierre:', error)
      mostrarMensaje(
        obtenerMensajeError(error, 'No se pudo registrar el cierre de caja.')
      )
    } finally {
      setGuardando(false)
    }
  }

  const movimientoPuedeEliminarse = (movimiento) => {
    return movimiento.motivo === 'ajuste_manual' || movimiento.motivo === 'compra'
  }

  const eliminarMovimiento = async (movimiento) => {
    if (!movimientoPuedeEliminarse(movimiento)) {
      mostrarMensaje(
        'Los movimientos automáticos de ventas o servicios no se eliminan desde Caja.'
      )
      return
    }

    const confirmar = window.confirm(
      '¿Seguro que querés eliminar este movimiento de caja?'
    )

    if (!confirmar) return

    try {
      await eliminarMovimientoCaja(movimiento.id)
      await cargarDatos()

      if (movimientoSeleccionado?.id === movimiento.id) {
        cerrarPaneles()
      }

      mostrarMensaje('Movimiento eliminado correctamente.', 'exito')
    } catch (error) {
      console.error('Error al eliminar el movimiento:', error)
      mostrarMensaje(
        obtenerMensajeError(error, 'No se pudo eliminar el movimiento.')
      )
    }
  }

  const eliminarCierre = async (cierre) => {
    const confirmar = window.confirm(
      '¿Seguro que querés eliminar este cierre de caja?'
    )

    if (!confirmar) return

    try {
      await eliminarCierreCaja(cierre.id)
      await cargarDatos()

      if (cierreSeleccionado?.id === cierre.id) {
        cerrarPaneles()
      }

      mostrarMensaje('Cierre eliminado correctamente.', 'exito')
    } catch (error) {
      console.error('Error al eliminar el cierre:', error)
      mostrarMensaje(obtenerMensajeError(error, 'No se pudo eliminar el cierre.'))
    }
  }

  const limpiarFiltros = () => {
    setBusqueda('')
    setFiltroTipo('')
    setFiltroMotivo('')
    setFechaDesde('')
    setFechaHasta('')
  }

  const panelAbierto =
    mostrarFormularioMovimiento ||
    mostrarFormularioCierre ||
    movimientoSeleccionado ||
    cierreSeleccionado

  return (
    <section className="caja-page">
      <div className="caja-header">
        <div>
          <h1>Caja</h1>
          <p>Ingresos, egresos, movimientos automáticos y cierres de caja</p>
        </div>

        <div className="caja-header-acciones">
          <button
            type="button"
            className="btn-nuevo-cierre"
            onClick={abrirNuevoCierre}
          >
            <FaScaleBalanced />
            Nuevo Cierre
          </button>

          <button
            type="button"
            className="btn-nuevo-movimiento"
            onClick={abrirNuevoMovimiento}
          >
            <FaPlus />
            Nuevo Movimiento
          </button>
        </div>
      </div>

      {mensaje && (
        <div
          className={`mensaje-caja ${mensaje.tipo}`}
          role={mensaje.tipo === 'error' ? 'alert' : 'status'}
        >
          <div className="mensaje-caja-icono">
            {mensaje.tipo === 'exito' ? <FaReceipt /> : <FaTriangleExclamation />}
          </div>

          <span>{mensaje.texto}</span>

          <button type="button" onClick={limpiarMensaje} aria-label="Cerrar mensaje">
            <FaXmark />
          </button>
        </div>
      )}

      <div className="caja-resumen">
        <article className="caja-resumen-card saldo">
          <div className="caja-resumen-icono">
            <FaWallet />
          </div>
          <div>
            <span>Saldo actual</span>
            <strong>{formatoDinero.format(resumen.saldo)}</strong>
          </div>
        </article>

        <article className="caja-resumen-card ingreso">
          <div className="caja-resumen-icono">
            <FaArrowTrendUp />
          </div>
          <div>
            <span>Ingresos</span>
            <strong>{formatoDinero.format(resumen.ingresos)}</strong>
          </div>
        </article>

        <article className="caja-resumen-card egreso">
          <div className="caja-resumen-icono">
            <FaArrowTrendDown />
          </div>
          <div>
            <span>Egresos</span>
            <strong>{formatoDinero.format(resumen.egresos)}</strong>
          </div>
        </article>

        <article className="caja-resumen-card cantidad">
          <div className="caja-resumen-icono">
            <FaCashRegister />
          </div>
          <div>
            <span>Movimientos</span>
            <strong>{resumen.cantidad}</strong>
          </div>
        </article>
      </div>

      <div className={`caja-content ${panelAbierto ? 'con-panel' : ''}`}>
        <div className="caja-main-card">
          <div className="caja-tabs">
            <button
              type="button"
              className={seccionActiva === 'movimientos' ? 'activo' : ''}
              onClick={() => {
                setSeccionActiva('movimientos')
                cerrarPaneles()
              }}
            >
              Movimientos
              <span>{movimientos.length}</span>
            </button>

            <button
              type="button"
              className={seccionActiva === 'cierres' ? 'activo' : ''}
              onClick={() => {
                setSeccionActiva('cierres')
                cerrarPaneles()
              }}
            >
              Cierres
              <span>{cierres.length}</span>
            </button>
          </div>

          <div className="caja-toolbar">
            <div className="caja-search">
              <FaMagnifyingGlass />
              <input
                type="text"
                placeholder={
                  seccionActiva === 'movimientos'
                    ? 'Buscar por descripción, motivo, usuario o monto'
                    : 'Buscar por fecha, observaciones, usuario o saldo'
                }
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
              />
            </div>

            {seccionActiva === 'movimientos' && (
              <>
                <select
                  value={filtroTipo}
                  onChange={(evento) => setFiltroTipo(evento.target.value)}
                  aria-label="Filtrar por tipo"
                >
                  <option value="">Todos los tipos</option>
                  <option value="ingreso">Ingresos</option>
                  <option value="egreso">Egresos</option>
                </select>

                <select
                  value={filtroMotivo}
                  onChange={(evento) => setFiltroMotivo(evento.target.value)}
                  aria-label="Filtrar por motivo"
                >
                  <option value="">Todos los motivos</option>
                  <option value="venta">Venta</option>
                  <option value="compra">Compra</option>
                  <option value="servicio_clinico">Servicio clínico</option>
                  <option value="ajuste_manual">Ajuste manual</option>
                </select>
              </>
            )}

            <input
              className="caja-filtro-fecha"
              type="date"
              value={fechaDesde}
              onChange={(evento) => setFechaDesde(evento.target.value)}
              title="Fecha desde"
              aria-label="Fecha desde"
            />

            <input
              className="caja-filtro-fecha"
              type="date"
              value={fechaHasta}
              onChange={(evento) => setFechaHasta(evento.target.value)}
              title="Fecha hasta"
              aria-label="Fecha hasta"
            />

            <button
              type="button"
              className="btn-limpiar-filtros"
              onClick={limpiarFiltros}
            >
              Limpiar
            </button>
          </div>

          {cargando ? (
            <div className="caja-cargando">Cargando información de caja...</div>
          ) : seccionActiva === 'movimientos' ? (
            <div className="caja-table-wrapper">
              <table className="caja-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Motivo</th>
                    <th>Descripción</th>
                    <th>Usuario</th>
                    <th>Monto</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {movimientosFiltrados.map((movimiento) => (
                    <tr key={movimiento.id}>
                      <td>
                        <div className="caja-fecha">
                          <div
                            className={`caja-fecha-icono ${movimiento.tipo_movimiento}`}
                          >
                            {movimiento.tipo_movimiento === 'ingreso' ? (
                              <FaArrowTrendUp />
                            ) : (
                              <FaArrowTrendDown />
                            )}
                          </div>
                          <div>
                            <strong>{formatearFechaHora(movimiento.fecha)}</strong>
                            <small>ID {movimiento.id}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`tipo-movimiento ${movimiento.tipo_movimiento}`}
                        >
                          {movimiento.tipo_movimiento_nombre ||
                            (movimiento.tipo_movimiento === 'ingreso'
                              ? 'Ingreso'
                              : 'Egreso')}
                        </span>
                      </td>

                      <td>
                        {movimiento.motivo_nombre ||
                          etiquetasMotivo[movimiento.motivo] ||
                          movimiento.motivo}
                      </td>

                      <td className="caja-descripcion">
                        {movimiento.descripcion}
                      </td>

                      <td>
                        {movimiento.usuario_nombre?.trim() ||
                          `Usuario ${movimiento.usuario || ''}`}
                      </td>

                      <td
                        className={`caja-monto ${movimiento.tipo_movimiento}`}
                      >
                        {movimiento.tipo_movimiento === 'egreso' ? '- ' : '+ '}
                        {formatoDinero.format(Number(movimiento.monto || 0))}
                      </td>

                      <td>
                        <div className="caja-acciones">
                          <button
                            type="button"
                            className="btn-caja-accion ver"
                            onClick={() => abrirDetalleMovimiento(movimiento)}
                            title="Ver movimiento"
                            aria-label="Ver movimiento"
                          >
                            <FaEye />
                          </button>

                          {movimientoPuedeEliminarse(movimiento) && (
                            <button
                              type="button"
                              className="btn-caja-accion eliminar"
                              onClick={() => eliminarMovimiento(movimiento)}
                              title="Eliminar movimiento"
                              aria-label="Eliminar movimiento"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {movimientosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan="7" className="caja-sin-resultados">
                        No se encontraron movimientos de caja.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="caja-table-wrapper">
              <table className="caja-table cierres-table">
                <thead>
                  <tr>
                    <th>Fecha de cierre</th>
                    <th>Saldo inicial</th>
                    <th>Ingresos</th>
                    <th>Egresos</th>
                    <th>Saldo final</th>
                    <th>Usuario</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {cierresFiltrados.map((cierre) => (
                    <tr key={cierre.id}>
                      <td>
                        <div className="caja-fecha">
                          <div className="caja-fecha-icono cierre">
                            <FaScaleBalanced />
                          </div>
                          <div>
                            <strong>{formatearFechaHora(cierre.fecha_cierre)}</strong>
                            <small>Cierre #{cierre.id}</small>
                          </div>
                        </div>
                      </td>

                      <td>{formatoDinero.format(Number(cierre.saldo_inicial || 0))}</td>
                      <td className="caja-monto ingreso">
                        {formatoDinero.format(Number(cierre.ingresos || 0))}
                      </td>
                      <td className="caja-monto egreso">
                        {formatoDinero.format(Number(cierre.egresos || 0))}
                      </td>
                      <td className="caja-monto saldo-final">
                        {formatoDinero.format(Number(cierre.saldo_final || 0))}
                      </td>
                      <td>
                        {cierre.usuario_nombre?.trim() ||
                          `Usuario ${cierre.usuario || ''}`}
                      </td>

                      <td>
                        <div className="caja-acciones">
                          <button
                            type="button"
                            className="btn-caja-accion ver"
                            onClick={() => abrirDetalleCierre(cierre)}
                            title="Ver cierre"
                            aria-label="Ver cierre"
                          >
                            <FaEye />
                          </button>

                          <button
                            type="button"
                            className="btn-caja-accion eliminar"
                            onClick={() => eliminarCierre(cierre)}
                            title="Eliminar cierre"
                            aria-label="Eliminar cierre"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {cierresFiltrados.length === 0 && (
                    <tr>
                      <td colSpan="7" className="caja-sin-resultados">
                        No se encontraron cierres de caja.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {panelAbierto && (
          <aside className="caja-side-card">
            <button
              type="button"
              className="caja-btn-cerrar"
              onClick={cerrarPaneles}
              aria-label="Cerrar panel"
            >
              <FaXmark />
            </button>

            {mostrarFormularioMovimiento && (
              <>
                <h2>Nuevo Movimiento</h2>
                <p>Registrá una compra o un ajuste manual de caja</p>

                <form className="caja-form" onSubmit={guardarMovimiento}>
                  <label htmlFor="caja-tipo">Tipo de movimiento</label>
                  <select
                    id="caja-tipo"
                    name="tipoMovimiento"
                    value={formularioMovimiento.tipoMovimiento}
                    onChange={manejarCambioMovimiento}
                    disabled={formularioMovimiento.motivo === 'compra'}
                  >
                    <option value="ingreso">Ingreso</option>
                    <option value="egreso">Egreso</option>
                  </select>

                  <label htmlFor="caja-motivo">Motivo</label>
                  <select
                    id="caja-motivo"
                    name="motivo"
                    value={formularioMovimiento.motivo}
                    onChange={manejarCambioMovimiento}
                  >
                    <option value="compra">Compra</option>
                    <option value="ajuste_manual">Ajuste manual</option>
                  </select>

                  <small className="caja-ayuda-form">
                    Las ventas y los servicios clínicos se registran automáticamente.
                  </small>

                  <label htmlFor="caja-descripcion">Descripción</label>
                  <textarea
                    id="caja-descripcion"
                    name="descripcion"
                    value={formularioMovimiento.descripcion}
                    onChange={manejarCambioMovimiento}
                    placeholder="Ej: Compra de insumos de limpieza"
                    rows="4"
                  />

                  <label htmlFor="caja-monto">Monto</label>
                  <input
                    id="caja-monto"
                    type="text"
                    inputMode="decimal"
                    name="monto"
                    value={formularioMovimiento.monto}
                    onChange={manejarCambioMovimiento}
                    placeholder="Ej: 25000"
                  />

                  <button
                    type="submit"
                    className="btn-guardar-caja"
                    disabled={guardando}
                  >
                    <FaFloppyDisk />
                    {guardando ? 'Guardando...' : 'Guardar Movimiento'}
                  </button>
                </form>
              </>
            )}

            {mostrarFormularioCierre && (
              <>
                <h2>Nuevo Cierre</h2>
                <p>Registrá el cierre con el saldo inicial informado</p>

                <div className="caja-aviso-cierre">
                  <FaTriangleExclamation />
                  <span>
                    Este cierre calcula los ingresos y egresos acumulados que existen
                    actualmente en el sistema.
                  </span>
                </div>

                <form className="caja-form" onSubmit={guardarCierre}>
                  <label htmlFor="cierre-saldo-inicial">Saldo inicial</label>
                  <input
                    id="cierre-saldo-inicial"
                    type="text"
                    inputMode="decimal"
                    name="saldoInicial"
                    value={formularioCierre.saldoInicial}
                    onChange={manejarCambioCierre}
                    placeholder="Ej: 10000"
                  />

                  <label htmlFor="cierre-observaciones">Observaciones</label>
                  <textarea
                    id="cierre-observaciones"
                    name="observaciones"
                    value={formularioCierre.observaciones}
                    onChange={manejarCambioCierre}
                    placeholder="Ej: Cierre del turno mañana"
                    rows="5"
                  />

                  <div className="caja-previa-cierre">
                    <div>
                      <span>Ingresos actuales</span>
                      <strong>{formatoDinero.format(resumen.ingresos)}</strong>
                    </div>
                    <div>
                      <span>Egresos actuales</span>
                      <strong>{formatoDinero.format(resumen.egresos)}</strong>
                    </div>
                    <div>
                      <span>Saldo estimado</span>
                      <strong>
                        {formatoDinero.format(
                          Number(formularioCierre.saldoInicial || 0) +
                            resumen.ingresos -
                            resumen.egresos
                        )}
                      </strong>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-guardar-caja"
                    disabled={guardando}
                  >
                    <FaScaleBalanced />
                    {guardando ? 'Registrando...' : 'Registrar Cierre'}
                  </button>
                </form>
              </>
            )}

            {movimientoSeleccionado && (
              <>
                <h2>Detalle del Movimiento</h2>
                <p>Información registrada en caja</p>

                <div className="caja-detalle">
                  <div>
                    <span>Fecha</span>
                    <strong>{formatearFechaHora(movimientoSeleccionado.fecha)}</strong>
                  </div>

                  <div>
                    <span>Tipo</span>
                    <span
                      className={`tipo-movimiento ${movimientoSeleccionado.tipo_movimiento}`}
                    >
                      {movimientoSeleccionado.tipo_movimiento_nombre ||
                        (movimientoSeleccionado.tipo_movimiento === 'ingreso'
                          ? 'Ingreso'
                          : 'Egreso')}
                    </span>
                  </div>

                  <div>
                    <span>Motivo</span>
                    <strong>
                      {movimientoSeleccionado.motivo_nombre ||
                        etiquetasMotivo[movimientoSeleccionado.motivo] ||
                        movimientoSeleccionado.motivo}
                    </strong>
                  </div>

                  <div>
                    <span>Descripción</span>
                    <strong>{movimientoSeleccionado.descripcion}</strong>
                  </div>

                  <div>
                    <span>Monto</span>
                    <strong
                      className={`caja-monto ${movimientoSeleccionado.tipo_movimiento}`}
                    >
                      {formatoDinero.format(
                        Number(movimientoSeleccionado.monto || 0)
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Usuario</span>
                    <strong>
                      {movimientoSeleccionado.usuario_nombre?.trim() ||
                        `Usuario ${movimientoSeleccionado.usuario || ''}`}
                    </strong>
                  </div>
                </div>

                {!movimientoPuedeEliminarse(movimientoSeleccionado) && (
                  <div className="caja-aviso-automatico">
                    <FaReceipt />
                    <span>
                      Este movimiento fue generado automáticamente y no se elimina
                      desde Caja.
                    </span>
                  </div>
                )}

                {movimientoPuedeEliminarse(movimientoSeleccionado) && (
                  <button
                    type="button"
                    className="btn-eliminar-caja"
                    onClick={() => eliminarMovimiento(movimientoSeleccionado)}
                  >
                    <FaTrash />
                    Eliminar Movimiento
                  </button>
                )}
              </>
            )}

            {cierreSeleccionado && (
              <>
                <h2>Detalle del Cierre</h2>
                <p>Resumen registrado al momento del cierre</p>

                <div className="caja-detalle">
                  <div>
                    <span>Fecha del cierre</span>
                    <strong>{formatearFechaHora(cierreSeleccionado.fecha_cierre)}</strong>
                  </div>

                  <div>
                    <span>Saldo inicial</span>
                    <strong>
                      {formatoDinero.format(
                        Number(cierreSeleccionado.saldo_inicial || 0)
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Ingresos</span>
                    <strong className="caja-monto ingreso">
                      {formatoDinero.format(Number(cierreSeleccionado.ingresos || 0))}
                    </strong>
                  </div>

                  <div>
                    <span>Egresos</span>
                    <strong className="caja-monto egreso">
                      {formatoDinero.format(Number(cierreSeleccionado.egresos || 0))}
                    </strong>
                  </div>

                  <div>
                    <span>Saldo final</span>
                    <strong className="caja-monto saldo-final">
                      {formatoDinero.format(
                        Number(cierreSeleccionado.saldo_final || 0)
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Usuario</span>
                    <strong>
                      {cierreSeleccionado.usuario_nombre?.trim() ||
                        `Usuario ${cierreSeleccionado.usuario || ''}`}
                    </strong>
                  </div>

                  <div className="caja-detalle-ancho">
                    <span>Observaciones</span>
                    <strong>
                      {cierreSeleccionado.observaciones || 'Sin observaciones'}
                    </strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-eliminar-caja"
                  onClick={() => eliminarCierre(cierreSeleccionado)}
                >
                  <FaTrash />
                  Eliminar Cierre
                </button>
              </>
            )}
          </aside>
        )}
      </div>
    </section>
  )
}

export default Caja