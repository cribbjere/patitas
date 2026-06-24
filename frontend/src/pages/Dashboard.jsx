import {
  FaUsers,
  FaPaw,
  FaCalendarDays,
  FaMoneyBillWave,
} from 'react-icons/fa6'

import CalendarioTurnos from '../components/CalendarioTurnos'
import {
  clientes,
  mascotas,
  turnos,
  vacunaciones,
  ventas,
} from '../data/mockData'
import './Dashboard.css'

function Dashboard() {
  const totalVentas = ventas.reduce((total, venta) => total + venta.total, 0)

  const formatoDinero = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  })

  return (
    <section className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Resumen general de la Clínica</p>
      </div>

      <div className="dashboard-stats">
        <div className="dashboard-stat-card">
          <div>
            <p>Clientes</p>
            <strong>{clientes.length}</strong>
            <span>Total de registrados</span>
          </div>

          <FaUsers className="stat-icon" />
        </div>

        <div className="dashboard-stat-card">
          <div>
            <p>Mascotas</p>
            <strong>{mascotas.length}</strong>
            <span>Total de registradas</span>
          </div>

          <FaPaw className="stat-icon" />
        </div>

        <div className="dashboard-stat-card">
          <div>
            <p>Turnos</p>
            <strong>{turnos.length}</strong>
            <span>Turnos programados</span>
          </div>

          <FaCalendarDays className="stat-icon" />
        </div>

        <div className="dashboard-stat-card">
          <div>
            <p>Ventas</p>
            <strong>{formatoDinero.format(totalVentas)}</strong>
            <span>Total registrado</span>
          </div>

          <FaMoneyBillWave className="stat-icon" />
        </div>
      </div>

      <div className="dashboard-content-grid">
        <div className="dashboard-calendar-card">
          <CalendarioTurnos />
        </div>

        <div className="dashboard-vaccine-card">
          <h3>Próximas Vacunaciones</h3>

          <div className="vaccine-list">
            {vacunaciones.map((vacunacion) => {
              const mascota = mascotas.find(
                (item) => item.id === vacunacion.mascotaId
              )

              return (
                <div className="vaccine-item" key={vacunacion.id}>
                  <div>
                    <strong>{mascota?.nombre}</strong>
                    <span>{vacunacion.vacuna}</span>
                  </div>

                  <p>{vacunacion.fecha}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="dashboard-sales-card">
        <h3>Últimas Ventas</h3>

        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
            {ventas.map((venta) => {
              const cliente = clientes.find(
                (item) => item.id === venta.clienteId
              )

              return (
                <tr key={venta.id}>
                  <td>{venta.fecha}</td>
                  <td>
                    {cliente?.nombre} {cliente?.apellido}
                  </td>
                  <td>{formatoDinero.format(venta.total)}</td>
                  <td>
                    <span>{venta.estado}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default Dashboard