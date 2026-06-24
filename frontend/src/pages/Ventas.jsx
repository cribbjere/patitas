import { useState } from 'react'
import {
  FaMagnifyingGlass,
  FaPlus,
  FaEye,
  FaTrash,
  FaFloppyDisk,
  FaXmark,
  FaCashRegister,
  FaCartShopping,
} from 'react-icons/fa6'

import {
  clientes as clientesIniciales,
  productos as productosIniciales,
  stock as stockInicial,
  ventas as ventasIniciales,
} from '../data/mockData'

import './Ventas.css'

const ventaVacia = {
  clienteId: '',
  fecha: '',
  metodoPago: 'Efectivo',
  estado: 'Completada',
  productoId: '',
  cantidad: 1,
}

function Ventas() {
  const [clientes] = useState(clientesIniciales)
  const [productos] = useState(productosIniciales)
  const [stock, setStock] = useState(stockInicial)
  const [ventas, setVentas] = useState(
    ventasIniciales.map((venta) => ({
      ...venta,
      metodoPago: venta.metodoPago || 'Efectivo',
      estado: venta.estado || 'Completada',
    }))
  )

  const [detallesVentas, setDetallesVentas] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null)
  const [formulario, setFormulario] = useState(ventaVacia)
  const [carrito, setCarrito] = useState([])

  const formatoDinero = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  })

  const obtenerCliente = (clienteId) => {
    return clientes.find((cliente) => cliente.id === clienteId)
  }

  const obtenerProducto = (productoId) => {
    return productos.find((producto) => producto.id === productoId)
  }

  const obtenerStock = (productoId) => {
    return stock.find((item) => item.productoId === productoId)
  }

  const obtenerDetallesVenta = (ventaId) => {
    return detallesVentas.filter((detalle) => detalle.ventaId === ventaId)
  }

  const obtenerCantidadProductos = (ventaId) => {
    const detalles = obtenerDetallesVenta(ventaId)

    if (detalles.length === 0) {
      return 'Sin detalle'
    }

    return `${detalles.length} producto/s`
  }

  const totalCarrito = carrito.reduce((total, item) => total + item.subtotal, 0)

  const ventasFiltradas = ventas.filter((venta) => {
    const cliente = obtenerCliente(venta.clienteId)

    const texto = `
      ${venta.fecha}
      ${venta.total}
      ${venta.metodoPago}
      ${venta.estado}
      ${cliente?.nombre}
      ${cliente?.apellido}
    `.toLowerCase()

    return texto.includes(busqueda.toLowerCase())
  })

  const abrirNuevaVenta = () => {
    setFormulario(ventaVacia)
    setCarrito([])
    setVentaSeleccionada(null)
    setMostrarFormulario(true)
  }

  const abrirVerVenta = (venta) => {
    setVentaSeleccionada(venta)
    setMostrarFormulario(false)
  }

  const cerrarPanel = () => {
    setFormulario(ventaVacia)
    setCarrito([])
    setVentaSeleccionada(null)
    setMostrarFormulario(false)
  }

  const manejarCambio = (e) => {
    const { name, value } = e.target

    setFormulario({
      ...formulario,
      [name]:
        name === 'clienteId' || name === 'productoId' || name === 'cantidad'
          ? Number(value)
          : value,
    })
  }

  const agregarProducto = () => {
    if (!formulario.productoId || !formulario.cantidad) {
      alert('Seleccioná un producto y una cantidad.')
      return
    }

    const producto = obtenerProducto(formulario.productoId)
    const stockProducto = obtenerStock(formulario.productoId)

    if (!producto) {
      alert('Producto no encontrado.')
      return
    }

    if (!producto.estado) {
      alert('Este producto está inactivo y no se puede vender.')
      return
    }

    if (!stockProducto) {
      alert('Este producto no tiene stock cargado.')
      return
    }

    const cantidadSolicitada = Number(formulario.cantidad)

    if (cantidadSolicitada <= 0) {
      alert('La cantidad debe ser mayor a cero.')
      return
    }

    const itemExistente = carrito.find(
      (item) => item.productoId === formulario.productoId
    )

    const cantidadYaAgregada = itemExistente ? itemExistente.cantidad : 0
    const cantidadTotal = cantidadYaAgregada + cantidadSolicitada

    if (cantidadTotal > stockProducto.cantidad) {
      alert('No hay stock suficiente para ese producto.')
      return
    }

    if (itemExistente) {
      const carritoActualizado = carrito.map((item) => {
        if (item.productoId === formulario.productoId) {
          return {
            ...item,
            cantidad: cantidadTotal,
            subtotal: cantidadTotal * producto.precio,
          }
        }

        return item
      })

      setCarrito(carritoActualizado)
    } else {
      const nuevoItem = {
        productoId: producto.id,
        descripcion: producto.descripcion,
        precioUnitario: producto.precio,
        cantidad: cantidadSolicitada,
        subtotal: producto.precio * cantidadSolicitada,
      }

      setCarrito([...carrito, nuevoItem])
    }

    setFormulario({
      ...formulario,
      productoId: '',
      cantidad: 1,
    })
  }

  const quitarProducto = (productoId) => {
    const carritoActualizado = carrito.filter(
      (item) => item.productoId !== productoId
    )

    setCarrito(carritoActualizado)
  }

  const guardarVenta = (e) => {
    e.preventDefault()

    if (!formulario.clienteId || !formulario.fecha) {
      alert('Seleccioná cliente y fecha.')
      return
    }

    if (carrito.length === 0) {
      alert('Agregá al menos un producto a la venta.')
      return
    }

    const nuevaVenta = {
      id: Date.now(),
      clienteId: formulario.clienteId,
      fecha: formulario.fecha,
      total: totalCarrito,
      metodoPago: formulario.metodoPago,
      estado: formulario.estado,
    }

    const nuevosDetalles = carrito.map((item, index) => ({
      id: Date.now() + index,
      ventaId: nuevaVenta.id,
      productoId: item.productoId,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario,
      subtotal: item.subtotal,
    }))

    const stockActualizado = stock.map((itemStock) => {
      const productoVendido = carrito.find(
        (item) => item.productoId === itemStock.productoId
      )

      if (productoVendido) {
        return {
          ...itemStock,
          cantidad: itemStock.cantidad - productoVendido.cantidad,
          ultimaActualizacion: formulario.fecha,
        }
      }

      return itemStock
    })

    setVentas([...ventas, nuevaVenta])
    setDetallesVentas([...detallesVentas, ...nuevosDetalles])
    setStock(stockActualizado)

    cerrarPanel()
  }

  const eliminarVenta = (id) => {
    const confirmar = window.confirm('¿Seguro que querés eliminar esta venta?')

    if (!confirmar) return

    const detallesDeVenta = obtenerDetallesVenta(id)

    const stockRestaurado = stock.map((itemStock) => {
      const detalle = detallesDeVenta.find(
        (item) => item.productoId === itemStock.productoId
      )

      if (detalle) {
        return {
          ...itemStock,
          cantidad: itemStock.cantidad + detalle.cantidad,
        }
      }

      return itemStock
    })

    const ventasActualizadas = ventas.filter((venta) => venta.id !== id)
    const detallesActualizados = detallesVentas.filter(
      (detalle) => detalle.ventaId !== id
    )

    setVentas(ventasActualizadas)
    setDetallesVentas(detallesActualizados)
    setStock(stockRestaurado)

    if (ventaSeleccionada?.id === id) {
      cerrarPanel()
    }
  }

  return (
    <section className="ventas-page">
      <div className="ventas-header">
        <div>
          <h1>Ventas</h1>
          <p>Registro de ventas, productos y pagos</p>
        </div>

        <button className="btn-nueva-venta" onClick={abrirNuevaVenta}>
          <FaPlus />
          Nueva Venta
        </button>
      </div>

      <div className="ventas-content">
        <div className="ventas-main-card">
          <div className="ventas-toolbar">
            <div className="ventas-search">
              <FaMagnifyingGlass />

              <input
                type="text"
                placeholder="Buscar por cliente, fecha, total, pago o estado"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <span className="ventas-total">{ventasFiltradas.length} ventas</span>
          </div>

          <div className="ventas-table-wrapper">
            <table className="ventas-table">
              <thead>
                <tr>
                  <th>Venta</th>
                  <th>Cliente</th>
                  <th>Productos</th>
                  <th>Total</th>
                  <th>Pago</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {ventasFiltradas.map((venta) => {
                  const cliente = obtenerCliente(venta.clienteId)

                  return (
                    <tr key={venta.id}>
                      <td>
                        <div className="venta-fecha">
                          <div className="venta-icono">
                            <FaCashRegister />
                          </div>

                          <div>
                            <strong>{venta.fecha}</strong>
                            <small>ID venta: {venta.id}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        {cliente?.nombre} {cliente?.apellido}
                      </td>

                      <td>{obtenerCantidadProductos(venta.id)}</td>

                      <td>{formatoDinero.format(venta.total)}</td>

                      <td>{venta.metodoPago}</td>

                      <td>
                        <span
                          className={
                            venta.estado === 'Completada'
                              ? 'estado-venta completada'
                              : 'estado-venta cancelada'
                          }
                        >
                          {venta.estado}
                        </span>
                      </td>

                      <td>
                        <div className="acciones">
                          <button
                            className="btn-accion ver"
                            onClick={() => abrirVerVenta(venta)}
                            title="Ver venta"
                          >
                            <FaEye />
                          </button>

                          <button
                            className="btn-accion eliminar"
                            onClick={() => eliminarVenta(venta.id)}
                            title="Eliminar venta"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {ventasFiltradas.length === 0 && (
                  <tr>
                    <td colSpan="7" className="sin-resultados">
                      No se encontraron ventas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {(mostrarFormulario || ventaSeleccionada) && (
          <aside className="ventas-side-card">
            <button className="btn-cerrar" onClick={cerrarPanel}>
              <FaXmark />
            </button>

            {mostrarFormulario ? (
              <>
                <h2>Nueva Venta</h2>
                <p>Seleccioná cliente, productos y método de pago</p>

                <form className="venta-form" onSubmit={guardarVenta}>
                  <label>Cliente</label>
                  <select
                    name="clienteId"
                    value={formulario.clienteId}
                    onChange={manejarCambio}
                  >
                    <option value="">Seleccionar cliente</option>

                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre} {cliente.apellido}
                      </option>
                    ))}
                  </select>

                  <label>Fecha</label>
                  <input
                    type="date"
                    name="fecha"
                    value={formulario.fecha}
                    onChange={manejarCambio}
                  />

                  <div className="venta-productos-box">
                    <h3>Selección de productos</h3>

                    <label>Producto</label>
                    <select
                      name="productoId"
                      value={formulario.productoId}
                      onChange={manejarCambio}
                    >
                      <option value="">Seleccionar producto</option>

                      {productos
                        .filter((producto) => producto.estado)
                        .map((producto) => {
                          const itemStock = obtenerStock(producto.id)

                          return (
                            <option key={producto.id} value={producto.id}>
                              {producto.descripcion} - Stock:{' '}
                              {itemStock?.cantidad ?? 0}
                            </option>
                          )
                        })}
                    </select>

                    <label>Cantidad</label>
                    <input
                      type="number"
                      name="cantidad"
                      value={formulario.cantidad}
                      onChange={manejarCambio}
                      min="1"
                    />

                    <button
                      type="button"
                      className="btn-agregar-producto"
                      onClick={agregarProducto}
                    >
                      <FaCartShopping />
                      Agregar Producto
                    </button>
                  </div>

                  <div className="carrito-venta">
                    <h3>Productos agregados</h3>

                    {carrito.length === 0 && (
                      <p className="carrito-vacio">No hay productos agregados.</p>
                    )}

                    {carrito.map((item) => (
                      <div className="carrito-item" key={item.productoId}>
                        <div>
                          <strong>{item.descripcion}</strong>
                          <span>
                            {item.cantidad} x{' '}
                            {formatoDinero.format(item.precioUnitario)}
                          </span>
                        </div>

                        <div className="carrito-item-right">
                          <strong>{formatoDinero.format(item.subtotal)}</strong>

                          <button
                            type="button"
                            onClick={() => quitarProducto(item.productoId)}
                          >
                            <FaXmark />
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="carrito-total">
                      <span>Total</span>
                      <strong>{formatoDinero.format(totalCarrito)}</strong>
                    </div>
                  </div>

                  <label>Método de pago</label>
                  <select
                    name="metodoPago"
                    value={formulario.metodoPago}
                    onChange={manejarCambio}
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Débito">Débito</option>
                    <option value="Crédito">Crédito</option>
                    <option value="Transferencia">Transferencia</option>
                  </select>

                  <label>Estado</label>
                  <select
                    name="estado"
                    value={formulario.estado}
                    onChange={manejarCambio}
                  >
                    <option value="Completada">Completada</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>

                  <button type="submit" className="btn-guardar">
                    <FaFloppyDisk />
                    Registrar Venta
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2>Detalle de Venta</h2>
                <p>Información registrada de la venta</p>

                <div className="venta-detalle">
                  <div>
                    <span>Cliente</span>
                    <strong>
                      {obtenerCliente(ventaSeleccionada.clienteId)?.nombre}{' '}
                      {obtenerCliente(ventaSeleccionada.clienteId)?.apellido}
                    </strong>
                  </div>

                  <div>
                    <span>Fecha</span>
                    <strong>{ventaSeleccionada.fecha}</strong>
                  </div>

                  <div>
                    <span>Total</span>
                    <strong>{formatoDinero.format(ventaSeleccionada.total)}</strong>
                  </div>

                  <div>
                    <span>Método de pago</span>
                    <strong>{ventaSeleccionada.metodoPago}</strong>
                  </div>

                  <div>
                    <span>Estado</span>
                    <strong>{ventaSeleccionada.estado}</strong>
                  </div>
                </div>

                <div className="detalle-productos-venta">
                  <h3>Productos vendidos</h3>

                  {obtenerDetallesVenta(ventaSeleccionada.id).length === 0 && (
                    <p>Esta venta no tiene detalle cargado.</p>
                  )}

                  {obtenerDetallesVenta(ventaSeleccionada.id).map((detalle) => {
                    const producto = obtenerProducto(detalle.productoId)

                    return (
                      <div className="detalle-producto-item" key={detalle.id}>
                        <div>
                          <strong>{producto?.descripcion}</strong>
                          <span>
                            {detalle.cantidad} x{' '}
                            {formatoDinero.format(detalle.precioUnitario)}
                          </span>
                        </div>

                        <strong>{formatoDinero.format(detalle.subtotal)}</strong>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </aside>
        )}
      </div>
    </section>
  )
}

export default Ventas