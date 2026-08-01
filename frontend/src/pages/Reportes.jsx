import { useEffect, useMemo, useState } from 'react'
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

import { obtenerClientes } from '../services/clientesService'
import { obtenerMascotas } from '../services/mascotasService'
import { obtenerTurnos } from '../services/turnosService'
import { obtenerConsultas } from '../services/consultasService'
import { obtenerVacunaciones } from '../services/vacunacionesService'
import { obtenerCirugias } from '../services/cirugiasService'
import { obtenerServiciosHigiene } from '../services/higieneService'
import { obtenerServicios } from '../services/serviciosService'
import { obtenerProductos } from '../services/productosService'
import { obtenerLotesStock } from '../services/lotesStockService'
import { obtenerVentas } from '../services/ventasService'
import {
  obtenerMovimientosCaja,
  obtenerCierresCaja,
} from '../services/cajaService'

import './Reportes.css'

const datosVacios = {
  clientes: [],
  mascotas: [],
  turnos: [],
  consultas: [],
  vacunaciones: [],
  cirugias: [],
  higiene: [],
  servicios: [],
  productos: [],
  lotes: [],
  ventas: [],
  movimientosCaja: [],
  cierresCaja: [],
}

function convertirEnLista(valor) {
  if (Array.isArray(valor)) {
    return valor
  }

  if (Array.isArray(valor?.results)) {
    return valor.results
  }

  return []
}

function normalizarTexto(valor) {
  return String(valor ?? '').trim().toLowerCase()
}

function obtenerNumero(valor) {
  const numero = Number(valor)
  return Number.isFinite(numero) ? numero : 0
}

function normalizarFecha(fecha) {
  if (!fecha) return null

  const textoFecha = String(fecha).slice(0, 10)
  const fechaNormalizada = new Date(`${textoFecha}T00:00:00`)

  return Number.isNaN(fechaNormalizada.getTime())
    ? null
    : fechaNormalizada
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

  return Math.ceil(
    (vencimiento - hoy) / (1000 * 60 * 60 * 24)
  )
}

function obtenerIdRelacionado(valor) {
  if (valor && typeof valor === 'object') {
    return Number(valor.id)
  }

  return Number(valor)
}

function Reportes() {
  const [datos, setDatos] = useState(datosVacios)
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

    const cargarDatos = async () => {
      setCargando(true)
      setErrorCarga('')

      const solicitudes = [
        obtenerClientes(),
        obtenerMascotas(),
        obtenerTurnos(),
        obtenerConsultas(),
        obtenerVacunaciones(),
        obtenerCirugias(),
        obtenerServiciosHigiene(),
        obtenerServicios(),
        obtenerProductos(),
        obtenerLotesStock(),
        obtenerVentas(),
        obtenerMovimientosCaja(),
        obtenerCierresCaja(),
      ]

      const resultados = await Promise.allSettled(solicitudes)

      if (!componenteActivo) return

      const obtenerResultado = (indice) => {
        const resultado = resultados[indice]

        return resultado.status === 'fulfilled'
          ? convertirEnLista(resultado.value)
          : []
      }

      setDatos({
        clientes: obtenerResultado(0),
        mascotas: obtenerResultado(1),
        turnos: obtenerResultado(2),
        consultas: obtenerResultado(3),
        vacunaciones: obtenerResultado(4),
        cirugias: obtenerResultado(5),
        higiene: obtenerResultado(6),
        servicios: obtenerResultado(7),
        productos: obtenerResultado(8),
        lotes: obtenerResultado(9),
        ventas: obtenerResultado(10),
        movimientosCaja: obtenerResultado(11),
        cierresCaja: obtenerResultado(12),
      })

      const cantidadFallidas = resultados.filter(
        (resultado) => resultado.status === 'rejected'
      ).length

      if (cantidadFallidas > 0) {
        setErrorCarga(
          `No se pudieron cargar ${cantidadFallidas} secciones del reporte. ` +
            'Los demás datos se muestran normalmente.'
        )
      }

      setCargando(false)
    }

    cargarDatos().catch((error) => {
      console.error('Error al cargar reportes:', error)

      if (componenteActivo) {
        setErrorCarga('No se pudieron cargar los reportes.')
        setCargando(false)
      }
    })

    return () => {
      componenteActivo = false
    }
  }, [])

  const {
    clientes,
    mascotas,
    turnos,
    consultas,
    vacunaciones,
    cirugias,
    higiene,
    servicios,
    productos,
    lotes,
    ventas,
    movimientosCaja,
    cierresCaja,
  } = datos

  const mascotasPorId = useMemo(() => {
    return new Map(
      mascotas.map((mascota) => [Number(mascota.id), mascota])
    )
  }, [mascotas])

  const serviciosPorId = useMemo(() => {
    return new Map(
      servicios.map((servicio) => [Number(servicio.id), servicio])
    )
  }, [servicios])

  const productosPorId = useMemo(() => {
    return new Map(
      productos.map((producto) => [Number(producto.id), producto])
    )
  }, [productos])

  const lotesPorProducto = useMemo(() => {
    const agrupados = new Map()

    lotes.forEach((lote) => {
      const productoId = obtenerIdRelacionado(
        lote.producto ?? lote.producto_id
      )

      if (!productoId) return

      if (!agrupados.has(productoId)) {
        agrupados.set(productoId, [])
      }

      agrupados.get(productoId).push(lote)
    })

    return agrupados
  }, [lotes])

  const resumenStock = useMemo(() => {
    return productos.map((producto) => {
      const productoId = Number(producto.id)
      const lotesProducto = lotesPorProducto.get(productoId) || []

      const cantidadDesdeLotes = lotesProducto.reduce(
        (total, lote) =>
          total +
          obtenerNumero(
            lote.cantidad_disponible ?? lote.cantidadDisponible
          ),
        0
      )

      const cantidad = lotesProducto.length
        ? cantidadDesdeLotes
        : obtenerNumero(
            producto.stock_actual ??
              producto.stockActual ??
              producto.stock?.cantidad_disponible
          )

      return {
        id: productoId,
        producto,
        cantidad,
        stockMinimo: obtenerNumero(
          producto.stock_minimo ?? producto.stockMinimo
        ),
      }
    })
  }, [productos, lotesPorProducto])

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
        (total, venta) => total + obtenerNumero(venta.total),
        0
      ),
    [ventasValidas]
  )

  const movimientosIngreso = useMemo(
    () =>
      movimientosCaja.filter(
        (movimiento) =>
          normalizarTexto(
            movimiento.tipo_movimiento ?? movimiento.tipoMovimiento
          ) === 'ingreso'
      ),
    [movimientosCaja]
  )

  const movimientosEgreso = useMemo(
    () =>
      movimientosCaja.filter(
        (movimiento) =>
          normalizarTexto(
            movimiento.tipo_movimiento ?? movimiento.tipoMovimiento
          ) === 'egreso'
      ),
    [movimientosCaja]
  )

  const totalIngresos = useMemo(
    () =>
      movimientosIngreso.reduce(
        (total, movimiento) =>
          total + obtenerNumero(movimiento.monto),
        0
      ),
    [movimientosIngreso]
  )

  const totalEgresos = useMemo(
    () =>
      movimientosEgreso.reduce(
        (total, movimiento) =>
          total + obtenerNumero(movimiento.monto),
        0
      ),
    [movimientosEgreso]
  )

  const saldoCaja = totalIngresos - totalEgresos

  const turnosProgramados = useMemo(
    () =>
      turnos.filter((turno) =>
        ['pendiente', 'programado'].includes(
          normalizarTexto(turno.estado)
        )
      ).length,
    [turnos]
  )

  const turnosCancelados = useMemo(
    () =>
      turnos.filter(
        (turno) => normalizarTexto(turno.estado) === 'cancelado'
      ).length,
    [turnos]
  )

  const productosActivos = useMemo(
    () =>
      productos.filter((producto) => {
        const estado = producto.estado

        return estado === true || normalizarTexto(estado) === 'activo'
      }).length,
    [productos]
  )

  const productosBajoStock = useMemo(
    () =>
      resumenStock.filter(
        (item) =>
          item.cantidad > 0 &&
          item.cantidad <= item.stockMinimo
      ),
    [resumenStock]
  )

  const productosSinStock = useMemo(
    () =>
      resumenStock.filter((item) => item.cantidad <= 0),
    [resumenStock]
  )

  const lotesConCantidad = useMemo(
    () =>
      lotes.filter(
        (lote) =>
          obtenerNumero(
            lote.cantidad_disponible ?? lote.cantidadDisponible
          ) > 0
      ),
    [lotes]
  )

  const productosVencidos = useMemo(
    () =>
      lotesConCantidad.filter((lote) => {
        const dias = obtenerDiasParaVencer(
          lote.fecha_vencimiento ?? lote.fechaVencimiento
        )

        return dias !== null && dias < 0
      }),
    [lotesConCantidad]
  )

  const productosProximosAVencer = useMemo(
    () =>
      lotesConCantidad.filter((lote) => {
        const dias = obtenerDiasParaVencer(
          lote.fecha_vencimiento ?? lote.fechaVencimiento
        )

        return dias !== null && dias >= 0 && dias <= 30
      }),
    [lotesConCantidad]
  )

  const proximasVacunas = useMemo(() => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    return vacunaciones
      .map((vacunacion) => ({
        ...vacunacion,
        fechaReporte:
          vacunacion.proxima_dosis ??
          vacunacion.proximaDosis ??
          vacunacion.fecha_aplicacion ??
          vacunacion.fecha,
      }))
      .filter((vacunacion) => {
        const fecha = normalizarFecha(vacunacion.fechaReporte)
        const estado = normalizarTexto(vacunacion.estado)

        return fecha && fecha >= hoy && estado !== 'cancelada'
      })
      .sort((a, b) => {
        const fechaA = normalizarFecha(a.fechaReporte)
        const fechaB = normalizarFecha(b.fechaReporte)

        return fechaA - fechaB
      })
  }, [vacunaciones])

  const consultasRealizadas = useMemo(
    () =>
      consultas.filter(
        (consulta) => normalizarTexto(consulta.estado) === 'realizada'
      ).length,
    [consultas]
  )

  const vacunacionesAplicadas = useMemo(
    () =>
      vacunaciones.filter(
        (vacunacion) => normalizarTexto(vacunacion.estado) === 'aplicada'
      ).length,
    [vacunaciones]
  )

  const cirugiasRealizadas = useMemo(
    () =>
      cirugias.filter(
        (cirugia) => normalizarTexto(cirugia.estado) === 'realizada'
      ).length,
    [cirugias]
  )

  const serviciosRealizados = useMemo(
    () =>
      higiene.filter(
        (servicio) => normalizarTexto(servicio.estado) === 'realizado'
      ).length,
    [higiene]
  )

  const serviciosPendientes = useMemo(
    () =>
      higiene.filter(
        (servicio) => normalizarTexto(servicio.estado) === 'pendiente'
      ).length,
    [higiene]
  )

  const porcentajeProductosActivos = productos.length
    ? Math.round((productosActivos / productos.length) * 100)
    : 0

  const totalUnidadesStock = useMemo(
    () =>
      resumenStock.reduce(
        (total, item) => total + item.cantidad,
        0
      ),
    [resumenStock]
  )

  const obtenerNombreMascota = (vacunacion) => {
    if (vacunacion.mascota_nombre) {
      return vacunacion.mascota_nombre
    }

    const mascotaId = obtenerIdRelacionado(vacunacion.mascota)
    return mascotasPorId.get(mascotaId)?.nombre || 'Mascota no encontrada'
  }

  const obtenerNombreVacuna = (vacunacion) => {
    if (vacunacion.servicio_nombre) {
      return vacunacion.servicio_nombre
    }

    if (vacunacion.vacuna) {
      return vacunacion.vacuna
    }

    const servicioId = obtenerIdRelacionado(vacunacion.servicio)
    const servicio = serviciosPorId.get(servicioId)

    return (
      servicio?.descripcion ||
      servicio?.nombre ||
      'Vacunación'
    )
  }

  if (cargando) {
    return (
      <section className="reportes-page">
        <div className="reportes-header">
          <h1>Reportes</h1>
          <p>Cargando información real del sistema...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="reportes-page">
      <div className="reportes-header">
        <div>
          <h1>Reportes</h1>
          <p>Informes generados con datos reales del sistema</p>
        </div>
      </div>

      {errorCarga && (
        <article className="reporte-panel alerta">
          <div className="reporte-panel-header">
            <FaTriangleExclamation aria-hidden="true" />
            <h2>Información incompleta</h2>
          </div>

          <p>{errorCarga}</p>
        </article>
      )}

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
            <span>{ventasValidas.length} ventas válidas</span>
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
              <span>Consultas realizadas</span>
              <strong>{consultasRealizadas}</strong>
            </div>

            <div className="reporte-item">
              <span>Vacunaciones aplicadas</span>
              <strong>{vacunacionesAplicadas}</strong>
            </div>

            <div className="reporte-item">
              <span>Cirugías realizadas</span>
              <strong>{cirugiasRealizadas}</strong>
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
              <strong>{higiene.length}</strong>
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

            <div className="reporte-item">
              <span>Unidades en stock</span>
              <strong>{totalUnidadesStock}</strong>
            </div>
          </div>
        </article>

        <article className="reporte-panel">
          <div className="reporte-panel-header">
            <FaCashRegister aria-hidden="true" />
            <h2>Caja y ventas</h2>
          </div>

          <div className="reporte-lista">
            <div className="reporte-item">
              <span>Ingresos</span>
              <strong>{formatoDinero.format(totalIngresos)}</strong>
            </div>

            <div className="reporte-item">
              <span>Egresos</span>
              <strong>{formatoDinero.format(totalEgresos)}</strong>
            </div>

            <div className="reporte-item">
              <span>Saldo histórico</span>
              <strong>{formatoDinero.format(saldoCaja)}</strong>
            </div>

            <div className="reporte-item">
              <span>Cierres registrados</span>
              <strong>{cierresCaja.length}</strong>
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
                {productosBajoStock.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.producto.descripcion ||
                        'Producto sin descripción'}
                    </td>
                    <td>{item.cantidad}</td>
                    <td>{item.stockMinimo}</td>
                  </tr>
                ))}

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
                {proximasVacunas.map((vacunacion) => (
                  <tr key={vacunacion.id}>
                    <td>{obtenerNombreMascota(vacunacion)}</td>
                    <td>{obtenerNombreVacuna(vacunacion)}</td>
                    <td>{formatearFecha(vacunacion.fechaReporte)}</td>
                  </tr>
                ))}

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