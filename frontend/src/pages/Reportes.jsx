import {
  FaUsers,
  FaPaw,
  FaCalendarDays,
  FaStethoscope,
  FaSyringe,
  FaScissors,
  FaBoxOpen,
  FaBoxesStacked,
  FaCashRegister,
  FaTriangleExclamation,
} from 'react-icons/fa6'

import {
  clientes,
  mascotas,
  turnos,
  consultas,
  vacunaciones,
  serviciosHigiene,
  productos,
  stock,
  ventas,
} from '../data/mockData'

import './Reportes.css'

function Reportes() {
  const formatoDinero = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  })

  const totalVentas = ventas.reduce((total, venta) => total + venta.total, 0)

  const turnosProgramados = turnos.filter(
    (turno) => turno.estado === 'Programado' || !turno.estado
  ).length

  const turnosCancelados = turnos.filter(
    (turno) => turno.estado === 'Cancelado'
  ).length

  const productosActivos = productos.filter((producto) => producto.estado).length

  const productosBajoStock = stock.filter((item) => {
    return Number(item.cantidad) > 0 && Number(item.cantidad) <= Number(item.stockMinimo)
  })

  const productosSinStock = stock.filter((item) => Number(item.cantidad) === 0)

  const proximasVacunas = vacunaciones.filter((vacunacion) => {
    return vacunacion.proximaDosis || vacunacion.fecha
  })

  const serviciosRealizados = serviciosHigiene.filter(
    (servicio) => servicio.estado === 'Realizado'
  ).length

  const serviciosPendientes = serviciosHigiene.filter(
    (servicio) => servicio.estado === 'Pendiente'
  ).length

  const obtenerProducto = (productoId) => {
    return productos.find((producto) => producto.id === productoId)
  }

  return (
    <section className="reportes-page">
      <div className="reportes-header">
        <div>
          <h1>Reportes</h1>
          <p>Informes básicos para control administrativo</p>
        </div>
      </div>

      <div className="reportes-stats">
        <div className="reporte-card">
          <div>
            <p>Clientes</p>
            <strong>{clientes.length}</strong>
            <span>Total registrados</span>
          </div>

          <FaUsers className="reporte-icon" />
        </div>

        <div className="reporte-card">
          <div>
            <p>Mascotas</p>
            <strong>{mascotas.length}</strong>
            <span>Asociadas a clientes</span>
          </div>

          <FaPaw className="reporte-icon" />
        </div>

        <div className="reporte-card">
          <div>
            <p>Turnos</p>
            <strong>{turnos.length}</strong>
            <span>{turnosProgramados} programados</span>
          </div>

          <FaCalendarDays className="reporte-icon" />
        </div>

        <div className="reporte-card">
          <div>
            <p>Ventas</p>
            <strong>{formatoDinero.format(totalVentas)}</strong>
            <span>Total registrado</span>
          </div>

          <FaCashRegister className="reporte-icon" />
        </div>
      </div>

      <div className="reportes-grid">
        <div className="reporte-panel">
          <div className="reporte-panel-header">
            <FaStethoscope />
            <h2>Actividad clínica</h2>
          </div>

          <div className="reporte-lista">
            <div className="reporte-item">
              <span>Consultas registradas</span>
              <strong>{consultas.length}</strong>
            </div>

            <div className="reporte-item">
              <span>Vacunaciones registradas</span>
              <strong>{vacunaciones.length}</strong>
            </div>

            <div className="reporte-item">
              <span>Próximas vacunas</span>
              <strong>{proximasVacunas.length}</strong>
            </div>
          </div>
        </div>

        <div className="reporte-panel">
          <div className="reporte-panel-header">
            <FaScissors />
            <h2>Servicios de higiene</h2>
          </div>

          <div className="reporte-lista">
            <div className="reporte-item">
              <span>Servicios registrados</span>
              <strong>{serviciosHigiene.length}</strong>
            </div>

            <div className="reporte-item">
              <span>Servicios realizados</span>
              <strong>{serviciosRealizados}</strong>
            </div>

            <div className="reporte-item">
              <span>Servicios pendientes</span>
              <strong>{serviciosPendientes}</strong>
            </div>
          </div>
        </div>

        <div className="reporte-panel">
          <div className="reporte-panel-header">
            <FaBoxOpen />
            <h2>Productos</h2>
          </div>

          <div className="reporte-lista">
            <div className="reporte-item">
              <span>Productos cargados</span>
              <strong>{productos.length}</strong>
            </div>

            <div className="reporte-item">
              <span>Productos activos</span>
              <strong>{productosActivos}</strong>
            </div>

            <div className="reporte-item">
              <span>Registros de stock</span>
              <strong>{stock.length}</strong>
            </div>
          </div>
        </div>

        <div className="reporte-panel alerta">
          <div className="reporte-panel-header">
            <FaTriangleExclamation />
            <h2>Alertas de stock</h2>
          </div>

          <div className="reporte-lista">
            <div className="reporte-item">
              <span>Productos con bajo stock</span>
              <strong>{productosBajoStock.length}</strong>
            </div>

            <div className="reporte-item">
              <span>Productos sin stock</span>
              <strong>{productosSinStock.length}</strong>
            </div>

            <div className="reporte-item">
              <span>Turnos cancelados</span>
              <strong>{turnosCancelados}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="reportes-bottom-grid">
        <div className="reporte-tabla-card">
          <div className="reporte-panel-header">
            <FaBoxesStacked />
            <h2>Productos con bajo stock</h2>
          </div>

          <table className="reporte-tabla">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Stock mínimo</th>
              </tr>
            </thead>

            <tbody>
              {productosBajoStock.map((item) => {
                const producto = obtenerProducto(item.productoId)

                return (
                  <tr key={item.id}>
                    <td>{producto?.descripcion}</td>
                    <td>{item.cantidad}</td>
                    <td>{item.stockMinimo}</td>
                  </tr>
                )
              })}

              {productosBajoStock.length === 0 && (
                <tr>
                  <td colSpan="3" className="sin-resultados">
                    No hay productos con bajo stock.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="reporte-tabla-card">
          <div className="reporte-panel-header">
            <FaSyringe />
            <h2>Próximas vacunaciones</h2>
          </div>

          <table className="reporte-tabla">
            <thead>
              <tr>
                <th>Mascota</th>
                <th>Vacuna</th>
                <th>Fecha</th>
              </tr>
            </thead>

            <tbody>
              {vacunaciones.map((vacunacion) => {
                const mascota = mascotas.find(
                  (item) => item.id === vacunacion.mascotaId
                )

                return (
                  <tr key={vacunacion.id}>
                    <td>{mascota?.nombre}</td>
                    <td>{vacunacion.vacuna}</td>
                    <td>{vacunacion.proximaDosis || vacunacion.fecha}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default Reportes