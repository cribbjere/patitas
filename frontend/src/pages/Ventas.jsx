import { useEffect, useMemo, useState } from 'react'
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

import { obtenerClientes } from '../services/clientesService'
import { obtenerProductos } from '../services/productosService'
import { obtenerLotesStock } from '../services/lotesStockService'
import {
  obtenerVentas,
  crearVenta,
  eliminarVenta as eliminarVentaAPI,
  descargarComprobanteVenta,
} from '../services/ventasService'

import { soloNumeros } from '../utils/validaciones'
import './Ventas.css'

function obtenerFechaHoy() {
  const hoy = new Date()
  const anio = hoy.getFullYear()
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  const dia = String(hoy.getDate()).padStart(2, '0')

  return `${anio}-${mes}-${dia}`
}

const ventaVacia = {
  clienteId: '',
  fecha: obtenerFechaHoy(),
  metodoPago: 'efectivo',
  estado: 'completada',
  productoId: '',
  loteId: '',
  cantidad: '1',
  autorizacionVeterinaria: false,
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

  const vencimiento = new Date(
    `${normalizarFecha(fechaVencimiento)}T00:00:00`
  )
  vencimiento.setHours(0, 0, 0, 0)

  if (Number.isNaN(vencimiento.getTime())) return null

  const diferencia = vencimiento - hoy

  return Math.ceil(diferencia / (1000 * 60 * 60 * 24))
}

function obtenerEstadoLote(lote) {
  if (!lote) return 'Sin stock'

  const diasParaVencer = obtenerDiasParaVencer(
    lote.fechaVencimiento
  )

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

function formatearFecha(fecha) {
  if (!fecha) return 'Sin fecha'

  const fechaLocal = new Date(
    `${normalizarFecha(fecha)}T00:00:00`
  )

  if (Number.isNaN(fechaLocal.getTime())) return fecha

  return fechaLocal.toLocaleDateString('es-AR')
}

function formatearTexto(valor) {
  if (!valor) return 'Sin especificar'

  return String(valor)
    .replaceAll('_', ' ')
    .replace(/^./, (letra) => letra.toUpperCase())
}

function obtenerMensajeError(error, mensajeAlternativo) {
  const datos = error?.response?.data

  if (!datos) return mensajeAlternativo
  if (typeof datos === 'string') return datos
  if (typeof datos.detail === 'string') return datos.detail

  const mensajes = []

  const recorrer = (valor) => {
    if (typeof valor === 'string') {
      mensajes.push(valor)
      return
    }

    if (Array.isArray(valor)) {
      valor.forEach(recorrer)
      return
    }

    if (valor && typeof valor === 'object') {
      Object.values(valor).forEach(recorrer)
    }
  }

  recorrer(datos)

  return mensajes.join(' ') || mensajeAlternativo
}

function Ventas() {
  const [clientes, setClientes] = useState([])
  const [productos, setProductos] = useState([])
  const [stock, setStock] = useState([])
  const [ventas, setVentas] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null)
  const [formulario, setFormulario] = useState(ventaVacia)
  const [carrito, setCarrito] = useState([])
  const [mensaje, setMensaje] = useState(null)
  const [ventaAEliminar, setVentaAEliminar] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const formatoDinero = useMemo(
    () =>
      new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0,
      }),
    []
  )

  const convertirCliente = (cliente) => ({
    id: Number(cliente.id),
    nombre: cliente.nombre || '',
    apellido: cliente.apellido || '',
    estado: cliente.estado === 'activo',
  })

  const convertirProducto = (producto) => ({
    id: Number(producto.id),
    descripcion: producto.descripcion || '',
    categoria: producto.categoria || '',
    tipoProducto: producto.tipo_producto || '',
    precio: Number(producto.precio_venta ?? 0),
    estado: producto.estado === 'activo',
  })

  const convertirLote = (lote) => ({
    id: Number(lote.id),
    productoId: Number(lote.producto),
    lote: lote.numero_lote || '',
    cantidad: Number(lote.cantidad_disponible ?? 0),
    fechaVencimiento: normalizarFecha(lote.fecha_vencimiento),
  })

  const convertirDetalle = (detalle) => ({
    id: Number(detalle.id),
    ventaId: Number(detalle.venta),
    productoId: Number(detalle.producto),
    loteId: Number(detalle.lote),
    descripcion: detalle.producto_descripcion || '',
    lote: detalle.lote_numero || '',
    fechaVencimiento: normalizarFecha(
      detalle.fecha_vencimiento
    ),
    cantidad: Number(detalle.cantidad ?? 0),
    precioUnitario: Number(detalle.precio_unitario ?? 0),
    subtotal: Number(detalle.subtotal ?? 0),
    autorizacionVeterinaria: Boolean(
      detalle.autorizacion_veterinaria
    ),
  })

  const convertirVenta = (venta) => ({
    id: Number(venta.id),
    numeroComprobante:
      venta.numero_comprobante || `VENT-${venta.id}`,
    clienteId: venta.cliente ? Number(venta.cliente) : null,
    clienteNombre: venta.cliente_nombre || 'Consumidor final',
    fecha: normalizarFecha(venta.fecha),
    total: Number(venta.total ?? 0),
    metodoPago: venta.metodo_pago || 'efectivo',
    estado: venta.estado || 'completada',
    estadoPago: venta.estado_pago || 'pendiente',
    observaciones: venta.observaciones || '',
    detalles: normalizarLista(venta.detalles).map(convertirDetalle),
  })

  const cargarDatos = async () => {
    try {
      setCargando(true)

      const [
        clientesRespuesta,
        productosRespuesta,
        lotesRespuesta,
        ventasRespuesta,
      ] = await Promise.all([
        obtenerClientes(),
        obtenerProductos(),
        obtenerLotesStock(),
        obtenerVentas(),
      ])

      setClientes(
        normalizarLista(clientesRespuesta).map(convertirCliente)
      )
      setProductos(
        normalizarLista(productosRespuesta).map(convertirProducto)
      )
      setStock(normalizarLista(lotesRespuesta).map(convertirLote))
      setVentas(
        normalizarLista(ventasRespuesta)
          .map(convertirVenta)
          .sort((a, b) => b.id - a.id)
      )
    } catch (error) {
      console.error('Error al cargar ventas:', error)
      setMensaje({
        tipo: 'error',
        texto: obtenerMensajeError(
          error,
          'No se pudieron cargar clientes, productos, lotes y ventas.'
        ),
      })
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const obtenerCliente = (clienteId) => {
    return clientes.find(
      (cliente) => cliente.id === Number(clienteId)
    )
  }

  const obtenerProducto = (productoId) => {
    return productos.find(
      (producto) => producto.id === Number(productoId)
    )
  }

  const obtenerLote = (loteId) => {
    return stock.find((item) => item.id === Number(loteId))
  }

  const obtenerLotesPorProducto = (productoId) => {
    return stock
      .filter(
        (item) => item.productoId === Number(productoId)
      )
      .sort((a, b) => {
        const estadoA = obtenerEstadoLote(a)
        const estadoB = obtenerEstadoLote(b)

        const disponibleA =
          estadoA !== 'Vencido' && estadoA !== 'Sin stock'
        const disponibleB =
          estadoB !== 'Vencido' && estadoB !== 'Sin stock'

        if (disponibleA !== disponibleB) {
          return disponibleA ? -1 : 1
        }

        if (!a.fechaVencimiento && !b.fechaVencimiento) return 0
        if (!a.fechaVencimiento) return 1
        if (!b.fechaVencimiento) return -1

        return a.fechaVencimiento.localeCompare(
          b.fechaVencimiento
        )
      })
  }

  const obtenerLotesDisponiblesPorProducto = (productoId) => {
    return obtenerLotesPorProducto(productoId).filter(
      (lote) =>
        !loteEstaVencido(lote) && Number(lote.cantidad) > 0
    )
  }

  const obtenerStockDisponibleProducto = (productoId) => {
    return obtenerLotesDisponiblesPorProducto(productoId).reduce(
      (total, item) => total + Number(item.cantidad),
      0
    )
  }

  const obtenerDetallesVenta = (ventaId) => {
    return (
      ventas.find((venta) => venta.id === Number(ventaId))
        ?.detalles || []
    )
  }

  const obtenerCantidadProductos = (ventaId) => {
    const detalles = obtenerDetallesVenta(ventaId)

    if (detalles.length === 0) {
      return 'Sin detalle'
    }

    const unidades = detalles.reduce(
      (total, detalle) => total + Number(detalle.cantidad),
      0
    )

    return `${detalles.length} producto/s · ${unidades} unidad/es`
  }

  const obtenerCondicionVenta = (producto) => {
    const categoria = producto?.categoria?.toLowerCase() || ''

    if (categoria === 'medicamento') {
      return 'Uso veterinario'
    }

    if (categoria === 'vacuna') {
      return 'Requiere receta'
    }

    return 'Venta libre'
  }

  const productoRequiereAutorizacion = (producto) => {
    const categoria = producto?.categoria?.toLowerCase() || ''

    return categoria === 'medicamento' || categoria === 'vacuna'
  }

  const productoPuedeVenderse = (producto) => {
    return (
      producto?.estado &&
      producto?.tipoProducto !== 'interno' &&
      obtenerStockDisponibleProducto(producto.id) > 0
    )
  }

  const totalCarrito = useMemo(
    () =>
      carrito.reduce(
        (total, item) => total + Number(item.subtotal),
        0
      ),
    [carrito]
  )

  const ventasFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()

    return ventas.filter((venta) => {
      const cliente = obtenerCliente(venta.clienteId)

      const texto = `
        ${venta.numeroComprobante}
        ${venta.fecha}
        ${venta.total}
        ${venta.metodoPago}
        ${venta.estado}
        ${venta.estadoPago}
        ${venta.clienteNombre}
        ${cliente?.nombre || ''}
        ${cliente?.apellido || ''}
      `.toLowerCase()

      return texto.includes(termino)
    })
  }, [ventas, busqueda, clientes])

  const mostrarMensaje = (texto, tipo = 'error') => {
    setMensaje({ texto, tipo })
  }

  const limpiarMensaje = () => setMensaje(null)

  const abrirNuevaVenta = () => {
    limpiarMensaje()
    setFormulario({
      ...ventaVacia,
      fecha: obtenerFechaHoy(),
    })
    setCarrito([])
    setVentaSeleccionada(null)
    setMostrarFormulario(true)
  }

  const abrirVerVenta = (venta) => {
    limpiarMensaje()
    setVentaSeleccionada(venta)
    setMostrarFormulario(false)
  }

  const cerrarPanel = () => {
    limpiarMensaje()
    setFormulario({
      ...ventaVacia,
      fecha: obtenerFechaHoy(),
    })
    setCarrito([])
    setVentaSeleccionada(null)
    setMostrarFormulario(false)
  }

  const manejarCambio = (e) => {
    const { name, value, type, checked } = e.target
    limpiarMensaje()

    if (name === 'cantidad') {
      setFormulario((formularioActual) => ({
        ...formularioActual,
        cantidad: soloNumeros(value),
      }))
      return
    }

    if (name === 'productoId') {
      const productoId = value ? Number(value) : ''
      const primerLote = productoId
        ? obtenerLotesDisponiblesPorProducto(productoId)[0]
        : null

      setFormulario((formularioActual) => ({
        ...formularioActual,
        productoId,
        loteId: primerLote?.id || '',
        autorizacionVeterinaria: false,
      }))
      return
    }

    setFormulario((formularioActual) => ({
      ...formularioActual,
      [name]:
        name === 'clienteId' || name === 'loteId'
          ? value
            ? Number(value)
            : ''
          : type === 'checkbox'
            ? checked
            : value,
    }))
  }

  const agregarProducto = () => {
    if (
      !formulario.productoId ||
      !formulario.loteId ||
      !formulario.cantidad
    ) {
      mostrarMensaje('Seleccioná producto, lote y cantidad.')
      return
    }

    const producto = obtenerProducto(formulario.productoId)
    const lote = obtenerLote(formulario.loteId)

    if (!producto) {
      mostrarMensaje('Producto no encontrado.')
      return
    }

    if (!producto.estado) {
      mostrarMensaje(
        'Este producto está inactivo y no se puede vender.'
      )
      return
    }

    if (producto.tipoProducto === 'interno') {
      mostrarMensaje(
        'Este producto es de uso interno y no se puede vender.'
      )
      return
    }

    if (!lote || lote.productoId !== producto.id) {
      mostrarMensaje(
        'El lote seleccionado no pertenece al producto.'
      )
      return
    }

    if (loteEstaVencido(lote)) {
      mostrarMensaje(
        'No se puede vender este producto porque el lote está vencido.'
      )
      return
    }

    const cantidadSolicitada = Number(formulario.cantidad)

    if (cantidadSolicitada <= 0) {
      mostrarMensaje('La cantidad debe ser mayor a cero.')
      return
    }

    const itemExistente = carrito.find(
      (item) => item.loteId === formulario.loteId
    )

    const cantidadYaAgregada = itemExistente
      ? itemExistente.cantidad
      : 0
    const cantidadTotal =
      cantidadYaAgregada + cantidadSolicitada

    if (cantidadTotal > Number(lote.cantidad)) {
      mostrarMensaje(
        `No hay stock suficiente en este lote. Disponible: ${lote.cantidad}.`
      )
      return
    }

    if (
      productoRequiereAutorizacion(producto) &&
      !formulario.autorizacionVeterinaria
    ) {
      mostrarMensaje(
        'Este producto requiere autorización veterinaria o receta antes de venderse.'
      )
      return
    }

    if (itemExistente) {
      setCarrito((carritoActual) =>
        carritoActual.map((item) =>
          item.loteId === formulario.loteId
            ? {
                ...item,
                cantidad: cantidadTotal,
                subtotal: cantidadTotal * producto.precio,
                autorizacionVeterinaria:
                  formulario.autorizacionVeterinaria,
              }
            : item
        )
      )
    } else {
      const nuevoItem = {
        productoId: producto.id,
        loteId: lote.id,
        lote: lote.lote,
        fechaVencimiento: lote.fechaVencimiento || '',
        descripcion: producto.descripcion,
        categoria: producto.categoria,
        condicionVenta: obtenerCondicionVenta(producto),
        requiereAutorizacion:
          productoRequiereAutorizacion(producto),
        autorizacionVeterinaria:
          formulario.autorizacionVeterinaria,
        precioUnitario: producto.precio,
        cantidad: cantidadSolicitada,
        subtotal: producto.precio * cantidadSolicitada,
      }

      setCarrito((carritoActual) => [
        ...carritoActual,
        nuevoItem,
      ])
    }

    setFormulario((formularioActual) => ({
      ...formularioActual,
      productoId: '',
      loteId: '',
      cantidad: '1',
      autorizacionVeterinaria: false,
    }))

    mostrarMensaje('Producto agregado correctamente.', 'exito')
  }

  const quitarProducto = (loteId) => {
    setCarrito((carritoActual) =>
      carritoActual.filter((item) => item.loteId !== loteId)
    )
  }

  const guardarVenta = async (e) => {
    e.preventDefault()

    if (!formulario.clienteId || !formulario.fecha) {
      mostrarMensaje('Seleccioná cliente y fecha.')
      return
    }

    if (carrito.length === 0) {
      mostrarMensaje('Agregá al menos un producto a la venta.')
      return
    }

    const hayLoteVencido = carrito.some((item) => {
      const lote = obtenerLote(item.loteId)
      return !lote || loteEstaVencido(lote)
    })

    if (hayLoteVencido) {
      mostrarMensaje(
        'La venta contiene un lote vencido o inexistente.'
      )
      return
    }

    const hayStockInsuficiente = carrito.some((item) => {
      const lote = obtenerLote(item.loteId)
      return !lote || item.cantidad > Number(lote.cantidad)
    })

    if (hayStockInsuficiente) {
      mostrarMensaje(
        'El stock cambió y ya no alcanza para completar la venta.'
      )
      return
    }

    const datosVenta = {
      cliente: Number(formulario.clienteId),
      consumidor_final: false,
      fecha: formulario.fecha,
      metodo_pago: formulario.metodoPago,
      estado: formulario.estado,
      estado_pago:
        formulario.estado === 'completada'
          ? 'cobrada'
          : 'pendiente',
      observaciones: '',
      detalles: carrito.map((item) => ({
        producto: item.productoId,
        lote: item.loteId,
        cantidad: item.cantidad,
        autorizacion_veterinaria:
          item.autorizacionVeterinaria,
      })),
    }

    try {
      setGuardando(true)
      limpiarMensaje()

      const ventaCreadaAPI = await crearVenta(datosVenta)
      const ventaCreada = convertirVenta(ventaCreadaAPI)

      await cargarDatos()

      setMostrarFormulario(false)
      setCarrito([])
      setFormulario({
        ...ventaVacia,
        fecha: obtenerFechaHoy(),
      })
      setVentaSeleccionada(ventaCreada)
      mostrarMensaje('Venta registrada correctamente.', 'exito')
    } catch (error) {
      console.error('Error al registrar la venta:', error)
      mostrarMensaje(
        obtenerMensajeError(
          error,
          'No se pudo registrar la venta.'
        )
      )
    } finally {
      setGuardando(false)
    }
  }

  const solicitarEliminarVenta = (venta) => {
    limpiarMensaje()
    setVentaAEliminar(venta)
  }

  const eliminarVenta = async () => {
    if (!ventaAEliminar) return

    try {
      await eliminarVentaAPI(ventaAEliminar.id)
      await cargarDatos()

      if (ventaSeleccionada?.id === ventaAEliminar.id) {
        setVentaSeleccionada(null)
        setMostrarFormulario(false)
      }

      setVentaAEliminar(null)
      mostrarMensaje(
        'Venta eliminada y stock restaurado correctamente.',
        'exito'
      )
    } catch (error) {
      console.error('Error al eliminar la venta:', error)
      mostrarMensaje(
        obtenerMensajeError(
          error,
          'No se pudo eliminar la venta.'
        )
      )
    }
  }

  const crearHtmlComprobante = (venta) => {
    const detalles = obtenerDetallesVenta(venta.id)

    const filasProductos =
      detalles.length === 0
        ? '<tr><td colspan="5">Esta venta no tiene detalle cargado.</td></tr>'
        : detalles
            .map(
              (detalle) => `
                <tr>
                  <td>${
                    detalle.descripcion ||
                    obtenerProducto(detalle.productoId)?.descripcion ||
                    'Producto'
                  }</td>
                  <td>${detalle.lote || '-'}</td>
                  <td>${detalle.cantidad}</td>
                  <td>${formatoDinero.format(
                    detalle.precioUnitario
                  )}</td>
                  <td>${formatoDinero.format(
                    detalle.subtotal
                  )}</td>
                </tr>
              `
            )
            .join('')

    return `
      <html>
        <head>
          <title>${venta.numeroComprobante}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 30px;
              color: #1d2944;
            }

            h1 { margin-bottom: 4px; }
            .datos { margin: 20px 0; line-height: 1.7; }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #d7d7d7;
              padding: 9px;
              text-align: left;
              font-size: 14px;
            }
            th { background-color: #f4efe7; }
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
            <strong>Comprobante:</strong> ${
              venta.numeroComprobante
            }<br />
            <strong>Fecha:</strong> ${formatearFecha(
              venta.fecha
            )}<br />
            <strong>Cliente:</strong> ${
              venta.clienteNombre
            }<br />
            <strong>Método de pago:</strong> ${formatearTexto(
              venta.metodoPago
            )}<br />
            <strong>Estado:</strong> ${formatearTexto(
              venta.estado
            )}
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
            <tbody>${filasProductos}</tbody>
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
      mostrarMensaje(
        'El navegador bloqueó la ventana de impresión.'
      )
      return
    }

    ventana.document.write(crearHtmlComprobante(venta))
    ventana.document.close()
    ventana.focus()
    ventana.print()
  }

  const descargarPdf = async (venta) => {
    try {
      await descargarComprobanteVenta({
        id: venta.id,
        numero_comprobante: venta.numeroComprobante,
      })
    } catch (error) {
      console.error('Error al descargar el comprobante:', error)
      mostrarMensaje(
        obtenerMensajeError(
          error,
          'No se pudo descargar el comprobante.'
        )
      )
    }
  }

  const obtenerClaseEstadoLote = (lote) => {
    const estado = obtenerEstadoLote(lote)

    if (estado === 'Vencido') return 'estado-lote vencido'
    if (estado === 'Próximo a vencer') {
      return 'estado-lote proximo'
    }
    if (estado === 'Sin stock') return 'estado-lote sin-stock'

    return 'estado-lote disponible'
  }

  const productoSeleccionado = obtenerProducto(
    formulario.productoId
  )
  const lotesProductoSeleccionado = formulario.productoId
    ? obtenerLotesPorProducto(formulario.productoId)
    : []
  const loteSeleccionado = obtenerLote(formulario.loteId)

  return (
    <section className="ventas-page">
      <div className="ventas-header">
        <div>
          <h1>Ventas</h1>
          <p>Registro de ventas, lotes, comprobantes y pagos</p>
        </div>

        <button
          type="button"
          className="btn-nueva-venta"
          onClick={abrirNuevaVenta}
        >
          <FaPlus />
          Nueva Venta
        </button>
      </div>

      {mensaje && (
        <div
          className={`mensaje-ventas ${mensaje.tipo}`}
          role={mensaje.tipo === 'error' ? 'alert' : 'status'}
        >
          <span>{mensaje.texto}</span>
          <button
            type="button"
            onClick={limpiarMensaje}
            aria-label="Cerrar mensaje"
          >
            <FaXmark />
          </button>
        </div>
      )}

      <div className="ventas-content">
        <div className="ventas-main-card">
          <div className="ventas-toolbar">
            <div className="ventas-search">
              <FaMagnifyingGlass />

              <input
                type="text"
                placeholder="Buscar por cliente, comprobante, fecha, total, pago o estado"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <span className="ventas-total">
              {ventasFiltradas.length}{' '}
              {ventasFiltradas.length === 1 ? 'venta' : 'ventas'}
            </span>
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
                {cargando && (
                  <tr>
                    <td colSpan="7" className="sin-resultados">
                      Cargando ventas...
                    </td>
                  </tr>
                )}

                {!cargando &&
                  ventasFiltradas.map((venta) => (
                    <tr key={venta.id}>
                      <td>
                        <div className="venta-fecha">
                          <div className="venta-icono">
                            <FaCashRegister />
                          </div>

                          <div>
                            <strong>{formatearFecha(venta.fecha)}</strong>
                            <small>{venta.numeroComprobante}</small>
                          </div>
                        </div>
                      </td>

                      <td>{venta.clienteNombre}</td>

                      <td>{obtenerCantidadProductos(venta.id)}</td>

                      <td>{formatoDinero.format(venta.total)}</td>

                      <td>{formatearTexto(venta.metodoPago)}</td>

                      <td>
                        <span
                          className={
                            venta.estado === 'completada'
                              ? 'estado-venta completada'
                              : 'estado-venta cancelada'
                          }
                        >
                          {formatearTexto(venta.estado)}
                        </span>
                      </td>

                      <td>
                        <div className="acciones">
                          <button
                            type="button"
                            className="btn-accion ver"
                            onClick={() => abrirVerVenta(venta)}
                            title="Ver venta"
                            aria-label="Ver venta"
                          >
                            <FaEye />
                          </button>

                          <button
                            type="button"
                            className="btn-accion pdf"
                            onClick={() => descargarPdf(venta)}
                            title="Descargar PDF"
                            aria-label="Descargar comprobante PDF"
                          >
                            <FaFilePdf />
                          </button>

                          <button
                            type="button"
                            className="btn-accion imprimir"
                            onClick={() => imprimirComprobante(venta)}
                            title="Imprimir comprobante"
                            aria-label="Imprimir comprobante"
                          >
                            <FaPrint />
                          </button>

                          <button
                            type="button"
                            className="btn-accion eliminar"
                            onClick={() => solicitarEliminarVenta(venta)}
                            title="Eliminar venta"
                            aria-label="Eliminar venta"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                {!cargando && ventasFiltradas.length === 0 && (
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
                <h2>Nueva Venta</h2>
                <p>
                  Seleccioná cliente, producto, lote y método de pago
                </p>

                <form className="venta-form" onSubmit={guardarVenta}>
                  <label htmlFor="venta-cliente">Cliente</label>
                  <select
                    id="venta-cliente"
                    name="clienteId"
                    value={formulario.clienteId}
                    onChange={manejarCambio}
                  >
                    <option value="">Seleccionar cliente</option>

                    {clientes
                      .filter((cliente) => cliente.estado)
                      .map((cliente) => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.nombre} {cliente.apellido}
                        </option>
                      ))}
                  </select>

                  <label htmlFor="venta-fecha">Fecha</label>
                  <input
                    id="venta-fecha"
                    type="date"
                    name="fecha"
                    value={formulario.fecha}
                    onChange={manejarCambio}
                  />

                  <div className="venta-productos-box">
                    <h3>Selección de productos</h3>

                    <label htmlFor="venta-producto">Producto</label>
                    <select
                      id="venta-producto"
                      name="productoId"
                      value={formulario.productoId}
                      onChange={manejarCambio}
                    >
                      <option value="">Seleccionar producto</option>

                      {productos
                        .filter(productoPuedeVenderse)
                        .map((producto) => (
                          <option key={producto.id} value={producto.id}>
                            {producto.descripcion} - Stock disponible:{' '}
                            {obtenerStockDisponibleProducto(
                              producto.id
                            )}
                          </option>
                        ))}
                    </select>

                    {productoSeleccionado &&
                      productoRequiereAutorizacion(
                        productoSeleccionado
                      ) && (
                        <div className="aviso-venta-restringida">
                          <FaTriangleExclamation />
                          <div>
                            <strong>
                              Producto con control de venta
                            </strong>
                            <span>
                              {obtenerCondicionVenta(
                                productoSeleccionado
                              )}
                              . Requiere autorización veterinaria o
                              receta.
                            </span>
                          </div>
                        </div>
                      )}

                    <label htmlFor="venta-lote">Lote</label>
                    <select
                      id="venta-lote"
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
                          disabled={
                            loteEstaVencido(lote) || lote.cantidad <= 0
                          }
                        >
                          {lote.lote} - Stock: {lote.cantidad} - Vence:{' '}
                          {lote.fechaVencimiento || 'Sin vencimiento'} -{' '}
                          {obtenerEstadoLote(lote)}
                        </option>
                      ))}
                    </select>

                    {loteSeleccionado && (
                      <div className="lote-seleccionado-info">
                        <span
                          className={obtenerClaseEstadoLote(
                            loteSeleccionado
                          )}
                        >
                          {obtenerEstadoLote(loteSeleccionado)}
                        </span>

                        <small>
                          Lote: {loteSeleccionado.lote} | Vencimiento:{' '}
                          {formatearFecha(
                            loteSeleccionado.fechaVencimiento
                          )}
                        </small>
                      </div>
                    )}

                    <label htmlFor="venta-cantidad">Cantidad</label>
                    <input
                      id="venta-cantidad"
                      type="text"
                      inputMode="numeric"
                      name="cantidad"
                      value={formulario.cantidad}
                      onChange={manejarCambio}
                    />

                    {productoSeleccionado &&
                      productoRequiereAutorizacion(
                        productoSeleccionado
                      ) && (
                        <label className="checkbox-autorizacion">
                          <input
                            type="checkbox"
                            name="autorizacionVeterinaria"
                            checked={
                              formulario.autorizacionVeterinaria
                            }
                            onChange={manejarCambio}
                          />
                          Venta autorizada por veterinario / receta
                          presentada
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
                      <p className="carrito-vacio">
                        No hay productos agregados.
                      </p>
                    )}

                    {carrito.map((item) => (
                      <div
                        className="carrito-item"
                        key={item.loteId}
                      >
                        <div>
                          <strong>{item.descripcion}</strong>
                          <span>
                            {item.cantidad} x{' '}
                            {formatoDinero.format(
                              item.precioUnitario
                            )}
                          </span>

                          <small>
                            Lote: {item.lote} | Vence:{' '}
                            {formatearFecha(item.fechaVencimiento)}
                          </small>

                          {item.requiereAutorizacion && (
                            <small className="autorizacion-ok">
                              Autorización veterinaria registrada
                            </small>
                          )}
                        </div>

                        <div className="carrito-item-right">
                          <strong>
                            {formatoDinero.format(item.subtotal)}
                          </strong>

                          <button
                            type="button"
                            onClick={() =>
                              quitarProducto(item.loteId)
                            }
                          >
                            <FaXmark />
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="carrito-total">
                      <span>Total</span>
                      <strong>
                        {formatoDinero.format(totalCarrito)}
                      </strong>
                    </div>
                  </div>

                  <label htmlFor="venta-metodo-pago">
                    Método de pago
                  </label>
                  <select
                    id="venta-metodo-pago"
                    name="metodoPago"
                    value={formulario.metodoPago}
                    onChange={manejarCambio}
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="debito">Débito</option>
                    <option value="credito">Crédito</option>
                    <option value="transferencia">
                      Transferencia
                    </option>
                  </select>

                  <label htmlFor="venta-estado">Estado</label>
                  <select
                    id="venta-estado"
                    name="estado"
                    value={formulario.estado}
                    onChange={manejarCambio}
                  >
                    <option value="completada">Completada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>

                  <button
                    type="submit"
                    className="btn-guardar"
                    disabled={guardando}
                  >
                    <FaFloppyDisk />
                    {guardando ? 'Registrando...' : 'Registrar Venta'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2>Detalle de Venta</h2>
                <p>Información registrada de la venta</p>

                <div className="venta-detalle">
                  <div>
                    <span>Comprobante</span>
                    <strong>
                      {ventaSeleccionada.numeroComprobante}
                    </strong>
                  </div>

                  <div>
                    <span>Cliente</span>
                    <strong>{ventaSeleccionada.clienteNombre}</strong>
                  </div>

                  <div>
                    <span>Fecha</span>
                    <strong>
                      {formatearFecha(ventaSeleccionada.fecha)}
                    </strong>
                  </div>

                  <div>
                    <span>Total</span>
                    <strong>
                      {formatoDinero.format(ventaSeleccionada.total)}
                    </strong>
                  </div>

                  <div>
                    <span>Método de pago</span>
                    <strong>
                      {formatearTexto(
                        ventaSeleccionada.metodoPago
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Estado</span>
                    <strong>
                      {formatearTexto(ventaSeleccionada.estado)}
                    </strong>
                  </div>

                  <div>
                    <span>Estado de pago</span>
                    <strong>
                      {formatearTexto(
                        ventaSeleccionada.estadoPago
                      )}
                    </strong>
                  </div>
                </div>

                <div className="detalle-productos-venta">
                  <h3>Productos vendidos</h3>

                  {obtenerDetallesVenta(
                    ventaSeleccionada.id
                  ).length === 0 && (
                    <p>Esta venta no tiene detalle cargado.</p>
                  )}

                  {obtenerDetallesVenta(
                    ventaSeleccionada.id
                  ).map((detalle) => {
                    const producto = obtenerProducto(
                      detalle.productoId
                    )

                    return (
                      <div
                        className="detalle-producto-item"
                        key={detalle.id}
                      >
                        <div>
                          <strong>
                            {detalle.descripcion ||
                              producto?.descripcion ||
                              'Producto'}
                          </strong>
                          <span>
                            {detalle.cantidad} x{' '}
                            {formatoDinero.format(
                              detalle.precioUnitario
                            )}
                          </span>

                          <small>
                            Lote: {detalle.lote || '-'} | Vence:{' '}
                            {formatearFecha(
                              detalle.fechaVencimiento
                            )}
                          </small>

                          {detalle.autorizacionVeterinaria && (
                            <small className="autorizacion-ok">
                              Autorización veterinaria registrada
                            </small>
                          )}
                        </div>

                        <strong>
                          {formatoDinero.format(detalle.subtotal)}
                        </strong>
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
                    onClick={() =>
                      imprimirComprobante(ventaSeleccionada)
                    }
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

      {ventaAEliminar && (
        <div className="modal-overlay" role="presentation">
          <div
            className="modal-confirmacion"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-eliminar-venta"
          >
            <div className="modal-icono">
              <FaTriangleExclamation />
            </div>

            <h3 id="titulo-eliminar-venta">Eliminar venta</h3>
            <p>
              ¿Seguro que querés eliminar esta venta? El stock de los
              productos se restaurará automáticamente.
            </p>

            <div className="modal-acciones">
              <button
                type="button"
                className="btn-modal-cancelar"
                onClick={() => setVentaAEliminar(null)}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="btn-modal-eliminar"
                onClick={eliminarVenta}
              >
                <FaTrash />
                Eliminar venta
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Ventas