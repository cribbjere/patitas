import { useMemo, useState } from 'react'
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

import { productos as productosIniciales } from '../data/mockData'
import { soloNumerosDecimales } from '../utils/validaciones'
import './Productos.css'

const productoVacio = {
  descripcion: '',
  categoria: '',
  tipoProducto: 'Producto',
  condicionVenta: 'Venta libre',
  laboratorio: '',
  precio: '',
  estado: true,
}

const formatoDinero = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

function Productos() {
  const [productos, setProductos] = useState(productosIniciales)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [formulario, setFormulario] = useState(productoVacio)
  const [errorFormulario, setErrorFormulario] = useState('')

  const obtenerTipoProducto = (producto) => {
    return producto.tipoProducto || producto.categoria || 'Producto'
  }

  const obtenerCondicionVenta = (producto) => {
    return producto.condicionVenta || 'Venta libre'
  }

  const obtenerLaboratorio = (producto) => {
    return producto.laboratorio || 'Sin especificar'
  }

  const productosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()

    return productos.filter((producto) => {
      const texto = `
        ${producto.descripcion}
        ${producto.categoria}
        ${obtenerTipoProducto(producto)}
        ${obtenerCondicionVenta(producto)}
        ${obtenerLaboratorio(producto)}
        ${producto.precio}
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
      tipoProducto: producto.tipoProducto || producto.categoria || 'Producto',
      condicionVenta: producto.condicionVenta || 'Venta libre',
      laboratorio: producto.laboratorio || '',
      precio: String(producto.precio ?? ''),
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

    if (name === 'tipoProducto') {
      let nuevaCategoria = formulario.categoria
      let nuevaCondicion = formulario.condicionVenta

      if (value === 'Producto') {
        nuevaCondicion = 'Venta libre'
      }

      if (value === 'Medicamento') {
        nuevaCategoria = 'Medicamento'
        nuevaCondicion = 'Uso veterinario'
      }

      if (value === 'Vacuna') {
        nuevaCategoria = 'Vacuna'
        nuevaCondicion = 'Requiere receta'
      }

      setFormulario((formularioActual) => ({
        ...formularioActual,
        tipoProducto: value,
        categoria: nuevaCategoria,
        condicionVenta: nuevaCondicion,
      }))

      if (errorFormulario) setErrorFormulario('')
      return
    }

    let nuevoValor = value

    if (name === 'precio') {
      nuevoValor = soloNumerosDecimales(value)
    }

    setFormulario((formularioActual) => ({
      ...formularioActual,
      [name]: type === 'checkbox' ? checked : nuevoValor,
    }))

    if (errorFormulario) setErrorFormulario('')
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

    if (!formulario.condicionVenta) {
      return 'Seleccioná la condición de venta.'
    }

    if (!formulario.precio || Number(formulario.precio) <= 0) {
      return 'Ingresá un precio válido mayor que cero.'
    }

    if (
      (formulario.tipoProducto === 'Medicamento' ||
        formulario.tipoProducto === 'Vacuna') &&
      !formulario.laboratorio.trim()
    ) {
      return 'Para medicamentos y vacunas se debe indicar laboratorio o marca.'
    }

    return ''
  }

  const guardarProducto = (e) => {
    e.preventDefault()

    const error = validarFormulario()

    if (error) {
      setErrorFormulario(error)
      return
    }

    const datosProducto = {
      descripcion: formulario.descripcion.trim(),
      categoria: formulario.categoria,
      tipoProducto: formulario.tipoProducto,
      condicionVenta: formulario.condicionVenta,
      laboratorio: formulario.laboratorio.trim(),
      precio: Number(formulario.precio),
      estado: formulario.estado,
    }

    if (modoEdicion && productoSeleccionado) {
      setProductos((productosActuales) =>
        productosActuales.map((producto) =>
          producto.id === productoSeleccionado.id
            ? { ...producto, ...datosProducto }
            : producto
        )
      )
    } else {
      setProductos((productosActuales) => [
        ...productosActuales,
        {
          id: Date.now(),
          ...datosProducto,
        },
      ])
    }

    cerrarPanel()
  }

  const eliminarProducto = (id) => {
    const confirmar = window.confirm(
      '¿Seguro que querés eliminar este producto?'
    )

    if (!confirmar) return

    setProductos((productosActuales) =>
      productosActuales.filter((producto) => producto.id !== id)
    )

    if (productoSeleccionado?.id === id) {
      cerrarPanel()
    }
  }

  const obtenerClaseCondicion = (producto) => {
    const condicion = obtenerCondicionVenta(producto)

    if (condicion === 'Requiere receta') {
      return 'condicion-producto receta'
    }

    if (condicion === 'Uso veterinario') {
      return 'condicion-producto veterinario'
    }

    return 'condicion-producto libre'
  }

  const productoRestringido = (producto) => {
    const condicion = obtenerCondicionVenta(producto)

    return condicion === 'Requiere receta' || condicion === 'Uso veterinario'
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
                  <th>Condición</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {productosFiltrados.map((producto) => (
                  <tr key={producto.id}>
                    <td>
                      <div className="producto-nombre">
                        <div className="producto-icono">
                          <FaBoxOpen />
                        </div>

                        <div>
                          <strong>{producto.descripcion}</strong>
                          <small>
                            {obtenerLaboratorio(producto)} · ID {producto.id}
                          </small>
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
                      <span className={obtenerClaseCondicion(producto)}>
                        {obtenerCondicionVenta(producto)}
                      </span>
                    </td>

                    <td>{formatoDinero.format(producto.precio)}</td>

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
                ))}

                {productosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan="7" className="sin-resultados">
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
                    <option value="Producto">Producto</option>
                    <option value="Medicamento">Medicamento</option>
                    <option value="Vacuna">Vacuna</option>
                  </select>

                  <label htmlFor="condicionVenta">Condición de venta</label>
                  <select
                    id="condicionVenta"
                    name="condicionVenta"
                    value={formulario.condicionVenta}
                    onChange={manejarCambio}
                  >
                    <option value="Venta libre">Venta libre</option>
                    <option value="Uso veterinario">Uso veterinario</option>
                    <option value="Requiere receta">Requiere receta</option>
                  </select>

                  <label htmlFor="laboratorio">Laboratorio / Marca</label>
                  <input
                    id="laboratorio"
                    type="text"
                    name="laboratorio"
                    value={formulario.laboratorio}
                    onChange={manejarCambio}
                    placeholder="Ej: LabVet, VitalCan, Holliday"
                  />

                  <label htmlFor="precio">Precio</label>
                  <input
                    id="precio"
                    type="text"
                    inputMode="decimal"
                    name="precio"
                    value={formulario.precio}
                    onChange={manejarCambio}
                    placeholder="Ej: 12500"
                  />

                  {(formulario.condicionVenta === 'Requiere receta' ||
                    formulario.condicionVenta === 'Uso veterinario') && (
                    <div className="aviso-producto-restringido">
                      <FaTriangleExclamation />
                      <div>
                        <strong>Producto con control de venta</strong>
                        <span>
                          En ventas se deberá controlar autorización o indicación
                          veterinaria.
                        </span>
                      </div>
                    </div>
                  )}

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
                    <span>Condición de venta</span>
                    <span className={obtenerClaseCondicion(productoSeleccionado)}>
                      {obtenerCondicionVenta(productoSeleccionado)}
                    </span>
                  </div>

                  <div>
                    <span>Laboratorio / Marca</span>
                    <strong>{obtenerLaboratorio(productoSeleccionado)}</strong>
                  </div>

                  <div>
                    <span>Precio</span>
                    <strong>
                      {formatoDinero.format(productoSeleccionado.precio)}
                    </strong>
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

                {productoRestringido(productoSeleccionado) && (
                  <div className="aviso-producto-restringido">
                    <FaTriangleExclamation />
                    <div>
                      <strong>Producto con control de venta</strong>
                      <span>
                        Este producto debe controlarse antes de venderse.
                      </span>
                    </div>
                  </div>
                )}

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