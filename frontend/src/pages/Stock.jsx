import { useEffect, useState } from 'react'
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
  productos as productosIniciales,
  stock as stockInicial,
} from '../data/mockData'

import { soloNumeros } from '../utils/validaciones'
import { crearAlertaSistema } from '../utils/alertasSistema'

import './Stock.css'

const stockVacio = {
  productoId: '',
  lote: '',
  cantidad: '',
  stockMinimo: '',
  fechaVencimiento: '',
  ultimaActualizacion: '',
}

function normalizarStockInicial(stock) {
  return stock.map((item) => ({
    ...item,
    lote: item.lote || `LOTE-${item.id}`,
    fechaVencimiento: item.fechaVencimiento || '',
  }))
}

function obtenerDiasParaVencer(fechaVencimiento) {
  if (!fechaVencimiento) return null

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const vencimiento = new Date(`${fechaVencimiento}T00:00:00`)
  vencimiento.setHours(0, 0, 0, 0)

  const diferencia = vencimiento - hoy

  return Math.ceil(diferencia / (1000 * 60 * 60 * 24))
}

function obtenerEstadoStock(item) {
  const diasParaVencer = obtenerDiasParaVencer(item.fechaVencimiento)

  if (diasParaVencer !== null && diasParaVencer < 0) {
    return 'Vencido'
  }

  if (diasParaVencer !== null && diasParaVencer <= 30) {
    return 'Próximo a vencer'
  }

  if (Number(item.cantidad) === 0) {
    return 'Sin stock'
  }

  if (Number(item.cantidad) <= Number(item.stockMinimo)) {
    return 'Bajo stock'
  }

  return 'Correcto'
}

function productoRequiereVencimiento(producto) {
  const categoria = producto?.categoria?.toLowerCase() || ''
  const tipoProducto = producto?.tipoProducto?.toLowerCase() || ''

  return (
    categoria === 'medicamento' ||
    categoria === 'vacuna' ||
    categoria === 'alimento' ||
    categoria === 'higiene' ||
    tipoProducto === 'medicamento' ||
    tipoProducto === 'vacuna'
  )
}

function Stock() {
  const [productos] = useState(productosIniciales)
  const [stock, setStock] = useState(normalizarStockInicial(stockInicial))
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [stockSeleccionado, setStockSeleccionado] = useState(null)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [formulario, setFormulario] = useState(stockVacio)
  const [alertaStock, setAlertaStock] = useState(null)

  const obtenerProducto = (productoId) => {
    return productos.find((producto) => producto.id === productoId)
  }

  const stockFiltrado = stock.filter((item) => {
    const producto = obtenerProducto(item.productoId)
    const estado = obtenerEstadoStock(item)

    const texto = `
      ${producto?.descripcion}
      ${producto?.categoria}
      ${item.lote}
      ${item.cantidad}
      ${item.stockMinimo}
      ${item.fechaVencimiento}
      ${item.ultimaActualizacion}
      ${estado}
    `.toLowerCase()

    return texto.includes(busqueda.toLowerCase())
  })

  const abrirNuevoStock = () => {
    setFormulario(stockVacio)
    setStockSeleccionado(null)
    setModoEdicion(false)
    setMostrarFormulario(true)
  }

  const abrirVerStock = (item) => {
    setStockSeleccionado(item)
    setMostrarFormulario(false)
    setModoEdicion(false)
  }

  const abrirEditarStock = (item) => {
    setFormulario({
      productoId: item.productoId,
      lote: item.lote || '',
      cantidad: item.cantidad,
      stockMinimo: item.stockMinimo,
      fechaVencimiento: item.fechaVencimiento || '',
      ultimaActualizacion: item.ultimaActualizacion,
    })

    setStockSeleccionado(item)
    setModoEdicion(true)
    setMostrarFormulario(true)
  }

  const cerrarPanel = () => {
    setFormulario(stockVacio)
    setStockSeleccionado(null)
    setMostrarFormulario(false)
    setModoEdicion(false)
  }

  const manejarCambio = (e) => {
    const { name, value } = e.target

    let nuevoValor = value

    if (name === 'cantidad' || name === 'stockMinimo') {
      nuevoValor = soloNumeros(value)
    }

    setFormulario({
      ...formulario,
      [name]: name === 'productoId' ? Number(value) : nuevoValor,
    })
  }

  const guardarStock = (e) => {
    e.preventDefault()

    const producto = obtenerProducto(formulario.productoId)

    if (
      !formulario.productoId ||
      !formulario.lote ||
      formulario.cantidad === '' ||
      formulario.stockMinimo === '' ||
      !formulario.ultimaActualizacion
    ) {
      alert('Completá producto, lote, cantidad, stock mínimo y fecha de actualización.')
      return
    }

    if (Number(formulario.cantidad) < 0 || Number(formulario.stockMinimo) < 0) {
      alert('La cantidad y el stock mínimo no pueden ser negativos.')
      return
    }

    if (productoRequiereVencimiento(producto) && !formulario.fechaVencimiento) {
      alert('Este producto requiere fecha de vencimiento por lote.')
      return
    }

    const loteRepetido = stock.some((item) => {
      if (modoEdicion && item.id === stockSeleccionado.id) {
        return false
      }

      return (
        item.productoId === formulario.productoId &&
        item.lote.toLowerCase() === formulario.lote.toLowerCase()
      )
    })

    if (loteRepetido) {
      alert('Ese lote ya está cargado para este producto.')
      return
    }

    if (modoEdicion) {
      const stockActualizado = stock.map((item) => {
        if (item.id === stockSeleccionado.id) {
          return {
            id: stockSeleccionado.id,
            productoId: formulario.productoId,
            lote: formulario.lote,
            cantidad: Number(formulario.cantidad),
            stockMinimo: Number(formulario.stockMinimo),
            fechaVencimiento: formulario.fechaVencimiento,
            ultimaActualizacion: formulario.ultimaActualizacion,
          }
        }

        return item
      })

      setStock(stockActualizado)
    } else {
      const nuevoStock = {
        id: Date.now(),
        productoId: formulario.productoId,
        lote: formulario.lote,
        cantidad: Number(formulario.cantidad),
        stockMinimo: Number(formulario.stockMinimo),
        fechaVencimiento: formulario.fechaVencimiento,
        ultimaActualizacion: formulario.ultimaActualizacion,
      }

      setStock([...stock, nuevoStock])
    }

    cerrarPanel()
  }

  const eliminarStock = (id) => {
    const confirmar = window.confirm(
      '¿Seguro que querés eliminar este lote de stock?'
    )

    if (!confirmar) return

    const stockActualizado = stock.filter((item) => item.id !== id)

    setStock(stockActualizado)

    if (stockSeleccionado?.id === id) {
      cerrarPanel()
    }
  }

  const obtenerClaseEstado = (estado) => {
    if (estado === 'Vencido') return 'estado-stock vencido'
    if (estado === 'Próximo a vencer') return 'estado-stock proximo'
    if (estado === 'Sin stock') return 'estado-stock sin-stock'
    if (estado === 'Bajo stock') return 'estado-stock bajo'

    return 'estado-stock correcto'
  }

  const cerrarAlertaStock = () => {
    setAlertaStock(null)
  }

  useEffect(() => {
    stock.forEach((item) => {
      const producto = obtenerProducto(item.productoId)
      const diasParaVencer = obtenerDiasParaVencer(item.fechaVencimiento)

      if (diasParaVencer === null) return

      if (diasParaVencer < 0) {
        const mensaje = `El lote ${item.lote} del producto ${producto?.descripcion} está vencido. No debería venderse ni utilizarse.`

        crearAlertaSistema({
          clave: `stock-vencido-${item.id}`,
          titulo: 'Lote vencido',
          mensaje,
          origen: 'Stock',
          cliente: 'Control interno',
          telefono: '',
          mascota: producto?.descripcion || '',
        })

        setAlertaStock({
          tipo: 'Lote vencido',
          mensaje,
          producto,
          item,
        })
      }

      if (diasParaVencer >= 0 && diasParaVencer <= 30) {
        const mensaje = `El lote ${item.lote} del producto ${producto?.descripcion} vence en ${diasParaVencer} días.`

        crearAlertaSistema({
          clave: `stock-proximo-vencer-${item.id}`,
          titulo: 'Lote próximo a vencer',
          mensaje,
          origen: 'Stock',
          cliente: 'Control interno',
          telefono: '',
          mascota: producto?.descripcion || '',
        })

        setAlertaStock({
          tipo: 'Lote próximo a vencer',
          mensaje,
          producto,
          item,
        })
      }
    })
  }, [stock])

  return (
    <section className="stock-page">
      <div className="stock-header">
        <div>
          <h1>Stock</h1>
          <p>Control de stock por lotes, cantidades y vencimientos</p>
        </div>

        <button className="btn-nuevo-stock" onClick={abrirNuevoStock}>
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
              Producto: {alertaStock.producto?.descripcion} | Lote:{' '}
              {alertaStock.item?.lote}
            </small>
          </div>

          <button
            type="button"
            className="btn-cerrar-alerta-stock"
            onClick={cerrarAlertaStock}
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

            <span className="stock-total">{stockFiltrado.length} lotes</span>
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
                {stockFiltrado.map((item) => {
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
                            <strong>{producto?.descripcion}</strong>
                            <small>ID producto: {producto?.id}</small>
                          </div>
                        </div>
                      </td>

                      <td>{producto?.categoria}</td>

                      <td>{item.lote}</td>

                      <td>{item.cantidad}</td>

                      <td>{item.stockMinimo}</td>

                      <td>{item.fechaVencimiento || 'Sin vencimiento'}</td>

                      <td>
                        <span className={obtenerClaseEstado(estado)}>
                          {estado}
                        </span>
                      </td>

                      <td>
                        <div className="acciones">
                          <button
                            className="btn-accion ver"
                            onClick={() => abrirVerStock(item)}
                            title="Ver lote"
                          >
                            <FaEye />
                          </button>

                          <button
                            className="btn-accion editar"
                            onClick={() => abrirEditarStock(item)}
                            title="Editar lote"
                          >
                            <FaPen />
                          </button>

                          <button
                            className="btn-accion eliminar"
                            onClick={() => eliminarStock(item.id)}
                            title="Eliminar lote"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {stockFiltrado.length === 0 && (
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
            <button className="btn-cerrar" onClick={cerrarPanel}>
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
                  <label>Producto</label>
                  <select
                    name="productoId"
                    value={formulario.productoId}
                    onChange={manejarCambio}
                  >
                    <option value="">Seleccionar producto</option>

                    {productos.map((producto) => (
                      <option key={producto.id} value={producto.id}>
                        {producto.descripcion}
                      </option>
                    ))}
                  </select>

                  <label>Número de lote</label>
                  <input
                    type="text"
                    name="lote"
                    value={formulario.lote}
                    onChange={manejarCambio}
                    placeholder="Ej: LOTE-2026-A"
                  />

                  <label>Cantidad disponible</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="cantidad"
                    value={formulario.cantidad}
                    onChange={manejarCambio}
                  />

                  <label>Stock mínimo</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="stockMinimo"
                    value={formulario.stockMinimo}
                    onChange={manejarCambio}
                  />

                  <label>Fecha de vencimiento</label>
                  <input
                    type="date"
                    name="fechaVencimiento"
                    value={formulario.fechaVencimiento}
                    onChange={manejarCambio}
                  />

                  <label>Última actualización</label>
                  <input
                    type="date"
                    name="ultimaActualizacion"
                    value={formulario.ultimaActualizacion}
                    onChange={manejarCambio}
                  />

                  {formulario.fechaVencimiento &&
                    obtenerDiasParaVencer(formulario.fechaVencimiento) <= 30 && (
                      <div className="aviso-vencimiento-form">
                        <FaTriangleExclamation />
                        <div>
                          <strong>Atención con este vencimiento</strong>
                          <span>
                            El lote está vencido o próximo a vencer.
                          </span>
                        </div>
                      </div>
                    )}

                  <button type="submit" className="btn-guardar">
                    <FaFloppyDisk />
                    Guardar Lote
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
                        ?.descripcion}
                    </strong>
                  </div>

                  <div>
                    <span>Categoría</span>
                    <strong>
                      {obtenerProducto(stockSeleccionado.productoId)?.categoria}
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
                    <span>Stock mínimo</span>
                    <strong>{stockSeleccionado.stockMinimo}</strong>
                  </div>

                  <div>
                    <span>Fecha de vencimiento</span>
                    <strong>
                      {stockSeleccionado.fechaVencimiento || 'Sin vencimiento'}
                    </strong>
                  </div>

                  <div>
                    <span>Última actualización</span>
                    <strong>{stockSeleccionado.ultimaActualizacion}</strong>
                  </div>

                  <div>
                    <span>Estado</span>
                    <strong>{obtenerEstadoStock(stockSeleccionado)}</strong>
                  </div>
                </div>

                {(obtenerEstadoStock(stockSeleccionado) === 'Vencido' ||
                  obtenerEstadoStock(stockSeleccionado) ===
                    'Próximo a vencer') && (
                  <div className="aviso-vencimiento-form">
                    <FaTriangleExclamation />
                    <div>
                      <strong>Control de vencimiento</strong>
                      <span>
                        Este lote está vencido o próximo a vencer. Debe
                        controlarse antes de utilizarlo o venderlo.
                      </span>
                    </div>
                  </div>
                )}

                <button
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