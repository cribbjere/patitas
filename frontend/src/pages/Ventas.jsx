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
  FaFilePdf,
  FaPrint,
  FaTriangleExclamation,
} from 'react-icons/fa6'
import { jsPDF } from 'jspdf'

import {
  clientes as clientesIniciales,
  productos as productosIniciales,
  stock as stockInicial,
  ventas as ventasIniciales,
} from '../data/mockData'

import { soloNumeros } from '../utils/validaciones'
import './Ventas.css'

const ventaVacia = {
  clienteId: '',
  fecha: '',
  metodoPago: 'Efectivo',
  estado: 'Completada',
  productoId: '',
  loteId: '',
  cantidad: '1',
  autorizacionVeterinaria: false,
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

function obtenerEstadoLote(lote) {
  const diasParaVencer = obtenerDiasParaVencer(lote.fechaVencimiento)

  if (diasParaVencer !== null && diasParaVencer < 0) {
    return 'Vencido'
  }

  if (Number(lote.cantidad) <= 0) {
    return 'Sin stock'
  }

  if (diasParaVencer !== null && diasParaVencer <= 30) {
    return 'Próximo a vencer'
  }

  return 'Disponible'
}

function loteEstaVencido(lote) {
  return obtenerEstadoLote(lote) === 'Vencido'
}

function Ventas() {
  const [clientes] = useState(clientesIniciales)
  const [productos] = useState(productosIniciales)
  const [stock, setStock] = useState(normalizarStockInicial(stockInicial))
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

  const obtenerLote = (loteId) => {
    return stock.find((item) => item.id === loteId)
  }

  const obtenerLotesPorProducto = (productoId) => {
    return stock.filter((item) => item.productoId === productoId)
  }

  const obtenerStockDisponibleProducto = (productoId) => {
    return stock
      .filter((item) => item.productoId === productoId)
      .filter((item) => !loteEstaVencido(item))
      .reduce((total, item) => total + Number(item.cantidad), 0)
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

  const obtenerTipoProducto = (producto) => {
    return producto?.tipoProducto || producto?.categoria || 'Producto'
  }

  const obtenerCondicionVenta = (producto) => {
    if (producto?.condicionVenta) {
      return producto.condicionVenta
    }

    if (producto?.categoria === 'Medicamento') {
      return 'Uso veterinario'
    }

    if (producto?.categoria === 'Vacuna') {
      return 'Requiere receta'
    }

    return 'Venta libre'
  }

  const productoRequiereAutorizacion = (producto) => {
    const condicion = obtenerCondicionVenta(producto)

    return condicion === 'Uso veterinario' || condicion === 'Requiere receta'
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
    const { name, value, type, checked } = e.target

    if (name === 'cantidad') {
      setFormulario({
        ...formulario,
        cantidad: soloNumeros(value),
      })

      return
    }

    if (name === 'productoId') {
      setFormulario({
        ...formulario,
        productoId: value ? Number(value) : '',
        loteId: '',
        autorizacionVeterinaria: false,
      })

      return
    }

    setFormulario({
      ...formulario,
      [name]:
        name === 'clienteId' || name === 'loteId'
          ? value
            ? Number(value)
            : ''
          : type === 'checkbox'
            ? checked
            : value,
    })
  }

  const agregarProducto = () => {
    if (!formulario.productoId || !formulario.loteId || !formulario.cantidad) {
      alert('Seleccioná producto, lote y cantidad.')
      return
    }

    const producto = obtenerProducto(formulario.productoId)
    const lote = obtenerLote(formulario.loteId)

    if (!producto) {
      alert('Producto no encontrado.')
      return
    }

    if (!producto.estado) {
      alert('Este producto está inactivo y no se puede vender.')
      return
    }

    if (!lote) {
      alert('Lote no encontrado.')
      return
    }

    if (loteEstaVencido(lote)) {
      alert('No se puede vender este producto porque el lote está vencido.')
      return
    }

    const cantidadSolicitada = Number(formulario.cantidad)

    if (cantidadSolicitada <= 0) {
      alert('La cantidad debe ser mayor a cero.')
      return
    }

    const itemExistente = carrito.find((item) => item.loteId === formulario.loteId)

    const cantidadYaAgregada = itemExistente ? itemExistente.cantidad : 0
    const cantidadTotal = cantidadYaAgregada + cantidadSolicitada

    if (cantidadTotal > Number(lote.cantidad)) {
      alert('No hay stock suficiente en este lote.')
      return
    }

    if (
      productoRequiereAutorizacion(producto) &&
      !formulario.autorizacionVeterinaria
    ) {
      alert(
        'Este producto requiere autorización veterinaria o receta antes de venderse.'
      )
      return
    }

    if (itemExistente) {
      const carritoActualizado = carrito.map((item) => {
        if (item.loteId === formulario.loteId) {
          return {
            ...item,
            cantidad: cantidadTotal,
            subtotal: cantidadTotal * producto.precio,
            autorizacionVeterinaria: formulario.autorizacionVeterinaria,
          }
        }

        return item
      })

      setCarrito(carritoActualizado)
    } else {
      const nuevoItem = {
        productoId: producto.id,
        loteId: lote.id,
        lote: lote.lote,
        fechaVencimiento: lote.fechaVencimiento || '',
        descripcion: producto.descripcion,
        categoria: producto.categoria,
        tipoProducto: obtenerTipoProducto(producto),
        condicionVenta: obtenerCondicionVenta(producto),
        requiereAutorizacion: productoRequiereAutorizacion(producto),
        autorizacionVeterinaria: formulario.autorizacionVeterinaria,
        precioUnitario: producto.precio,
        cantidad: cantidadSolicitada,
        subtotal: producto.precio * cantidadSolicitada,
      }

      setCarrito([...carrito, nuevoItem])
    }

    setFormulario({
      ...formulario,
      productoId: '',
      loteId: '',
      cantidad: '1',
      autorizacionVeterinaria: false,
    })
  }

  const quitarProducto = (loteId) => {
    const carritoActualizado = carrito.filter((item) => item.loteId !== loteId)

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

    const hayLoteVencido = carrito.some((item) => {
      const lote = obtenerLote(item.loteId)

      return lote && loteEstaVencido(lote)
    })

    if (hayLoteVencido) {
      alert('La venta contiene un lote vencido. No se puede registrar.')
      return
    }

    const hayProductoRestringidoSinAutorizacion = carrito.some(
      (item) => item.requiereAutorizacion && !item.autorizacionVeterinaria
    )

    if (hayProductoRestringidoSinAutorizacion) {
      alert('Hay productos que requieren autorización veterinaria.')
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
      loteId: item.loteId,
      lote: item.lote,
      fechaVencimiento: item.fechaVencimiento,
      condicionVenta: item.condicionVenta,
      autorizacionVeterinaria: item.autorizacionVeterinaria,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario,
      subtotal: item.subtotal,
    }))

    const stockActualizado = stock.map((itemStock) => {
      const productoVendido = carrito.find((item) => item.loteId === itemStock.id)

      if (productoVendido) {
        return {
          ...itemStock,
          cantidad: Number(itemStock.cantidad) - productoVendido.cantidad,
          ultimaActualizacion: formulario.fecha,
        }
      }

      return itemStock
    })

    setVentas([...ventas, nuevaVenta])
    setDetallesVentas([...detallesVentas, ...nuevosDetalles])
    setStock(stockActualizado)

    cerrarPanel()
    setVentaSeleccionada(nuevaVenta)
  }

  const eliminarVenta = (id) => {
    const confirmar = window.confirm('¿Seguro que querés eliminar esta venta?')

    if (!confirmar) return

    const detallesDeVenta = obtenerDetallesVenta(id)

    const stockRestaurado = stock.map((itemStock) => {
      const detalle = detallesDeVenta.find((item) => item.loteId === itemStock.id)

      if (detalle) {
        return {
          ...itemStock,
          cantidad: Number(itemStock.cantidad) + Number(detalle.cantidad),
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

  const crearHtmlComprobante = (venta) => {
    const cliente = obtenerCliente(venta.clienteId)
    const detalles = obtenerDetallesVenta(venta.id)

    const filasProductos =
      detalles.length === 0
        ? `<tr><td colspan="5">Esta venta no tiene detalle cargado.</td></tr>`
        : detalles
            .map((detalle) => {
              const producto = obtenerProducto(detalle.productoId)

              return `
                <tr>
                  <td>${producto?.descripcion || 'Producto'}</td>
                  <td>${detalle.lote || '-'}</td>
                  <td>${detalle.cantidad}</td>
                  <td>$${detalle.precioUnitario}</td>
                  <td>$${detalle.subtotal}</td>
                </tr>
              `
            })
            .join('')

    return `
      <html>
        <head>
          <title>Comprobante de venta</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 30px;
              color: #1d2944;
            }

            h1 {
              margin-bottom: 4px;
            }

            .datos {
              margin: 20px 0;
              line-height: 1.7;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th,
            td {
              border: 1px solid #d7d7d7;
              padding: 9px;
              text-align: left;
              font-size: 14px;
            }

            th {
              background-color: #f4efe7;
            }

            .total {
              margin-top: 20px;
              text-align: right;
              font-size: 20px;
              font-weight: bold;
            }

            .nota {
              margin-top: 25px;
              font-size: 13px;
              color: #555;
            }
          </style>
        </head>

        <body>
          <h1>Veterinaria Patitas</h1>
          <p>Comprobante de venta</p>

          <div class="datos">
            <strong>N° de venta:</strong> ${venta.id}<br />
            <strong>Fecha:</strong> ${venta.fecha}<br />
            <strong>Cliente:</strong> ${cliente?.nombre || ''} ${
              cliente?.apellido || ''
            }<br />
            <strong>Método de pago:</strong> ${venta.metodoPago}<br />
            <strong>Estado:</strong> ${venta.estado}
          </div>

          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Lote</th>
                <th>Cantidad</th>
                <th>Precio unitario</th>
                <th>Subtotal</th>
              </tr>
            </thead>

            <tbody>
              ${filasProductos}
            </tbody>
          </table>

          <div class="total">
            Total: ${formatoDinero.format(venta.total)}
          </div>

          <p class="nota">
            Comprobante generado desde el sistema Veterinaria Patitas.
          </p>
        </body>
      </html>
    `
  }

  const imprimirComprobante = (venta) => {
    const ventana = window.open('', '_blank')

    if (!ventana) {
      alert('El navegador bloqueó la ventana de impresión.')
      return
    }

    ventana.document.write(crearHtmlComprobante(venta))
    ventana.document.close()
    ventana.focus()
    ventana.print()
  }

  const descargarPdf = (venta) => {
    const cliente = obtenerCliente(venta.clienteId)
    const detalles = obtenerDetallesVenta(venta.id)

    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text('Veterinaria Patitas', 14, 18)

    doc.setFontSize(13)
    doc.text('Comprobante de venta', 14, 28)

    doc.setFontSize(11)
    doc.text(`N° de venta: ${venta.id}`, 14, 42)
    doc.text(`Fecha: ${venta.fecha}`, 14, 50)
    doc.text(
      `Cliente: ${cliente?.nombre || ''} ${cliente?.apellido || ''}`,
      14,
      58
    )
    doc.text(`Método de pago: ${venta.metodoPago}`, 14, 66)
    doc.text(`Estado: ${venta.estado}`, 14, 74)

    let y = 90

    doc.setFontSize(12)
    doc.text('Productos vendidos', 14, y)

    y += 10

    if (detalles.length === 0) {
      doc.setFontSize(10)
      doc.text('Esta venta no tiene detalle cargado.', 14, y)
      y += 8
    } else {
      detalles.forEach((detalle) => {
        const producto = obtenerProducto(detalle.productoId)

        if (y > 260) {
          doc.addPage()
          y = 20
        }

        doc.setFontSize(10)
        doc.text(`Producto: ${producto?.descripcion || 'Producto'}`, 14, y)
        y += 7
        doc.text(`Lote: ${detalle.lote || '-'}`, 14, y)
        y += 7
        doc.text(
          `Cantidad: ${detalle.cantidad} x ${formatoDinero.format(
            detalle.precioUnitario
          )}`,
          14,
          y
        )
        y += 7
        doc.text(`Subtotal: ${formatoDinero.format(detalle.subtotal)}`, 14, y)
        y += 10
      })
    }

    doc.setFontSize(14)
    doc.text(`Total: ${formatoDinero.format(venta.total)}`, 14, y + 8)

    doc.save(`comprobante-venta-${venta.id}.pdf`)
  }

  const obtenerClaseEstadoLote = (lote) => {
    const estado = obtenerEstadoLote(lote)

    if (estado === 'Vencido') return 'estado-lote vencido'
    if (estado === 'Próximo a vencer') return 'estado-lote proximo'
    if (estado === 'Sin stock') return 'estado-lote sin-stock'

    return 'estado-lote disponible'
  }

  const productoSeleccionado = obtenerProducto(formulario.productoId)
  const lotesProductoSeleccionado = formulario.productoId
    ? obtenerLotesPorProducto(formulario.productoId)
    : []

  return (
    <section className="ventas-page">
      <div className="ventas-header">
        <div>
          <h1>Ventas</h1>
          <p>Registro de ventas, lotes, comprobantes y pagos</p>
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
                            className="btn-accion pdf"
                            onClick={() => descargarPdf(venta)}
                            title="Descargar PDF"
                          >
                            <FaFilePdf />
                          </button>

                          <button
                            className="btn-accion imprimir"
                            onClick={() => imprimirComprobante(venta)}
                            title="Imprimir comprobante"
                          >
                            <FaPrint />
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
                <p>Seleccioná cliente, producto, lote y método de pago</p>

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
                        .map((producto) => (
                          <option key={producto.id} value={producto.id}>
                            {producto.descripcion} - Stock disponible:{' '}
                            {obtenerStockDisponibleProducto(producto.id)}
                          </option>
                        ))}
                    </select>

                    {productoSeleccionado &&
                      productoRequiereAutorizacion(productoSeleccionado) && (
                        <div className="aviso-venta-restringida">
                          <FaTriangleExclamation />
                          <div>
                            <strong>Producto con control de venta</strong>
                            <span>
                              {obtenerCondicionVenta(productoSeleccionado)}.
                              Requiere autorización veterinaria o receta.
                            </span>
                          </div>
                        </div>
                      )}

                    <label>Lote</label>
                    <select
                      name="loteId"
                      value={formulario.loteId}
                      onChange={manejarCambio}
                      disabled={!formulario.productoId}
                    >
                      <option value="">Seleccionar lote</option>

                      {lotesProductoSeleccionado.map((lote) => (
                        <option
                          key={lote.id}
                          value={lote.id}
                          disabled={loteEstaVencido(lote) || lote.cantidad <= 0}
                        >
                          {lote.lote} - Stock: {lote.cantidad} - Vence:{' '}
                          {lote.fechaVencimiento || 'Sin vencimiento'} -{' '}
                          {obtenerEstadoLote(lote)}
                        </option>
                      ))}
                    </select>

                    {formulario.loteId && (
                      <div className="lote-seleccionado-info">
                        <span
                          className={obtenerClaseEstadoLote(
                            obtenerLote(formulario.loteId)
                          )}
                        >
                          {obtenerEstadoLote(obtenerLote(formulario.loteId))}
                        </span>

                        <small>
                          Lote: {obtenerLote(formulario.loteId)?.lote} |
                          Vencimiento:{' '}
                          {obtenerLote(formulario.loteId)?.fechaVencimiento ||
                            'Sin vencimiento'}
                        </small>
                      </div>
                    )}

                    <label>Cantidad</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      name="cantidad"
                      value={formulario.cantidad}
                      onChange={manejarCambio}
                    />

                    {productoSeleccionado &&
                      productoRequiereAutorizacion(productoSeleccionado) && (
                        <label className="checkbox-autorizacion">
                          <input
                            type="checkbox"
                            name="autorizacionVeterinaria"
                            checked={formulario.autorizacionVeterinaria}
                            onChange={manejarCambio}
                          />
                          Venta autorizada por veterinario / receta presentada
                        </label>
                      )}

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
                      <div className="carrito-item" key={item.loteId}>
                        <div>
                          <strong>{item.descripcion}</strong>
                          <span>
                            {item.cantidad} x{' '}
                            {formatoDinero.format(item.precioUnitario)}
                          </span>

                          <small>
                            Lote: {item.lote} | Vence:{' '}
                            {item.fechaVencimiento || 'Sin vencimiento'}
                          </small>

                          {item.requiereAutorizacion && (
                            <small className="autorizacion-ok">
                              Autorización veterinaria registrada
                            </small>
                          )}
                        </div>

                        <div className="carrito-item-right">
                          <strong>{formatoDinero.format(item.subtotal)}</strong>

                          <button
                            type="button"
                            onClick={() => quitarProducto(item.loteId)}
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

                          <small>
                            Lote: {detalle.lote || '-'} | Vence:{' '}
                            {detalle.fechaVencimiento || 'Sin vencimiento'}
                          </small>

                          {detalle.autorizacionVeterinaria && (
                            <small className="autorizacion-ok">
                              Autorización veterinaria registrada
                            </small>
                          )}
                        </div>

                        <strong>{formatoDinero.format(detalle.subtotal)}</strong>
                      </div>
                    )
                  })}
                </div>

                <div className="botones-comprobante">
                  <button
                    type="button"
                    className="btn-descargar-pdf"
                    onClick={() => descargarPdf(ventaSeleccionada)}
                  >
                    <FaFilePdf />
                    Descargar PDF
                  </button>

                  <button
                    type="button"
                    className="btn-imprimir"
                    onClick={() => imprimirComprobante(ventaSeleccionada)}
                  >
                    <FaPrint />
                    Imprimir
                  </button>
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