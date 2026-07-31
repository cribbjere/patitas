import { useEffect, useMemo, useState } from 'react'
import {
  FaMagnifyingGlass,
  FaPlus,
  FaEye,
  FaPen,
  FaTrash,
  FaFloppyDisk,
  FaXmark,
  FaBoxOpen,
  FaTriangleExclamation,
} from 'react-icons/fa6'
import {
  obtenerProductos,
  crearProducto,
  editarProducto,
  eliminarProducto as eliminarProductoAPI,
} from '../services/productosService'
import { soloNumerosDecimales } from '../utils/validaciones'
import { crearAlertaSistema } from '../utils/alertasSistema'
import './Productos.css'

const productoVacio = {
  descripcion: '',
  categoria: '',
  tipoProducto: 'comercial',
  precioCompraReferencia: '',
  precioVenta: '',
  stockMinimo: '0',
  estado: true,
}

const formatoDinero = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})
function obtenerDiasParaVencer(fechaVencimiento) {
  if (!fechaVencimiento) {
    return null
  }

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const vencimiento = new Date(
    `${fechaVencimiento}T00:00:00`
  )
  vencimiento.setHours(0, 0, 0, 0)

  if (Number.isNaN(vencimiento.getTime())) {
    return null
  }

  const diferencia = vencimiento - hoy

  return Math.ceil(
    diferencia / (1000 * 60 * 60 * 24)
  )
}
function obtenerAlertaVencimiento(producto) {
  const lotes = Array.isArray(producto.lotes)
    ? producto.lotes
    : []

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const lotesConStock = lotes
    .map((lote) => {
      const cantidad = Number(
        lote.cantidadDisponible ??
          lote.cantidad_disponible ??
          0
      )

      const fechaVencimiento =
        lote.fechaVencimiento ??
        lote.fecha_vencimiento ??
        ''

      const numeroLote =
        lote.numeroLote ??
        lote.numero_lote ??
        'Sin número'

      if (cantidad <= 0 || !fechaVencimiento) {
        return null
      }

      const fecha = new Date(
        `${fechaVencimiento}T00:00:00`
      )

      if (Number.isNaN(fecha.getTime())) {
        return null
      }

      const dias = Math.ceil(
        (fecha - hoy) / (1000 * 60 * 60 * 24)
      )

      return {
        numeroLote,
        fechaVencimiento,
        dias,
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.dias - b.dias)

  if (lotesConStock.length === 0) {
    return {
      texto: 'Sin vencimiento',
      detalle: 'Sin lotes con stock',
      clase: 'sin-alerta',
    }
  }

  const loteMasUrgente = lotesConStock[0]

  if (loteMasUrgente.dias < 0) {
    return {
      texto: 'Vencido',
      detalle: `Lote ${loteMasUrgente.numeroLote}`,
      clase: 'vencido',
    }
  }

  if (loteMasUrgente.dias === 0) {
    return {
      texto: 'Vence hoy',
      detalle: `Lote ${loteMasUrgente.numeroLote}`,
      clase: 'vence-hoy',
    }
  }

  if (loteMasUrgente.dias <= 30) {
    return {
      texto: `Vence en ${loteMasUrgente.dias} días`,
      detalle: `Lote ${loteMasUrgente.numeroLote}`,
      clase: 'proximo',
    }
  }

  return {
    texto: 'Sin alerta',
    detalle: `Próximo: ${loteMasUrgente.fechaVencimiento}`,
    clase: 'sin-alerta',
  }
}
function Productos() {
  const [productos, setProductos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [formulario, setFormulario] = useState(productoVacio)
  const [errorFormulario, setErrorFormulario] = useState('')

  const cargarProductos = async () => {
  try {
    const productosAPI = await obtenerProductos()

    const productosConvertidos = productosAPI.map((producto) => ({
  id: producto.id,
  descripcion: producto.descripcion,
  categoria: producto.categoria,
  tipoProducto: producto.tipo_producto,
  precioCompraReferencia:
    producto.precio_compra_referencia ?? '',
  precioVenta: producto.precio_venta ?? '',
  stockMinimo: producto.stock_minimo ?? 0,
  stockActual: producto.stock_actual ?? 0,
  lotes: producto.lotes || [],
  estado: producto.estado === 'activo',
}))

    setProductos(productosConvertidos)
  } catch (error) {
    console.error('Error al cargar los productos:', error)

    window.alert(
      error.response?.data?.detail ||
        'No se pudieron cargar los productos.'
    )
  }
}

useEffect(() => {
  cargarProductos()
}, [])
useEffect(() => {
  productos.forEach((producto) => {
    const lotes = Array.isArray(producto.lotes)
      ? producto.lotes
      : []

    lotes.forEach((lote) => {
      const cantidad = Number(
        lote.cantidadDisponible ??
        lote.cantidad_disponible ??
        0
      )

      const fechaVencimiento =
        lote.fechaVencimiento ??
        lote.fecha_vencimiento ??
        ''

      const numeroLote =
        lote.numeroLote ??
        lote.numero_lote ??
        'Sin número'

      if (cantidad <= 0 || !fechaVencimiento) {
        return
      }

      const diasParaVencer =
        obtenerDiasParaVencer(fechaVencimiento)

      if (
        diasParaVencer === null ||
        diasParaVencer > 30
      ) {
        return
      }

      const loteVencido = diasParaVencer < 0
      const venceHoy = diasParaVencer === 0

      let titulo = ''
      let mensaje = ''

      if (loteVencido) {
        titulo = 'Lote vencido'
        mensaje =
          `El lote ${numeroLote} del producto ` +
          `${producto.descripcion} está vencido. ` +
          'No debe venderse ni utilizarse.'
      } else if (venceHoy) {
        titulo = 'Lote vence hoy'
        mensaje =
          `El lote ${numeroLote} del producto ` +
          `${producto.descripcion} vence hoy.`
      } else {
        titulo = 'Lote próximo a vencer'
        mensaje =
          `El lote ${numeroLote} del producto ` +
          `${producto.descripcion} vence en ` +
          `${diasParaVencer} días.`
      }

      crearAlertaSistema({
        clave:
          `lote-vencimiento-${producto.id}-` +
          `${lote.id || numeroLote}-` +
          `${loteVencido ? 'vencido' : 'proximo'}`,
        titulo,
        mensaje,
        origen: 'Productos',
        cliente: 'Control interno',
        telefono: '',
        mascota: producto.descripcion,
      })
    })
  })
}, [productos])
  const obtenerTipoProducto = (producto) => {
  if (producto.tipoProducto === 'comercial') {
    return 'Comercial'
  }

  if (producto.tipoProducto === 'interno') {
    return 'Uso interno'
  }

  if (producto.tipoProducto === 'ambos') {
    return 'Comercial e interno'
  }

  return 'Sin especificar'
}



  const productosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()

    return productos.filter((producto) => {
      const texto = `
        ${producto.descripcion}
        ${producto.categoria}
        ${obtenerTipoProducto(producto)}
        ${producto.precioCompraReferencia}
        ${producto.precioVenta}
        ${producto.stockMinimo}
        ${producto.estado ? 'activo' : 'inactivo'}
      `.toLowerCase()

      return texto.includes(termino)
    })
  }, [busqueda, productos])

  const abrirNuevoProducto = () => {
    setFormulario(productoVacio)
    setProductoSeleccionado(null)
    setModoEdicion(false)
    setErrorFormulario('')
    setMostrarFormulario(true)
  }

  const abrirVerProducto = (producto) => {
    setProductoSeleccionado(producto)
    setMostrarFormulario(false)
    setModoEdicion(false)
    setErrorFormulario('')
  }

 const abrirEditarProducto = (producto) => {
  setFormulario({
    descripcion: producto.descripcion || '',
    categoria: producto.categoria || '',
    tipoProducto: producto.tipoProducto || 'comercial',
    precioCompraReferencia: String(
      producto.precioCompraReferencia ?? ''
    ),
    precioVenta: String(producto.precioVenta ?? ''),
    stockMinimo: String(producto.stockMinimo ?? 0),
    estado: Boolean(producto.estado),
  })

  setProductoSeleccionado(producto)
  setModoEdicion(true)
  setErrorFormulario('')
  setMostrarFormulario(true)
}

  const cerrarPanel = () => {
    setFormulario(productoVacio)
    setProductoSeleccionado(null)
    setMostrarFormulario(false)
    setModoEdicion(false)
    setErrorFormulario('')
  }

  const manejarCambio = (e) => {
  const { name, value, type, checked } = e.target

  let nuevoValor = value

  if (
    name === 'precioCompraReferencia' ||
    name === 'precioVenta'
  ) {
    nuevoValor = soloNumerosDecimales(value)
  }

  if (name === 'stockMinimo') {
    nuevoValor = value.replace(/\D/g, '')
  }

  setFormulario((formularioActual) => ({
    ...formularioActual,
    [name]: type === 'checkbox' ? checked : nuevoValor,
  }))

  if (errorFormulario) {
    setErrorFormulario('')
  }
}
  const validarFormulario = () => {
  if (!formulario.descripcion.trim()) {
    return 'Ingresá la descripción del producto.'
  }

  if (!formulario.categoria) {
    return 'Seleccioná una categoría.'
  }

  if (!formulario.tipoProducto) {
    return 'Seleccioná el tipo de producto.'
  }

  if (
    !formulario.precioVenta ||
    Number(formulario.precioVenta) <= 0
  ) {
    return 'Ingresá un precio de venta mayor que cero.'
  }

  if (
    formulario.precioCompraReferencia &&
    Number(formulario.precioCompraReferencia) < 0
  ) {
    return 'El precio de compra no puede ser negativo.'
  }

  if (
    formulario.stockMinimo &&
    Number(formulario.stockMinimo) < 0
  ) {
    return 'El stock mínimo no puede ser negativo.'
  }

  return ''
}
  const guardarProducto = async (e) => {
  e.preventDefault()

  const error = validarFormulario()

  if (error) {
    setErrorFormulario(error)
    return
  }

  const datos = {
    descripcion: formulario.descripcion.trim(),
    categoria: formulario.categoria,
    tipo_producto: formulario.tipoProducto,
    precio_compra_referencia:
      formulario.precioCompraReferencia || 0,
    precio_venta: formulario.precioVenta,
    stock_minimo: formulario.stockMinimo || 0,
    estado: formulario.estado ? 'activo' : 'inactivo',
  }

  try {
    setErrorFormulario('')

    if (modoEdicion && productoSeleccionado) {
      await editarProducto(productoSeleccionado.id, datos)
    } else {
      await crearProducto(datos)
    }

    await cargarProductos()
    cerrarPanel()
  } catch (errorGuardar) {
    console.error(
      'Error al guardar el producto:',
      errorGuardar
    )

    setErrorFormulario(
      errorGuardar.response?.data?.detail ||
        Object.values(errorGuardar.response?.data || {})
          .flat()
          .join(' ') ||
        'No se pudo guardar el producto.'
    )
  }
}

  const eliminarProducto = async (id) => {
  const confirmar = window.confirm(
    '¿Seguro que querés eliminar este producto?'
  )

  if (!confirmar) return

  try {
    await eliminarProductoAPI(id)

    setProductos((productosActuales) =>
      productosActuales.filter(
        (producto) => producto.id !== id
      )
    )

    if (productoSeleccionado?.id === id) {
      cerrarPanel()
    }
  } catch (error) {
    console.error('Error al eliminar el producto:', error)

    window.alert(
      error.response?.data?.detail ||
        Object.values(error.response?.data || {})
          .flat()
          .join(' ') ||
        'No se pudo eliminar el producto. Puede estar asociado a movimientos de stock o ventas.'
    )
  }
}

  return (
    <section className="productos-page">
      <div className="productos-header">
        <div>
          <h1>Productos</h1>
          <p>
            Gestión de alimentos, medicamentos, vacunas, higiene y accesorios
          </p>
        </div>

        <button
          type="button"
          className="btn-nuevo-producto"
          onClick={abrirNuevoProducto}
        >
          <FaPlus />
          Nuevo Producto
        </button>
      </div>

      <div className="productos-content">
        <div className="productos-main-card">
          <div className="productos-toolbar">
            <div className="productos-search">
              <FaMagnifyingGlass />

              <input
                type="text"
                placeholder="Buscar por descripción, categoría, tipo, condición o estado"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <span className="productos-total">
              {productosFiltrados.length}{' '}
              {productosFiltrados.length === 1 ? 'producto' : 'productos'}
            </span>
          </div>

          <div className="productos-table-wrapper">
            <table className="productos-table">
              <thead>
                <tr>
  <th>Producto</th>
  <th>Categoría</th>
  <th>Tipo</th>
  <th>Precio compra</th>
  <th>Precio venta</th>
  <th>Stock mínimo</th>
  <th>Vencimiento</th>
  <th>Estado</th>
  <th>Acciones</th>
</tr>
              </thead>

              <tbody>
                
                {productosFiltrados.map((producto) => {
  const alertaVencimiento =
    obtenerAlertaVencimiento(producto)

  return (
    <tr key={producto.id}>
                    <td>
                      <div className="producto-nombre">
                        <div className="producto-icono">
                          <FaBoxOpen />
                        </div>

                        <div>
                          <strong>{producto.descripcion}</strong>
                          <small>ID {producto.id}</small>
                        </div>
                      </div>
                    </td>

                    <td>{producto.categoria}</td>

                    <td>
                      <span className="tipo-producto">
                        {obtenerTipoProducto(producto)}
                      </span>
                    </td>

                    <td>
  {formatoDinero.format(
    Number(producto.precioCompraReferencia || 0)
  )}
</td>

<td>
  {formatoDinero.format(
    Number(producto.precioVenta || 0)
  )}
</td>

<td>{producto.stockMinimo}</td>
<td>
  <div className="vencimiento-producto">
    <span
      className={`alerta-vencimiento ${alertaVencimiento.clase}`}
    >
      {alertaVencimiento.texto}
    </span>

    <small>{alertaVencimiento.detalle}</small>
  </div>
</td>
                    <td>
                      <span
                        className={
                          producto.estado
                            ? 'estado-producto activo'
                            : 'estado-producto inactivo'
                        }
                      >
                        {producto.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    <td>
                      <div className="acciones">
                        <button
                          type="button"
                          className="btn-accion ver"
                          onClick={() => abrirVerProducto(producto)}
                          title="Ver producto"
                          aria-label="Ver producto"
                        >
                          <FaEye />
                        </button>

                        <button
                          type="button"
                          className="btn-accion editar"
                          onClick={() => abrirEditarProducto(producto)}
                          title="Editar producto"
                          aria-label="Editar producto"
                        >
                          <FaPen />
                        </button>

                        <button
                          type="button"
                          className="btn-accion eliminar"
                          onClick={() => eliminarProducto(producto.id)}
                          title="Eliminar producto"
                          aria-label="Eliminar producto"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}

                {productosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan="9" className="sin-resultados">
                      No se encontraron productos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {(mostrarFormulario || productoSeleccionado) && (
          <aside className="productos-side-card">
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
                <h2>{modoEdicion ? 'Editar Producto' : 'Nuevo Producto'}</h2>

                <p>
                  {modoEdicion
                    ? 'Modificá los datos del producto seleccionado'
                    : 'Cargá un nuevo producto para ventas y stock'}
                </p>

                <form className="producto-form" onSubmit={guardarProducto}>
                  {errorFormulario && (
                    <div className="producto-form-error" role="alert">
                      <FaTriangleExclamation />
                      <span>{errorFormulario}</span>
                    </div>
                  )}

                  <label htmlFor="descripcion">Descripción</label>
                  <input
                    id="descripcion"
                    type="text"
                    name="descripcion"
                    value={formulario.descripcion}
                    onChange={manejarCambio}
                    placeholder="Ej: Antiparasitario interno"
                  />

                  <label htmlFor="categoria">Categoría</label>
                  <select
                    id="categoria"
                    name="categoria"
                    value={formulario.categoria}
                    onChange={manejarCambio}
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="Alimento">Alimento</option>
                    <option value="Medicamento">Medicamento</option>
                    <option value="Vacuna">Vacuna</option>
                    <option value="Higiene">Higiene</option>
                    <option value="Accesorio">Accesorio</option>
                    <option value="Insumo">Insumo</option>
                    <option value="Otro">Otro</option>
                  </select>

                  <label htmlFor="tipoProducto">Tipo de producto</label>

<select
  id="tipoProducto"
  name="tipoProducto"
  value={formulario.tipoProducto}
  onChange={manejarCambio}
>
  <option value="comercial">Comercial</option>
  <option value="interno">Uso interno</option>
  <option value="ambos">Comercial e interno</option>
</select>

                
                  <label htmlFor="precioCompraReferencia">
  Precio de compra de referencia
</label>

<input
  id="precioCompraReferencia"
  type="text"
  inputMode="decimal"
  name="precioCompraReferencia"
  value={formulario.precioCompraReferencia}
  onChange={manejarCambio}
  placeholder="Ej: 8000"
/>

<label htmlFor="precioVenta">Precio de venta</label>

<input
  id="precioVenta"
  type="text"
  inputMode="decimal"
  name="precioVenta"
  value={formulario.precioVenta}
  onChange={manejarCambio}
  placeholder="Ej: 12500"
/>

<label htmlFor="stockMinimo">Stock mínimo</label>

<input
  id="stockMinimo"
  type="number"
  min="0"
  step="1"
  name="stockMinimo"
  value={formulario.stockMinimo}
  onChange={manejarCambio}
  placeholder="Ej: 5"
/>
                  

                  <label className="checkbox-producto">
                    <input
                      type="checkbox"
                      name="estado"
                      checked={formulario.estado}
                      onChange={manejarCambio}
                    />
                    Producto activo
                  </label>

                  <button type="submit" className="btn-guardar">
                    <FaFloppyDisk />
                    {modoEdicion ? 'Guardar Cambios' : 'Guardar Producto'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2>Detalle del Producto</h2>
                <p>Información registrada del producto</p>

                <div className="producto-detalle">
                  <div>
                    <span>Descripción</span>
                    <strong>{productoSeleccionado.descripcion}</strong>
                  </div>

                  <div>
                    <span>Categoría</span>
                    <strong>{productoSeleccionado.categoria}</strong>
                  </div>

                  <div>
                    <span>Tipo</span>
                    <span className="tipo-producto">
                      {obtenerTipoProducto(productoSeleccionado)}
                    </span>
                  </div>

                  <div>
  <span>Precio de compra de referencia</span>
  <strong>
    {formatoDinero.format(
      Number(
        productoSeleccionado.precioCompraReferencia || 0
      )
    )}
  </strong>
</div>

<div>
  <span>Precio de venta</span>
  <strong>
    {formatoDinero.format(
      Number(productoSeleccionado.precioVenta || 0)
    )}
  </strong>
</div>

<div>
  <span>Stock mínimo</span>
  <strong>{productoSeleccionado.stockMinimo}</strong>
</div>

                  <div>
                    <span>Estado</span>
                    <span
                      className={
                        productoSeleccionado.estado
                          ? 'estado-producto activo'
                          : 'estado-producto inactivo'
                      }
                    >
                      {productoSeleccionado.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>

                

                <button
                  type="button"
                  className="btn-editar-detalle"
                  onClick={() => abrirEditarProducto(productoSeleccionado)}
                >
                  <FaPen />
                  Editar Producto
                </button>
              </>
            )}
          </aside>
        )}
      </div>
    </section>
  )
}

export default Productos