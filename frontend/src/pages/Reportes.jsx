import { useMemo } from 'react'
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

function normalizarFecha(fecha) {
  if (!fecha) return null

  const fechaNormalizada = new Date(`${fecha}T00:00:00`)

  return Number.isNaN(fechaNormalizada.getTime()) ? null : fechaNormalizada
}

function formatearFecha(fecha) {
  const fechaValida = normalizarFecha(fecha)

  if (!fechaValida) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-AR').format(fechaValida)
}

function obtenerDiasParaVencer(fechaVencimiento) {
  const vencimiento = normalizarFecha(fechaVencimiento)

  if (!vencimiento) return null

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  vencimiento.setHours(0, 0, 0, 0)

  return Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24))
}

function Reportes() {
  const formatoDinero = useMemo(
    () =>
      new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0,
      }),
    []
  )

  const totalVentas = useMemo(
    () => ventas.reduce((total, venta) => total + Number(venta.total || 0), 0),
    []
  )

  const turnosProgramados = useMemo(
    () =>
      turnos.filter(
        (turno) => turno.estado === 'Programado' || !turno.estado
      ).length,
    []
  )

  const turnosCancelados = useMemo(
    () => turnos.filter((turno) => turno.estado === 'Cancelado').length,
    []
  )

  const productosActivos = useMemo(
    () => productos.filter((producto) => producto.estado).length,
    []
  )

  const productosBajoStock = useMemo(
    () =>
      stock.filter((item) => {
        const cantidad = Number(item.cantidad)
        const stockMinimo = Number(item.stockMinimo)

        return cantidad > 0 && cantidad <= stockMinimo
      }),
    []
  )

  const productosSinStock = useMemo(
    () => stock.filter((item) => Number(item.cantidad) <= 0),
    []
  )

  const productosVencidos = useMemo(
    () =>
      stock.filter((item) => {
        const dias = obtenerDiasParaVencer(item.fechaVencimiento)
        return dias !== null && dias < 0
      }),
    []
  )

  const productosProximosAVencer = useMemo(
    () =>
      stock.filter((item) => {
        const dias = obtenerDiasParaVencer(item.fechaVencimiento)
        return dias !== null && dias >= 0 && dias <= 30
      }),
    []
  )

  const proximasVacunas = useMemo(() => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    return vacunaciones
      .map((vacunacion) => ({
        ...vacunacion,
        fechaReporte: vacunacion.proximaDosis || vacunacion.fecha,
      }))
      .filter((vacunacion) => {
        const fecha = normalizarFecha(vacunacion.fechaReporte)
        return fecha && fecha >= hoy
      })
      .sort((a, b) => {
        const fechaA = normalizarFecha(a.fechaReporte)
        const fechaB = normalizarFecha(b.fechaReporte)

        return fechaA - fechaB
      })
  }, [])

  const serviciosRealizados = useMemo(
    () =>
      serviciosHigiene.filter((servicio) => servicio.estado === 'Realizado')
        .length,
    []
  )

  const serviciosPendientes = useMemo(
    () =>
      serviciosHigiene.filter((servicio) => servicio.estado === 'Pendiente')
        .length,
    []
  )

  const porcentajeProductosActivos = productos.length
    ? Math.round((productosActivos / productos.length) * 100)
    : 0

  const obtenerProducto = (productoId) => {
    return productos.find((producto) => producto.id === productoId)
  }

  const obtenerMascota = (mascotaId) => {
    return mascotas.find((mascota) => mascota.id === mascotaId)
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
        <article className="reporte-card">
          <div>
            <p>Clientes</p>
            <strong>{clientes.length}</strong>
            <span>Total registrados</span>
          </div>

          <FaUsers className="reporte-icon" aria-hidden="true" />
        </article>

        <article className="reporte-card">
          <div>
            <p>Mascotas</p>
            <strong>{mascotas.length}</strong>
            <span>Asociadas a clientes</span>
          </div>

          <FaPaw className="reporte-icon" aria-hidden="true" />
        </article>

        <article className="reporte-card">
          <div>
            <p>Turnos</p>
            <strong>{turnos.length}</strong>
            <span>{turnosProgramados} programados</span>
          </div>

          <FaCalendarDays className="reporte-icon" aria-hidden="true" />
        </article>

        <article className="reporte-card">
          <div>
            <p>Ventas</p>
            <strong>{formatoDinero.format(totalVentas)}</strong>
            <span>Total registrado</span>
          </div>

          <FaCashRegister className="reporte-icon" aria-hidden="true" />
        </article>
      </div>

      <div className="reportes-grid">
        <article className="reporte-panel">
          <div className="reporte-panel-header">
            <FaStethoscope aria-hidden="true" />
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
        </article>

        <article className="reporte-panel">
          <div className="reporte-panel-header">
            <FaScissors aria-hidden="true" />
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
        </article>

        <article className="reporte-panel">
          <div className="reporte-panel-header">
            <FaBoxOpen aria-hidden="true" />
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
              <span>Porcentaje activos</span>
              <strong>{porcentajeProductosActivos}%</strong>
            </div>
          </div>
        </article>

        <article className="reporte-panel alerta">
          <div className="reporte-panel-header">
            <FaTriangleExclamation aria-hidden="true" />
            <h2>Alertas</h2>
          </div>

          <div className="reporte-lista">
            <div className="reporte-item">
              <span>Bajo stock</span>
              <strong>{productosBajoStock.length}</strong>
            </div>

            <div className="reporte-item">
              <span>Sin stock</span>
              <strong>{productosSinStock.length}</strong>
            </div>

            <div className="reporte-item">
              <span>Próximos a vencer</span>
              <strong>{productosProximosAVencer.length}</strong>
            </div>

            <div className="reporte-item">
              <span>Vencidos</span>
              <strong>{productosVencidos.length}</strong>
            </div>

            <div className="reporte-item">
              <span>Turnos cancelados</span>
              <strong>{turnosCancelados}</strong>
            </div>
          </div>
        </article>
      </div>

      <div className="reportes-bottom-grid">
        <article className="reporte-tabla-card">
          <div className="reporte-panel-header">
            <FaBoxesStacked aria-hidden="true" />
            <h2>Productos con bajo stock</h2>
          </div>

          <div className="reporte-tabla-wrapper">
            <table className="reporte-tabla">
              <thead>
                <tr>
                  <th scope="col">Producto</th>
                  <th scope="col">Cantidad</th>
                  <th scope="col">Stock mínimo</th>
                </tr>
              </thead>

              <tbody>
                {productosBajoStock.map((item) => {
                  const producto = obtenerProducto(item.productoId)

                  return (
                    <tr key={item.id}>
                      <td>{producto?.descripcion || 'Producto no encontrado'}</td>
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
        </article>

        <article className="reporte-tabla-card">
          <div className="reporte-panel-header">
            <FaSyringe aria-hidden="true" />
            <h2>Próximas vacunaciones</h2>
          </div>

          <div className="reporte-tabla-wrapper">
            <table className="reporte-tabla">
              <thead>
                <tr>
                  <th scope="col">Mascota</th>
                  <th scope="col">Vacuna</th>
                  <th scope="col">Fecha</th>
                </tr>
              </thead>

              <tbody>
                {proximasVacunas.map((vacunacion) => {
                  const mascota = obtenerMascota(vacunacion.mascotaId)

                  return (
                    <tr key={vacunacion.id}>
                      <td>{mascota?.nombre || 'Mascota no encontrada'}</td>
                      <td>{vacunacion.vacuna || 'Sin especificar'}</td>
                      <td>{formatearFecha(vacunacion.fechaReporte)}</td>
                    </tr>
                  )
                })}

                {proximasVacunas.length === 0 && (
                  <tr>
                    <td colSpan="3" className="sin-resultados">
                      No hay próximas vacunaciones registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </section>
  )
}

export default Reportes