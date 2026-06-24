import { useState } from 'react'
import {
  FaMagnifyingGlass,
  FaPlus,
  FaEye,
  FaPen,
  FaTrash,
  FaFloppyDisk,
  FaXmark,
  FaBoxesStacked,
} from 'react-icons/fa6'

import {
  productos as productosIniciales,
  stock as stockInicial,
} from '../data/mockData'

import './Stock.css'

const stockVacio = {
  productoId: '',
  cantidad: '',
  stockMinimo: '',
  ultimaActualizacion: '',
}

function obtenerEstadoStock(item) {
  if (Number(item.cantidad) === 0) {
    return 'Sin stock'
  }

  if (Number(item.cantidad) <= Number(item.stockMinimo)) {
    return 'Bajo stock'
  }

  return 'Correcto'
}

function Stock() {
  const [productos] = useState(productosIniciales)
  const [stock, setStock] = useState(stockInicial)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [stockSeleccionado, setStockSeleccionado] = useState(null)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [formulario, setFormulario] = useState(stockVacio)

  const obtenerProducto = (productoId) => {
    return productos.find((producto) => producto.id === productoId)
  }

  const productosSinStock = productos.filter((producto) => {
    return !stock.some((item) => item.productoId === producto.id)
  })

  const stockFiltrado = stock.filter((item) => {
    const producto = obtenerProducto(item.productoId)
    const estado = obtenerEstadoStock(item)

    const texto = `
      ${producto?.descripcion}
      ${producto?.categoria}
      ${item.cantidad}
      ${item.stockMinimo}
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
      cantidad: item.cantidad,
      stockMinimo: item.stockMinimo,
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

    setFormulario({
      ...formulario,
      [name]: name === 'productoId' ? Number(value) : value,
    })
  }

  const guardarStock = (e) => {
    e.preventDefault()

    if (
      !formulario.productoId ||
      formulario.cantidad === '' ||
      formulario.stockMinimo === '' ||
      !formulario.ultimaActualizacion
    ) {
      alert('Completá producto, cantidad, stock mínimo y fecha.')
      return
    }

    if (modoEdicion) {
      const stockActualizado = stock.map((item) => {
        if (item.id === stockSeleccionado.id) {
          return {
            id: stockSeleccionado.id,
            productoId: formulario.productoId,
            cantidad: Number(formulario.cantidad),
            stockMinimo: Number(formulario.stockMinimo),
            ultimaActualizacion: formulario.ultimaActualizacion,
          }
        }

        return item
      })

      setStock(stockActualizado)
    } else {
      const productoYaTieneStock = stock.some(
        (item) => item.productoId === formulario.productoId
      )

      if (productoYaTieneStock) {
        alert('Este producto ya tiene un registro de stock.')
        return
      }

      const nuevoStock = {
        id: Date.now(),
        productoId: formulario.productoId,
        cantidad: Number(formulario.cantidad),
        stockMinimo: Number(formulario.stockMinimo),
        ultimaActualizacion: formulario.ultimaActualizacion,
      }

      setStock([...stock, nuevoStock])
    }

    cerrarPanel()
  }

  const eliminarStock = (id) => {
    const confirmar = window.confirm(
      '¿Seguro que querés eliminar este registro de stock?'
    )

    if (!confirmar) return

    const stockActualizado = stock.filter((item) => item.id !== id)

    setStock(stockActualizado)

    if (stockSeleccionado?.id === id) {
      cerrarPanel()
    }
  }

  return (
    <section className="stock-page">
      <div className="stock-header">
        <div>
          <h1>Stock</h1>
          <p>Control de cantidades disponibles y stock mínimo</p>
        </div>

        <button className="btn-nuevo-stock" onClick={abrirNuevoStock}>
          <FaPlus />
          Nuevo Stock
        </button>
      </div>

      <div className="stock-content">
        <div className="stock-main-card">
          <div className="stock-toolbar">
            <div className="stock-search">
              <FaMagnifyingGlass />

              <input
                type="text"
                placeholder="Buscar por producto, categoría, cantidad o estado"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <span className="stock-total">{stockFiltrado.length} registros</span>
          </div>

          <div className="stock-table-wrapper">
            <table className="stock-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Cantidad</th>
                  <th>Stock mínimo</th>
                  <th>Actualización</th>
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

                      <td>{item.cantidad}</td>

                      <td>{item.stockMinimo}</td>

                      <td>{item.ultimaActualizacion}</td>

                      <td>
                        <span
                          className={
                            estado === 'Sin stock'
                              ? 'estado-stock sin-stock'
                              : estado === 'Bajo stock'
                                ? 'estado-stock bajo'
                                : 'estado-stock correcto'
                          }
                        >
                          {estado}
                        </span>
                      </td>

                      <td>
                        <div className="acciones">
                          <button
                            className="btn-accion ver"
                            onClick={() => abrirVerStock(item)}
                            title="Ver stock"
                          >
                            <FaEye />
                          </button>

                          <button
                            className="btn-accion editar"
                            onClick={() => abrirEditarStock(item)}
                            title="Editar stock"
                          >
                            <FaPen />
                          </button>

                          <button
                            className="btn-accion eliminar"
                            onClick={() => eliminarStock(item.id)}
                            title="Eliminar stock"
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
                    <td colSpan="7" className="sin-resultados">
                      No se encontraron registros de stock.
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
                <h2>{modoEdicion ? 'Editar Stock' : 'Nuevo Stock'}</h2>

                <p>
                  {modoEdicion
                    ? 'Modificá el stock del producto seleccionado'
                    : 'Registrá el stock inicial de un producto'}
                </p>

                <form className="stock-form" onSubmit={guardarStock}>
                  <label>Producto</label>
                  <select
                    name="productoId"
                    value={formulario.productoId}
                    onChange={manejarCambio}
                    disabled={modoEdicion}
                  >
                    <option value="">Seleccionar producto</option>

                    {(modoEdicion ? productos : productosSinStock).map(
                      (producto) => (
                        <option key={producto.id} value={producto.id}>
                          {producto.descripcion}
                        </option>
                      )
                    )}
                  </select>

                  <label>Cantidad disponible</label>
                  <input
                    type="number"
                    name="cantidad"
                    value={formulario.cantidad}
                    onChange={manejarCambio}
                  />

                  <label>Stock mínimo</label>
                  <input
                    type="number"
                    name="stockMinimo"
                    value={formulario.stockMinimo}
                    onChange={manejarCambio}
                  />

                  <label>Última actualización</label>
                  <input
                    type="date"
                    name="ultimaActualizacion"
                    value={formulario.ultimaActualizacion}
                    onChange={manejarCambio}
                  />

                  <button type="submit" className="btn-guardar">
                    <FaFloppyDisk />
                    Guardar Stock
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2>Detalle de Stock</h2>
                <p>Información del producto en inventario</p>

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
                    <span>Cantidad disponible</span>
                    <strong>{stockSeleccionado.cantidad}</strong>
                  </div>

                  <div>
                    <span>Stock mínimo</span>
                    <strong>{stockSeleccionado.stockMinimo}</strong>
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

                <button
                  className="btn-editar-detalle"
                  onClick={() => abrirEditarStock(stockSeleccionado)}
                >
                  <FaPen />
                  Editar Stock
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