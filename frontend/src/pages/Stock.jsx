import { useEffect, useMemo, useState } from 'react'
import {
  FaMagnifyingGlass,
  FaPlus,
  FaEye,
  FaPen,
  FaTrash,
  FaFloppyDisk,
  FaXmark,
  FaBoxesStacked,
  FaTriangleExclamation,
} from 'react-icons/fa6'

import {
  obtenerProductos,
} from '../services/productosService'

import {
  obtenerLotesStock,
  crearLoteStock,
  editarLoteStock,
  eliminarLoteStock,
} from '../services/lotesStockService'

import { soloNumeros } from '../utils/validaciones'
import { crearAlertaSistema } from '../utils/alertasSistema'

import './Stock.css'

const stockVacio = {
  productoId: '',
  lote: '',
  cantidad: '',
  stockMinimo: '',
  fechaVencimiento: '',
}

function normalizarLista(datos) {
  if (Array.isArray(datos)) return datos
  if (Array.isArray(datos?.results)) return datos.results
  return []
}

function normalizarFecha(fecha) {
  if (!fecha) return ''
  return String(fecha).slice(0, 10)
}

function obtenerDiasParaVencer(fechaVencimiento) {
  if (!fechaVencimiento) return null

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const vencimiento = new Date(`${fechaVencimiento}T00:00:00`)
  vencimiento.setHours(0, 0, 0, 0)

  if (Number.isNaN(vencimiento.getTime())) return null

  const diferencia = vencimiento - hoy

  return Math.ceil(diferencia / (1000 * 60 * 60 * 24))
}

function productoRequiereVencimiento(producto) {
  const categoria = producto?.categoria?.toLowerCase() || ''

  return [
    'medicamento',
    'vacuna',
    'alimento',
    'higiene',
    'antiparasitario',
  ].includes(categoria)
}

function formatearFecha(fecha) {
  if (!fecha) return 'Sin vencimiento'

  const fechaNormalizada = normalizarFecha(fecha)
  const fechaLocal = new Date(`${fechaNormalizada}T00:00:00`)

  if (Number.isNaN(fechaLocal.getTime())) return fechaNormalizada

  return fechaLocal.toLocaleDateString('es-AR')
}

function formatearFechaHora(fecha) {
  if (!fecha) return 'Sin información'

  const fechaLocal = new Date(fecha)

  if (Number.isNaN(fechaLocal.getTime())) {
    return formatearFecha(fecha)
  }

  return fechaLocal.toLocaleString('es-AR')
}

function Stock() {
  const [productos, setProductos] = useState([])
  const [stock, setStock] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [stockSeleccionado, setStockSeleccionado] = useState(null)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [formulario, setFormulario] = useState(stockVacio)
  const [alertaStock, setAlertaStock] = useState(null)
  const [errorFormulario, setErrorFormulario] = useState('')
  const [cargando, setCargando] = useState(true)

  const obtenerProducto = (productoId) => {
    return productos.find(
      (producto) => producto.id === Number(productoId)
    )
  }

  const obtenerStockTotalProducto = (productoId) => {
    return stock
      .filter((item) => item.productoId === Number(productoId))
      .reduce(
        (total, item) => total + Number(item.cantidad || 0),
        0
      )
  }

  const obtenerEstadoStock = (item) => {
    const diasParaVencer = obtenerDiasParaVencer(
      item.fechaVencimiento
    )

    if (diasParaVencer !== null && diasParaVencer < 0) {
      return 'Vencido'
    }

    if (diasParaVencer !== null && diasParaVencer <= 30) {
      return 'Próximo a vencer'
    }

    if (Number(item.cantidad) === 0) {
      return 'Sin stock'
    }

    const stockTotal = obtenerStockTotalProducto(item.productoId)

    if (stockTotal <= Number(item.stockMinimo || 0)) {
      return 'Bajo stock'
    }

    return 'Correcto'
  }

  const cargarDatos = async () => {
    try {
      setCargando(true)

      const [productosRespuesta, lotesRespuesta] = await Promise.all([
        obtenerProductos(),
        obtenerLotesStock(),
      ])

      const productosAPI = normalizarLista(productosRespuesta)
      const lotesAPI = normalizarLista(lotesRespuesta)

      const productosConvertidos = productosAPI.map((producto) => ({
        id: producto.id,
        descripcion: producto.descripcion,
        categoria: producto.categoria,
        tipoProducto: producto.tipo_producto,
        stockMinimo: Number(producto.stock_minimo ?? 0),
        stockActual: Number(producto.stock_actual ?? 0),
        estado: producto.estado === 'activo',
      }))

      const productosPorId = new Map(
        productosConvertidos.map((producto) => [
          producto.id,
          producto,
        ])
      )

      const lotesConvertidos = lotesAPI.map((lote) => {
        const productoId = Number(lote.producto)
        const producto = productosPorId.get(productoId)

        return {
          id: lote.id,
          productoId,
          lote: lote.numero_lote || '',
          cantidad: Number(lote.cantidad_disponible ?? 0),
          stockMinimo: Number(producto?.stockMinimo ?? 0),
          fechaVencimiento: normalizarFecha(
            lote.fecha_vencimiento
          ),
          costoUnitario: Number(lote.costo_unitario ?? 0),
          fechaIngreso: lote.fecha_ingreso || '',
          ultimaActualizacion:
            lote.ultima_actualizacion || lote.fecha_ingreso || '',
        }
      })

      setProductos(productosConvertidos)
      setStock(lotesConvertidos)
    } catch (error) {
      console.error('Error al cargar el stock:', error)

      window.alert(
        error.response?.data?.detail ||
          'No se pudieron cargar los productos y lotes.'
      )
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const stockFiltrado = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()

    return stock.filter((item) => {
      const producto = productos.find(
        (productoActual) =>
          productoActual.id === Number(item.productoId)
      )

      const estado = obtenerEstadoStock(item)

      const texto = `
        ${producto?.descripcion || ''}
        ${producto?.categoria || ''}
        ${item.lote}
        ${item.cantidad}
        ${item.stockMinimo}
        ${item.fechaVencimiento}
        ${item.ultimaActualizacion}
        ${estado}
      `.toLowerCase()

      return texto.includes(termino)
    })
  }, [busqueda, stock, productos])

  const abrirNuevoStock = () => {
    setFormulario(stockVacio)
    setStockSeleccionado(null)
    setModoEdicion(false)
    setErrorFormulario('')
    setMostrarFormulario(true)
  }

  const abrirVerStock = (item) => {
    setStockSeleccionado(item)
    setMostrarFormulario(false)
    setModoEdicion(false)
    setErrorFormulario('')
  }

  const abrirEditarStock = (item) => {
    setFormulario({
      productoId: item.productoId,
      lote: item.lote || '',
      cantidad: String(item.cantidad ?? ''),
      stockMinimo: String(item.stockMinimo ?? ''),
      fechaVencimiento: item.fechaVencimiento || '',
    })

    setStockSeleccionado(item)
    setModoEdicion(true)
    setErrorFormulario('')
    setMostrarFormulario(true)
  }

  const cerrarPanel = () => {
    setFormulario(stockVacio)
    setStockSeleccionado(null)
    setMostrarFormulario(false)
    setModoEdicion(false)
    setErrorFormulario('')
  }

  const manejarCambio = (e) => {
    const { name, value } = e.target

    if (name === 'productoId') {
      const producto = obtenerProducto(value)

      setFormulario((formularioActual) => ({
        ...formularioActual,
        productoId: value ? Number(value) : '',
        stockMinimo: producto
          ? String(producto.stockMinimo ?? 0)
          : '',
      }))

      if (errorFormulario) setErrorFormulario('')
      return
    }

    let nuevoValor = value

    if (name === 'cantidad') {
      nuevoValor = soloNumeros(value)
    }

    setFormulario((formularioActual) => ({
      ...formularioActual,
      [name]: nuevoValor,
    }))

    if (errorFormulario) setErrorFormulario('')
  }

  const validarFormulario = () => {
    const producto = obtenerProducto(formulario.productoId)

    if (!formulario.productoId) {
      return 'Seleccioná un producto.'
    }

    if (!formulario.lote.trim()) {
      return 'Ingresá el número de lote.'
    }

    if (formulario.cantidad === '') {
      return 'Ingresá la cantidad disponible.'
    }

    if (Number(formulario.cantidad) < 0) {
      return 'La cantidad no puede ser negativa.'
    }

    if (
      productoRequiereVencimiento(producto) &&
      !formulario.fechaVencimiento
    ) {
      return 'Este producto requiere fecha de vencimiento por lote.'
    }

    const loteRepetido = stock.some((item) => {
      if (modoEdicion && item.id === stockSeleccionado?.id) {
        return false
      }

      return (
        item.productoId === Number(formulario.productoId) &&
        item.lote.trim().toLowerCase() ===
          formulario.lote.trim().toLowerCase()
      )
    })

    if (loteRepetido) {
      return 'Ese lote ya está cargado para este producto.'
    }

    return ''
  }

  const guardarStock = async (e) => {
    e.preventDefault()

    const error = validarFormulario()

    if (error) {
      setErrorFormulario(error)
      return
    }

    const datosLote = {
      producto: Number(formulario.productoId),
      numero_lote: formulario.lote.trim().toUpperCase(),
      cantidad_disponible: Number(formulario.cantidad),
      fecha_vencimiento: formulario.fechaVencimiento || null,
    }

    try {
      setErrorFormulario('')

      if (modoEdicion && stockSeleccionado) {
        await editarLoteStock(stockSeleccionado.id, datosLote)
      } else {
        await crearLoteStock(datosLote)
      }

      await cargarDatos()
      cerrarPanel()
    } catch (errorGuardar) {
      console.error('Error al guardar el lote:', errorGuardar)

      setErrorFormulario(
        errorGuardar.response?.data?.detail ||
          Object.values(errorGuardar.response?.data || {})
            .flat()
            .join(' ') ||
          'No se pudo guardar el lote.'
      )
    }
  }

  const eliminarStock = async (id) => {
    const confirmar = window.confirm(
      '¿Seguro que querés eliminar este lote de stock?'
    )

    if (!confirmar) return

    try {
      await eliminarLoteStock(id)
      await cargarDatos()

      if (stockSeleccionado?.id === id) {
        cerrarPanel()
      }
    } catch (error) {
      console.error('Error al eliminar el lote:', error)

      window.alert(
        error.response?.data?.detail ||
          'No se pudo eliminar el lote.'
      )
    }
  }

  const obtenerClaseEstado = (estado) => {
    if (estado === 'Vencido') return 'estado-stock vencido'
    if (estado === 'Próximo a vencer') {
      return 'estado-stock proximo'
    }
    if (estado === 'Sin stock') return 'estado-stock sin-stock'
    if (estado === 'Bajo stock') return 'estado-stock bajo'

    return 'estado-stock correcto'
  }

  const cerrarAlertaStock = () => {
    setAlertaStock(null)
  }

  useEffect(() => {
    if (cargando) return

    const itemsCriticos = stock
      .map((item) => ({
        item,
        producto: obtenerProducto(item.productoId),
        estado: obtenerEstadoStock(item),
        diasParaVencer: obtenerDiasParaVencer(
          item.fechaVencimiento
        ),
      }))
      .filter(
        ({ estado }) =>
          estado === 'Vencido' ||
          estado === 'Próximo a vencer' ||
          estado === 'Sin stock' ||
          estado === 'Bajo stock'
      )

    itemsCriticos.forEach(
      ({ item, producto, estado, diasParaVencer }) => {
        let titulo = ''
        let mensaje = ''

        if (estado === 'Vencido') {
          titulo = 'Lote vencido'
          mensaje =
            `El lote ${item.lote} del producto ` +
            `${producto?.descripcion || 'sin identificar'} ` +
            'está vencido. No debería venderse ni utilizarse.'
        }

        if (estado === 'Próximo a vencer') {
          titulo = 'Lote próximo a vencer'
          mensaje =
            `El lote ${item.lote} del producto ` +
            `${producto?.descripcion || 'sin identificar'} ` +
            `vence en ${diasParaVencer} días.`
        }

        if (estado === 'Sin stock') {
          titulo = 'Producto sin stock'
          mensaje =
            `El lote ${item.lote} del producto ` +
            `${producto?.descripcion || 'sin identificar'} ` +
            'no tiene unidades disponibles.'
        }

        if (estado === 'Bajo stock') {
          titulo = 'Stock bajo'
          mensaje =
            `El producto ` +
            `${producto?.descripcion || 'sin identificar'} ` +
            'alcanzó el nivel mínimo de stock.'
        }

        crearAlertaSistema({
          clave:
            `stock-${estado.toLowerCase().replaceAll(' ', '-')}-` +
            `${item.id}`,
          titulo,
          mensaje,
          origen: 'Stock',
          cliente: 'Control interno',
          telefono: '',
          mascota: producto?.descripcion || '',
        })
      }
    )

    const masUrgente =
      itemsCriticos.find(({ estado }) => estado === 'Vencido') ||
      itemsCriticos.find(({ estado }) => estado === 'Sin stock') ||
      itemsCriticos.find(
        ({ estado }) => estado === 'Próximo a vencer'
      ) ||
      itemsCriticos.find(({ estado }) => estado === 'Bajo stock')

    if (!masUrgente) {
      setAlertaStock(null)
      return
    }

    const { item, producto, estado, diasParaVencer } = masUrgente

    let mensaje = ''

    if (estado === 'Vencido') {
      mensaje =
        `El lote ${item.lote} del producto ` +
        `${producto?.descripcion || 'sin identificar'} está vencido.`
    } else if (estado === 'Sin stock') {
      mensaje =
        `El lote ${item.lote} del producto ` +
        `${producto?.descripcion || 'sin identificar'} ` +
        'no tiene unidades disponibles.'
    } else if (estado === 'Próximo a vencer') {
      mensaje =
        `El lote ${item.lote} del producto ` +
        `${producto?.descripcion || 'sin identificar'} ` +
        `vence en ${diasParaVencer} días.`
    } else {
      mensaje =
        `El producto ` +
        `${producto?.descripcion || 'sin identificar'} ` +
        'está en stock mínimo.'
    }

    setAlertaStock({
      tipo: estado,
      mensaje,
      producto,
      item,
    })
  }, [stock, productos, cargando])

  const productoFormulario = obtenerProducto(formulario.productoId)
  const diasFormulario = obtenerDiasParaVencer(
    formulario.fechaVencimiento
  )
  const estadoSeleccionado = stockSeleccionado
    ? obtenerEstadoStock(stockSeleccionado)
    : null

  return (
    <section className="stock-page">
      <div className="stock-header">
        <div>
          <h1>Stock</h1>
          <p>Control de stock por lotes, cantidades y vencimientos</p>
        </div>

        <button
          type="button"
          className="btn-nuevo-stock"
          onClick={abrirNuevoStock}
        >
          <FaPlus />
          Nuevo Lote
        </button>
      </div>

      {alertaStock && (
        <div className="alerta-stock">
          <div className="alerta-stock-icono">
            <FaTriangleExclamation />
          </div>

          <div className="alerta-stock-contenido">
            <strong>{alertaStock.tipo}</strong>
            <p>{alertaStock.mensaje}</p>
            <small>
              Producto:{' '}
              {alertaStock.producto?.descripcion || 'Sin identificar'} ·
              Lote: {alertaStock.item?.lote}
            </small>
          </div>

          <button
            type="button"
            className="btn-cerrar-alerta-stock"
            onClick={cerrarAlertaStock}
            aria-label="Cerrar alerta"
          >
            <FaXmark />
          </button>
        </div>
      )}

      <div className="stock-content">
        <div className="stock-main-card">
          <div className="stock-toolbar">
            <div className="stock-search">
              <FaMagnifyingGlass />

              <input
                type="text"
                placeholder="Buscar por producto, categoría, lote, vencimiento o estado"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <span className="stock-total">
              {stockFiltrado.length}{' '}
              {stockFiltrado.length === 1 ? 'lote' : 'lotes'}
            </span>
          </div>

          <div className="stock-table-wrapper">
            <table className="stock-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Lote</th>
                  <th>Cantidad</th>
                  <th>Stock mínimo</th>
                  <th>Vencimiento</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {cargando && (
                  <tr>
                    <td colSpan="8" className="sin-resultados">
                      Cargando stock...
                    </td>
                  </tr>
                )}

                {!cargando &&
                  stockFiltrado.map((item) => {
                    const producto = obtenerProducto(item.productoId)
                    const estado = obtenerEstadoStock(item)

                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="stock-producto">
                            <div className="stock-icono">
                              <FaBoxesStacked />
                            </div>

                            <div>
                              <strong>
                                {producto?.descripcion ||
                                  'Producto no encontrado'}
                              </strong>
                              <small>
                                ID producto: {producto?.id || '—'}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td>
                          {producto?.categoria || 'Sin categoría'}
                        </td>
                        <td>{item.lote}</td>
                        <td>{item.cantidad}</td>
                        <td>{item.stockMinimo}</td>
                        <td>
                          {formatearFecha(item.fechaVencimiento)}
                        </td>

                        <td>
                          <span className={obtenerClaseEstado(estado)}>
                            {estado}
                          </span>
                        </td>

                        <td>
                          <div className="acciones">
                            <button
                              type="button"
                              className="btn-accion ver"
                              onClick={() => abrirVerStock(item)}
                              title="Ver lote"
                              aria-label="Ver lote"
                            >
                              <FaEye />
                            </button>

                            <button
                              type="button"
                              className="btn-accion editar"
                              onClick={() => abrirEditarStock(item)}
                              title="Editar lote"
                              aria-label="Editar lote"
                            >
                              <FaPen />
                            </button>

                            <button
                              type="button"
                              className="btn-accion eliminar"
                              onClick={() => eliminarStock(item.id)}
                              title="Eliminar lote"
                              aria-label="Eliminar lote"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}

                {!cargando && stockFiltrado.length === 0 && (
                  <tr>
                    <td colSpan="8" className="sin-resultados">
                      No se encontraron lotes de stock.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {(mostrarFormulario || stockSeleccionado) && (
          <aside className="stock-side-card">
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
                <h2>{modoEdicion ? 'Editar Lote' : 'Nuevo Lote'}</h2>

                <p>
                  {modoEdicion
                    ? 'Modificá los datos del lote seleccionado'
                    : 'Registrá un nuevo lote de producto'}
                </p>

                <form className="stock-form" onSubmit={guardarStock}>
                  {errorFormulario && (
                    <div className="stock-form-error" role="alert">
                      <FaTriangleExclamation />
                      <span>{errorFormulario}</span>
                    </div>
                  )}

                  <label htmlFor="productoId">Producto</label>
                  <select
                    id="productoId"
                    name="productoId"
                    value={formulario.productoId}
                    onChange={manejarCambio}
                    disabled={modoEdicion}
                  >
                    <option value="">Seleccionar producto</option>

                    {productos.map((producto) => (
                      <option key={producto.id} value={producto.id}>
                        {producto.descripcion}
                      </option>
                    ))}
                  </select>

                  <label htmlFor="lote">Número de lote</label>
                  <input
                    id="lote"
                    type="text"
                    name="lote"
                    value={formulario.lote}
                    onChange={manejarCambio}
                    placeholder="Ej: LOTE-2026-A"
                  />

                  <label htmlFor="cantidad">Cantidad disponible</label>
                  <input
                    id="cantidad"
                    type="text"
                    inputMode="numeric"
                    name="cantidad"
                    value={formulario.cantidad}
                    onChange={manejarCambio}
                    placeholder="Ej: 25"
                  />

                  <label htmlFor="stockMinimo">Stock mínimo</label>
                  <input
                    id="stockMinimo"
                    type="text"
                    name="stockMinimo"
                    value={formulario.stockMinimo}
                    readOnly
                  />
                  <small>
                    El stock mínimo se modifica desde la pantalla Productos.
                  </small>

                  <label htmlFor="fechaVencimiento">
                    Fecha de vencimiento
                    {productoRequiereVencimiento(productoFormulario) &&
                      ' *'}
                  </label>
                  <input
                    id="fechaVencimiento"
                    type="date"
                    name="fechaVencimiento"
                    value={formulario.fechaVencimiento}
                    onChange={manejarCambio}
                  />

                  {formulario.fechaVencimiento &&
                    diasFormulario !== null &&
                    diasFormulario <= 30 && (
                      <div className="aviso-vencimiento-form">
                        <FaTriangleExclamation />
                        <div>
                          <strong>Atención con este vencimiento</strong>
                          <span>
                            {diasFormulario < 0
                              ? 'El lote ya está vencido.'
                              : diasFormulario === 0
                                ? 'El lote vence hoy.'
                                : `El lote vence en ${diasFormulario} días.`}
                          </span>
                        </div>
                      </div>
                    )}

                  <button type="submit" className="btn-guardar">
                    <FaFloppyDisk />
                    {modoEdicion ? 'Guardar Cambios' : 'Guardar Lote'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2>Detalle de Lote</h2>
                <p>Información del lote en inventario</p>

                <div className="stock-detalle">
                  <div>
                    <span>Producto</span>
                    <strong>
                      {obtenerProducto(stockSeleccionado.productoId)
                        ?.descripcion || 'Producto no encontrado'}
                    </strong>
                  </div>

                  <div>
                    <span>Categoría</span>
                    <strong>
                      {obtenerProducto(stockSeleccionado.productoId)
                        ?.categoria || 'Sin categoría'}
                    </strong>
                  </div>

                  <div>
                    <span>Lote</span>
                    <strong>{stockSeleccionado.lote}</strong>
                  </div>

                  <div>
                    <span>Cantidad disponible</span>
                    <strong>{stockSeleccionado.cantidad}</strong>
                  </div>

                  <div>
                    <span>Stock total del producto</span>
                    <strong>
                      {obtenerStockTotalProducto(
                        stockSeleccionado.productoId
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Stock mínimo</span>
                    <strong>{stockSeleccionado.stockMinimo}</strong>
                  </div>

                  <div>
                    <span>Fecha de vencimiento</span>
                    <strong>
                      {formatearFecha(
                        stockSeleccionado.fechaVencimiento
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Última actualización</span>
                    <strong>
                      {formatearFechaHora(
                        stockSeleccionado.ultimaActualizacion
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Estado</span>
                    <span
                      className={obtenerClaseEstado(estadoSeleccionado)}
                    >
                      {estadoSeleccionado}
                    </span>
                  </div>
                </div>

                {(estadoSeleccionado === 'Vencido' ||
                  estadoSeleccionado === 'Próximo a vencer') && (
                  <div className="aviso-vencimiento-form">
                    <FaTriangleExclamation />
                    <div>
                      <strong>Control de vencimiento</strong>
                      <span>
                        Este lote debe controlarse antes de utilizarlo o
                        venderlo.
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  className="btn-editar-detalle"
                  onClick={() => abrirEditarStock(stockSeleccionado)}
                >
                  <FaPen />
                  Editar Lote
                </button>
              </>
            )}
          </aside>
        )}
      </div>
    </section>
  )
}

export default Stock