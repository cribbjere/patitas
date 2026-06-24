import { useState } from 'react'
import {
  FaMagnifyingGlass,
  FaPlus,
  FaEye,
  FaPen,
  FaTrash,
  FaFloppyDisk,
  FaXmark,
  FaBoxOpen,
} from 'react-icons/fa6'

import { productos as productosIniciales } from '../data/mockData'
import './Productos.css'

const productoVacio = {
  descripcion: '',
  categoria: '',
  precio: '',
  estado: true,
}

function Productos() {
  const [productos, setProductos] = useState(productosIniciales)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [formulario, setFormulario] = useState(productoVacio)

  const formatoDinero = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  })

  const productosFiltrados = productos.filter((producto) => {
    const texto = `
      ${producto.descripcion}
      ${producto.categoria}
      ${producto.precio}
      ${producto.estado ? 'activo' : 'inactivo'}
    `.toLowerCase()

    return texto.includes(busqueda.toLowerCase())
  })

  const abrirNuevoProducto = () => {
    setFormulario(productoVacio)
    setProductoSeleccionado(null)
    setModoEdicion(false)
    setMostrarFormulario(true)
  }

  const abrirVerProducto = (producto) => {
    setProductoSeleccionado(producto)
    setMostrarFormulario(false)
    setModoEdicion(false)
  }

  const abrirEditarProducto = (producto) => {
    setFormulario({
      descripcion: producto.descripcion,
      categoria: producto.categoria,
      precio: producto.precio,
      estado: producto.estado,
    })

    setProductoSeleccionado(producto)
    setModoEdicion(true)
    setMostrarFormulario(true)
  }

  const cerrarPanel = () => {
    setFormulario(productoVacio)
    setProductoSeleccionado(null)
    setMostrarFormulario(false)
    setModoEdicion(false)
  }

  const manejarCambio = (e) => {
    const { name, value, type, checked } = e.target

    setFormulario({
      ...formulario,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const guardarProducto = (e) => {
    e.preventDefault()

    if (!formulario.descripcion || !formulario.categoria || !formulario.precio) {
      alert('Completá descripción, categoría y precio.')
      return
    }

    if (modoEdicion) {
      const productosActualizados = productos.map((producto) => {
        if (producto.id === productoSeleccionado.id) {
          return {
            id: productoSeleccionado.id,
            descripcion: formulario.descripcion,
            categoria: formulario.categoria,
            precio: Number(formulario.precio),
            estado: formulario.estado,
          }
        }

        return producto
      })

      setProductos(productosActualizados)
    } else {
      const nuevoProducto = {
        id: Date.now(),
        descripcion: formulario.descripcion,
        categoria: formulario.categoria,
        precio: Number(formulario.precio),
        estado: formulario.estado,
      }

      setProductos([...productos, nuevoProducto])
    }

    cerrarPanel()
  }

  const eliminarProducto = (id) => {
    const confirmar = window.confirm('¿Seguro que querés eliminar este producto?')

    if (!confirmar) return

    const productosActualizados = productos.filter(
      (producto) => producto.id !== id
    )

    setProductos(productosActualizados)

    if (productoSeleccionado?.id === id) {
      cerrarPanel()
    }
  }

  return (
    <section className="productos-page">
      <div className="productos-header">
        <div>
          <h1>Productos</h1>
          <p>Gestión de alimentos, medicamentos, higiene y accesorios</p>
        </div>

        <button className="btn-nuevo-producto" onClick={abrirNuevoProducto}>
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
                placeholder="Buscar por descripción, categoría, precio o estado"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <span className="productos-total">
              {productosFiltrados.length} productos
            </span>
          </div>

          <div className="productos-table-wrapper">
            <table className="productos-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
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
                          <small>ID producto: {producto.id}</small>
                        </div>
                      </div>
                    </td>

                    <td>{producto.categoria}</td>

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
                          className="btn-accion ver"
                          onClick={() => abrirVerProducto(producto)}
                          title="Ver producto"
                        >
                          <FaEye />
                        </button>

                        <button
                          className="btn-accion editar"
                          onClick={() => abrirEditarProducto(producto)}
                          title="Editar producto"
                        >
                          <FaPen />
                        </button>

                        <button
                          className="btn-accion eliminar"
                          onClick={() => eliminarProducto(producto.id)}
                          title="Eliminar producto"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {productosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan="5" className="sin-resultados">
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
            <button className="btn-cerrar" onClick={cerrarPanel}>
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
                  <label>Descripción</label>
                  <input
                    type="text"
                    name="descripcion"
                    value={formulario.descripcion}
                    onChange={manejarCambio}
                  />

                  <label>Categoría</label>
                  <select
                    name="categoria"
                    value={formulario.categoria}
                    onChange={manejarCambio}
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="Alimento">Alimento</option>
                    <option value="Medicamento">Medicamento</option>
                    <option value="Higiene">Higiene</option>
                    <option value="Accesorio">Accesorio</option>
                    <option value="Insumo">Insumo</option>
                    <option value="Otro">Otro</option>
                  </select>

                  <label>Precio</label>
                  <input
                    type="number"
                    name="precio"
                    value={formulario.precio}
                    onChange={manejarCambio}
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
                    Guardar Producto
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
                    <span>Precio</span>
                    <strong>
                      {formatoDinero.format(productoSeleccionado.precio)}
                    </strong>
                  </div>

                  <div>
                    <span>Estado</span>
                    <strong>
                      {productoSeleccionado.estado ? 'Activo' : 'Inactivo'}
                    </strong>
                  </div>
                </div>

                <button
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