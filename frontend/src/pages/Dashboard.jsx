import { useEffect, useMemo, useState } from 'react'
import {
  FaUsers,
  FaPaw,
  FaCalendarDays,
  FaMoneyBillWave,
} from 'react-icons/fa6'

import CalendarioTurnos from '../components/CalendarioTurnos'
import { obtenerClientes } from '../services/clientesService'
import { obtenerMascotas } from '../services/mascotasService'
import { obtenerTurnos } from '../services/turnosService'
import { obtenerVacunaciones } from '../services/vacunacionesService'
import { obtenerServicios } from '../services/serviciosService'
import { obtenerVentas } from '../services/ventasService'
import './Dashboard.css'

function normalizarLista(datos) {
  if (Array.isArray(datos)) return datos
  if (Array.isArray(datos?.results)) return datos.results
  return []
}

function normalizarTexto(valor) {
  return String(valor ?? '').trim().toLowerCase()
}

function obtenerId(valor) {
  if (valor && typeof valor === 'object') {
    return Number(valor.id)
  }

  return Number(valor)
}

function convertirFechaLocal(fecha) {
  if (!fecha) return null

  const fechaCorta = String(fecha).slice(0, 10)
  const fechaLocal = new Date(`${fechaCorta}T00:00:00`)

  return Number.isNaN(fechaLocal.getTime()) ? null : fechaLocal
}

function formatearFecha(fecha) {
  const fechaLocal = convertirFechaLocal(fecha)

  if (!fechaLocal) return 'Sin fecha'

  return fechaLocal.toLocaleDateString('es-AR')
}

function capitalizar(valor) {
  const texto = String(valor || 'Sin estado').replaceAll('_', ' ')

  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function convertirTurno(turno) {
  const fecha = turno.fecha || String(turno.fecha_inicio || '').slice(0, 10)
  const horaInicio = turno.hora || turno.hora_inicio || ''
  const horaFin = turno.hora_fin || ''

  const fechaInicio = turno.fechaInicio || turno.fecha_inicio || (
    fecha && horaInicio ? `${fecha}T${horaInicio}` : ''
  )

  const fechaFin = turno.fechaFin || turno.fecha_fin || (
    fecha && horaFin ? `${fecha}T${horaFin}` : ''
  )

  return {
    id: Number(turno.id),
    mascotaId: obtenerId(
      turno.mascotaId ?? turno.mascota_id ?? turno.mascota
    ),
    motivo:
      turno.motivo ||
      turno.motivo_consulta ||
      turno.descripcion ||
      'Turno',
    fechaInicio,
    fechaFin,
    estado: normalizarTexto(turno.estado) || 'pendiente',
  }
}

function Dashboard() {
  const [clientes, setClientes] = useState([])
  const [mascotas, setMascotas] = useState([])
  const [turnos, setTurnos] = useState([])
  const [vacunaciones, setVacunaciones] = useState([])
  const [servicios, setServicios] = useState([])
  const [ventas, setVentas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')

  const formatoDinero = useMemo(
    () =>
      new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0,
      }),
    []
  )

  useEffect(() => {
    let componenteActivo = true

    const cargarDashboard = async () => {
      setCargando(true)
      setErrorCarga('')

      const resultados = await Promise.allSettled([
        obtenerClientes(),
        obtenerMascotas(),
        obtenerTurnos(),
        obtenerVacunaciones(),
        obtenerServicios(),
        obtenerVentas(),
      ])

      if (!componenteActivo) return

      const obtenerResultado = (indice) => {
        const resultado = resultados[indice]

        return resultado.status === 'fulfilled'
          ? normalizarLista(resultado.value)
          : []
      }

      setClientes(obtenerResultado(0))
      setMascotas(obtenerResultado(1))
      setTurnos(obtenerResultado(2).map(convertirTurno))
      setVacunaciones(obtenerResultado(3))
      setServicios(obtenerResultado(4))
      setVentas(obtenerResultado(5))

      const fallidas = resultados.filter(
        (resultado) => resultado.status === 'rejected'
      ).length

      if (fallidas > 0) {
        setErrorCarga(
          `No se pudieron cargar ${fallidas} secciones del Dashboard.`
        )
      }

      setCargando(false)
    }

    cargarDashboard().catch((error) => {
      console.error('Error al cargar el Dashboard:', error)

      if (componenteActivo) {
        setErrorCarga('No se pudo cargar la información del Dashboard.')
        setCargando(false)
      }
    })

    return () => {
      componenteActivo = false
    }
  }, [])

  const mascotasPorId = useMemo(
    () =>
      new Map(
        mascotas.map((mascota) => [Number(mascota.id), mascota])
      ),
    [mascotas]
  )

  const clientesPorId = useMemo(
    () =>
      new Map(
        clientes.map((cliente) => [Number(cliente.id), cliente])
      ),
    [clientes]
  )

  const serviciosPorId = useMemo(
    () =>
      new Map(
        servicios.map((servicio) => [Number(servicio.id), servicio])
      ),
    [servicios]
  )

  const turnosProgramados = useMemo(
    () =>
      turnos.filter((turno) =>
        ['pendiente', 'programado'].includes(
          normalizarTexto(turno.estado)
        )
      ).length,
    [turnos]
  )

  const ventasValidas = useMemo(
    () =>
      ventas.filter(
        (venta) => normalizarTexto(venta.estado) !== 'cancelada'
      ),
    [ventas]
  )

  const totalVentas = useMemo(
    () =>
      ventasValidas.reduce(
        (total, venta) => total + Number(venta.total || 0),
        0
      ),
    [ventasValidas]
  )

  const proximasVacunaciones = useMemo(() => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    return vacunaciones
      .map((vacunacion) => {
        const estado = normalizarTexto(vacunacion.estado)
        const fechaProxima =
          vacunacion.proxima_dosis ??
          vacunacion.proximaDosis ??
          (estado === 'pendiente'
            ? vacunacion.fecha_aplicacion ?? vacunacion.fecha
            : null)

        return {
          ...vacunacion,
          fechaProxima,
        }
      })
      .filter((vacunacion) => {
        const fecha = convertirFechaLocal(vacunacion.fechaProxima)
        const estado = normalizarTexto(vacunacion.estado)

        return fecha && fecha >= hoy && estado !== 'cancelada'
      })
      .sort((a, b) => {
        const fechaA = convertirFechaLocal(a.fechaProxima)
        const fechaB = convertirFechaLocal(b.fechaProxima)

        return fechaA - fechaB
      })
      .slice(0, 5)
  }, [vacunaciones])

  const ultimasVentas = useMemo(
    () =>
      [...ventasValidas]
        .sort((a, b) => {
          const fechaA = convertirFechaLocal(a.fecha)?.getTime() || 0
          const fechaB = convertirFechaLocal(b.fecha)?.getTime() || 0

          if (fechaA !== fechaB) return fechaB - fechaA
          return Number(b.id) - Number(a.id)
        })
        .slice(0, 5),
    [ventasValidas]
  )

  const obtenerNombreMascota = (vacunacion) => {
    if (vacunacion.mascota_nombre) {
      return vacunacion.mascota_nombre
    }

    const mascotaId = obtenerId(
      vacunacion.mascotaId ?? vacunacion.mascota
    )

    return mascotasPorId.get(mascotaId)?.nombre || 'Mascota'
  }

  const obtenerNombreVacuna = (vacunacion) => {
    if (vacunacion.servicio_nombre) {
      return vacunacion.servicio_nombre
    }

    if (vacunacion.vacuna) {
      return vacunacion.vacuna
    }

    const servicioId = obtenerId(
      vacunacion.servicioId ?? vacunacion.servicio
    )
    const servicio = serviciosPorId.get(servicioId)

    return servicio?.descripcion || servicio?.nombre || 'Vacunación'
  }

  const obtenerNombreClienteVenta = (venta) => {
    if (venta.cliente_nombre) {
      return venta.cliente_nombre
    }

    if (venta.consumidor_final || !venta.cliente) {
      return 'Consumidor final'
    }

    const clienteId = obtenerId(
      venta.clienteId ?? venta.cliente
    )
    const cliente = clientesPorId.get(clienteId)

    if (!cliente) return 'Cliente no encontrado'

    return `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim()
  }

  return (
    <section className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>
          {cargando
            ? 'Cargando información real de la Clínica...'
            : 'Resumen general de la Clínica'}
        </p>
      </div>

      {errorCarga && (
        <div className="dashboard-sales-card">
          <strong>{errorCarga}</strong>
          <p>Los datos disponibles se muestran normalmente.</p>
        </div>
      )}

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
            <strong>{turnosProgramados}</strong>
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
          <CalendarioTurnos
            turnos={turnos}
            mascotas={mascotas}
          />
        </div>

        <div className="dashboard-vaccine-card">
          <h3>Próximas Vacunaciones</h3>

          <div className="vaccine-list">
            {proximasVacunaciones.map((vacunacion) => (
              <div className="vaccine-item" key={vacunacion.id}>
                <div>
                  <strong>{obtenerNombreMascota(vacunacion)}</strong>
                  <span>{obtenerNombreVacuna(vacunacion)}</span>
                </div>

                <p>{formatearFecha(vacunacion.fechaProxima)}</p>
              </div>
            ))}

            {!cargando && proximasVacunaciones.length === 0 && (
              <p>No hay próximas vacunaciones registradas.</p>
            )}
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
            {ultimasVentas.map((venta) => (
              <tr key={venta.id}>
                <td>{formatearFecha(venta.fecha)}</td>
                <td>{obtenerNombreClienteVenta(venta)}</td>
                <td>{formatoDinero.format(Number(venta.total || 0))}</td>
                <td>
                  <span>{capitalizar(venta.estado)}</span>
                </td>
              </tr>
            ))}

            {!cargando && ultimasVentas.length === 0 && (
              <tr>
                <td colSpan="4">No hay ventas registradas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default Dashboard