import { useEffect, useMemo, useState } from 'react'
import {
  FaBoxOpen,
  FaBoxesStacked,
  FaCashRegister,
  FaScissors,
  FaStethoscope,
  FaSyringe,
  FaTriangleExclamation,
} from 'react-icons/fa6'

import { obtenerConsultas } from '../services/consultasService'
import { obtenerVacunaciones } from '../services/vacunacionesService'
import { obtenerCirugias } from '../services/cirugiasService'
import { obtenerServiciosHigiene } from '../services/higieneService'

import {
  descargarReporteVentasExcel,
  obtenerReporteCaja,
  obtenerReporteCompras,
  obtenerReporteStockBajo,
  obtenerReporteVentas,
} from '../services/reportesService'

import { obtenerUsuarioGuardado } from '../utils/permisos'

import './Reportes.css'


const datosVacios = {
  ventas: [],
  compras: [],
  stockBajo: [],
  caja: [],
  consultas: [],
  vacunaciones: [],
  cirugias: [],
  higiene: [],
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
  return String(valor ?? '')
    .trim()
    .toLowerCase()
}


function obtenerNumero(valor) {
  const numero = Number(valor)

  return Number.isFinite(numero)
    ? numero
    : 0
}


function normalizarFecha(fecha) {
  if (!fecha) {
    return null
  }

  const texto = String(fecha).slice(0, 10)
  const fechaNormalizada = new Date(
    `${texto}T00:00:00`,
  )

  return Number.isNaN(
    fechaNormalizada.getTime(),
  )
    ? null
    : fechaNormalizada
}


function formatearFecha(fecha) {
  const fechaValida = normalizarFecha(fecha)

  if (!fechaValida) {
    return 'Sin fecha'
  }

  return new Intl.DateTimeFormat(
    'es-AR',
  ).format(fechaValida)
}


function obtenerNombreMascota(registro) {
  if (registro?.mascota_nombre) {
    return registro.mascota_nombre
  }

  if (
    registro?.mascota
    && typeof registro.mascota === 'object'
  ) {
    return (
      registro.mascota.nombre
      || `Mascota #${registro.mascota.id}`
    )
  }

  if (registro?.mascota) {
    return `Mascota #${registro.mascota}`
  }

  return 'Sin mascota'
}


function obtenerNombreVacuna(vacunacion) {
  return (
    vacunacion.servicio_nombre
    || vacunacion.vacuna
    || vacunacion.nombre_vacuna
    || 'Vacunación'
  )
}


function obtenerNombreProveedor(compra) {
  if (typeof compra.proveedor === 'string') {
    return compra.proveedor
  }

  if (
    compra.proveedor
    && typeof compra.proveedor === 'object'
  ) {
    return (
      compra.proveedor.nombre
      || compra.proveedor.nombre_empresa
      || 'Proveedor'
    )
  }

  return 'Sin proveedor'
}


function Reportes() {
  const usuario = obtenerUsuarioGuardado()

  const rol = normalizarTexto(usuario?.rol)

  const esAdministrador =
    rol === 'administrador'

  const esVentas =
    rol === 'ventas'

  const esVeterinario =
    rol === 'veterinario'

  const puedeVerComercial =
    esAdministrador || esVentas

  const puedeVerClinico =
    esAdministrador || esVeterinario

  const [datos, setDatos] = useState(
    datosVacios,
  )

  const [cargando, setCargando] =
    useState(true)

  const [errorCarga, setErrorCarga] =
    useState('')

  const [exportando, setExportando] =
    useState(false)

  const formatoDinero = useMemo(
    () =>
      new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0,
      }),
    [],
  )

  useEffect(() => {
    let componenteActivo = true

    const cargarDatos = async () => {
      setCargando(true)
      setErrorCarga('')

      const solicitudes = []

      const agregarSolicitud = (
        clave,
        promesa,
      ) => {
        solicitudes.push({
          clave,
          promesa,
        })
      }

      if (puedeVerComercial) {
        agregarSolicitud(
          'ventas',
          obtenerReporteVentas(),
        )

        agregarSolicitud(
          'compras',
          obtenerReporteCompras(),
        )

        agregarSolicitud(
          'stockBajo',
          obtenerReporteStockBajo(),
        )
      }

      if (esAdministrador) {
        agregarSolicitud(
          'caja',
          obtenerReporteCaja(),
        )

        agregarSolicitud(
          'higiene',
          obtenerServiciosHigiene(),
        )
      }

      if (puedeVerClinico) {
        agregarSolicitud(
          'consultas',
          obtenerConsultas(),
        )

        agregarSolicitud(
          'vacunaciones',
          obtenerVacunaciones(),
        )

        agregarSolicitud(
          'cirugias',
          obtenerCirugias(),
        )
      }

      if (solicitudes.length === 0) {
        if (componenteActivo) {
          setDatos(datosVacios)
          setCargando(false)
        }

        return
      }

      const resultados =
        await Promise.allSettled(
          solicitudes.map(
            (solicitud) => solicitud.promesa,
          ),
        )

      if (!componenteActivo) {
        return
      }

      const datosNuevos = {
        ...datosVacios,
      }

      let cantidadFallidas = 0

      resultados.forEach(
        (resultado, indice) => {
          const clave =
            solicitudes[indice].clave

          if (
            resultado.status === 'fulfilled'
          ) {
            datosNuevos[clave] =
              convertirEnLista(
                resultado.value,
              )
          } else {
            cantidadFallidas += 1

            console.error(
              `Error al cargar ${clave}:`,
              resultado.reason,
            )
          }
        },
      )

      setDatos(datosNuevos)

      if (cantidadFallidas > 0) {
        setErrorCarga(
          cantidadFallidas === 1
            ? 'No se pudo cargar una sección del reporte.'
            : (
                `No se pudieron cargar `
                + `${cantidadFallidas} secciones del reporte.`
              ),
        )
      }

      setCargando(false)
    }

    cargarDatos().catch((error) => {
      console.error(
        'Error al cargar reportes:',
        error,
      )

      if (componenteActivo) {
        setErrorCarga(
          'No se pudieron cargar los reportes.',
        )

        setCargando(false)
      }
    })

    return () => {
      componenteActivo = false
    }
  }, [
    esAdministrador,
    puedeVerClinico,
    puedeVerComercial,
  ])

  const {
    ventas,
    compras,
    stockBajo,
    caja,
    consultas,
    vacunaciones,
    cirugias,
    higiene,
  } = datos

  const totalVentas = useMemo(
    () =>
      ventas.reduce(
        (total, venta) =>
          total + obtenerNumero(venta.total),
        0,
      ),
    [ventas],
  )

  const totalCompras = useMemo(
    () =>
      compras.reduce(
        (total, compra) =>
          total + obtenerNumero(compra.total),
        0,
      ),
    [compras],
  )

  const totalIngresos = useMemo(
    () =>
      caja
        .filter(
          (movimiento) =>
            normalizarTexto(
              movimiento.tipo_movimiento,
            ) === 'ingreso',
        )
        .reduce(
          (total, movimiento) =>
            total
            + obtenerNumero(
              movimiento.monto,
            ),
          0,
        ),
    [caja],
  )

  const totalEgresos = useMemo(
    () =>
      caja
        .filter(
          (movimiento) =>
            normalizarTexto(
              movimiento.tipo_movimiento,
            ) === 'egreso',
        )
        .reduce(
          (total, movimiento) =>
            total
            + obtenerNumero(
              movimiento.monto,
            ),
          0,
        ),
    [caja],
  )

  const consultasRealizadas = useMemo(
    () =>
      consultas.filter(
        (consulta) =>
          normalizarTexto(
            consulta.estado,
          ) === 'realizada',
      ).length,
    [consultas],
  )

  const vacunacionesAplicadas = useMemo(
    () =>
      vacunaciones.filter(
        (vacunacion) => {
          const estado = normalizarTexto(
            vacunacion.estado,
          )

          return (
            estado === 'aplicada'
            || estado === 'realizada'
          )
        },
      ).length,
    [vacunaciones],
  )

  const cirugiasRealizadas = useMemo(
    () =>
      cirugias.filter(
        (cirugia) =>
          normalizarTexto(
            cirugia.estado,
          ) === 'realizada',
      ).length,
    [cirugias],
  )

  const serviciosHigieneRealizados =
    useMemo(
      () =>
        higiene.filter(
          (servicio) =>
            normalizarTexto(
              servicio.estado,
            ) === 'realizado',
        ).length,
      [higiene],
    )

  const proximasVacunas = useMemo(() => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    return vacunaciones
      .map((vacunacion) => ({
        ...vacunacion,
        fechaReporte:
          vacunacion.proxima_dosis
          || vacunacion.proximaDosis,
      }))
      .filter((vacunacion) => {
        const fecha = normalizarFecha(
          vacunacion.fechaReporte,
        )

        const estado = normalizarTexto(
          vacunacion.estado,
        )

        return (
          fecha
          && fecha >= hoy
          && estado !== 'cancelada'
        )
      })
      .sort((a, b) => {
        return (
          normalizarFecha(a.fechaReporte)
          - normalizarFecha(b.fechaReporte)
        )
      })
      .slice(0, 10)
  }, [vacunaciones])

  const ultimasVentas = useMemo(
    () => ventas.slice(0, 10),
    [ventas],
  )

  const ultimasCompras = useMemo(
    () => compras.slice(0, 10),
    [compras],
  )

  const ultimasConsultas = useMemo(
    () => consultas.slice(0, 10),
    [consultas],
  )

  const manejarExportacion = async () => {
    try {
      setExportando(true)
      setErrorCarga('')

      await descargarReporteVentasExcel()
    } catch (error) {
      console.error(
        'Error al exportar ventas:',
        error,
      )

      setErrorCarga(
        error.response?.data?.detail
        || 'No se pudo descargar el reporte de ventas.',
      )
    } finally {
      setExportando(false)
    }
  }

  if (cargando) {
    return (
      <section className="reportes-page">
        <div className="reportes-header">
          <div>
            <h1>Reportes</h1>
            <p>
              Cargando información autorizada...
            </p>
          </div>
        </div>
      </section>
    )
  }

  if (
    !puedeVerComercial
    && !puedeVerClinico
  ) {
    return (
      <section className="reportes-page">
        <article className="reporte-panel alerta">
          <div className="reporte-panel-header">
            <FaTriangleExclamation />
            <h2>Acceso restringido</h2>
          </div>

          <p>
            Tu rol no tiene reportes habilitados.
          </p>
        </article>
      </section>
    )
  }

  return (
    <section className="reportes-page">
      <div className="reportes-header">
        <div>
          <h1>Reportes</h1>

          <p>
            {esAdministrador
              ? 'Información clínica, comercial y financiera'
              : esVentas
                ? 'Información comercial, compras y stock'
                : 'Información clínica de pacientes'}
          </p>
        </div>

        {puedeVerComercial && (
          <button
            type="button"
            className="btn-exportar-reporte"
            onClick={manejarExportacion}
            disabled={exportando}
          >
            {exportando
              ? 'Descargando...'
              : 'Exportar ventas a Excel'}
          </button>
        )}
      </div>

      {errorCarga && (
        <article className="reporte-panel alerta">
          <div className="reporte-panel-header">
            <FaTriangleExclamation />
            <h2>Información incompleta</h2>
          </div>

          <p>{errorCarga}</p>
        </article>
      )}

      {puedeVerComercial && (
        <>
          <div className="reportes-stats">
            <article className="reporte-card">
              <div>
                <p>Ventas</p>

                <strong>
                  {formatoDinero.format(
                    totalVentas,
                  )}
                </strong>

                <span>
                  {ventas.length} operaciones
                </span>
              </div>

              <FaCashRegister
                className="reporte-icon"
              />
            </article>

            <article className="reporte-card">
              <div>
                <p>Compras</p>

                <strong>
                  {formatoDinero.format(
                    totalCompras,
                  )}
                </strong>

                <span>
                  {compras.length} operaciones
                </span>
              </div>

              <FaBoxOpen
                className="reporte-icon"
              />
            </article>

            <article className="reporte-card">
              <div>
                <p>Stock bajo</p>

                <strong>
                  {stockBajo.length}
                </strong>

                <span>
                  Productos para reponer
                </span>
              </div>

              <FaBoxesStacked
                className="reporte-icon"
              />
            </article>

            {esAdministrador && (
              <article className="reporte-card">
                <div>
                  <p>Saldo de Caja</p>

                  <strong>
                    {formatoDinero.format(
                      totalIngresos
                      - totalEgresos,
                    )}
                  </strong>

                  <span>
                    Ingresos menos egresos
                  </span>
                </div>

                <FaCashRegister
                  className="reporte-icon"
                />
              </article>
            )}
          </div>

          <div className="reportes-grid">
            <article className="reporte-panel">
              <div className="reporte-panel-header">
                <FaCashRegister />
                <h2>Resumen comercial</h2>
              </div>

              <div className="reporte-lista">
                <div className="reporte-item">
                  <span>Ventas registradas</span>
                  <strong>{ventas.length}</strong>
                </div>

                <div className="reporte-item">
                  <span>Compras registradas</span>
                  <strong>{compras.length}</strong>
                </div>

                <div className="reporte-item">
                  <span>Productos con bajo stock</span>
                  <strong>{stockBajo.length}</strong>
                </div>
              </div>
            </article>

            {esAdministrador && (
              <article className="reporte-panel">
                <div className="reporte-panel-header">
                  <FaCashRegister />
                  <h2>Caja</h2>
                </div>

                <div className="reporte-lista">
                  <div className="reporte-item">
                    <span>Ingresos</span>

                    <strong>
                      {formatoDinero.format(
                        totalIngresos,
                      )}
                    </strong>
                  </div>

                  <div className="reporte-item">
                    <span>Egresos</span>

                    <strong>
                      {formatoDinero.format(
                        totalEgresos,
                      )}
                    </strong>
                  </div>

                  <div className="reporte-item">
                    <span>Movimientos</span>
                    <strong>{caja.length}</strong>
                  </div>
                </div>
              </article>
            )}
          </div>

          <div className="reportes-bottom-grid">
            <article className="reporte-tabla-card">
              <div className="reporte-panel-header">
                <FaBoxesStacked />
                <h2>Productos con bajo stock</h2>
              </div>

              <div className="reporte-tabla-wrapper">
                <table className="reporte-tabla">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Mínimo</th>
                    </tr>
                  </thead>

                  <tbody>
                    {stockBajo.map(
                      (stock, indice) => (
                        <tr
                          key={
                            stock.id
                            || `${stock.producto}-${indice}`
                          }
                        >
                          <td>{stock.producto}</td>

                          <td>
                            {stock.cantidad_disponible}
                          </td>

                          <td>
                            {stock.stock_minimo}
                          </td>
                        </tr>
                      ),
                    )}

                    {stockBajo.length === 0 && (
                      <tr>
                        <td
                          colSpan="3"
                          className="sin-resultados"
                        >
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
                <FaCashRegister />
                <h2>Últimas ventas</h2>
              </div>

              <div className="reporte-tabla-wrapper">
                <table className="reporte-tabla">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Comprobante</th>
                      <th>Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {ultimasVentas.map(
                      (venta) => (
                        <tr key={venta.id}>
                          <td>
                            {formatearFecha(
                              venta.fecha,
                            )}
                          </td>

                          <td>
                            {venta.numero_comprobante}
                          </td>

                          <td>
                            {formatoDinero.format(
                              obtenerNumero(
                                venta.total,
                              ),
                            )}
                          </td>
                        </tr>
                      ),
                    )}

                    {ultimasVentas.length === 0 && (
                      <tr>
                        <td
                          colSpan="3"
                          className="sin-resultados"
                        >
                          No hay ventas registradas.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="reporte-tabla-card">
              <div className="reporte-panel-header">
                <FaBoxOpen />
                <h2>Últimas compras</h2>
              </div>

              <div className="reporte-tabla-wrapper">
                <table className="reporte-tabla">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Proveedor</th>
                      <th>Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {ultimasCompras.map(
                      (compra) => (
                        <tr key={compra.id}>
                          <td>
                            {formatearFecha(
                              compra.fecha,
                            )}
                          </td>

                          <td>
                            {obtenerNombreProveedor(
                              compra,
                            )}
                          </td>

                          <td>
                            {formatoDinero.format(
                              obtenerNumero(
                                compra.total,
                              ),
                            )}
                          </td>
                        </tr>
                      ),
                    )}

                    {ultimasCompras.length === 0 && (
                      <tr>
                        <td
                          colSpan="3"
                          className="sin-resultados"
                        >
                          No hay compras registradas.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          </div>
        </>
      )}

      {puedeVerClinico && (
        <>
          <div className="reportes-stats">
            <article className="reporte-card">
              <div>
                <p>Consultas</p>
                <strong>{consultas.length}</strong>
                <span>
                  {consultasRealizadas} realizadas
                </span>
              </div>

              <FaStethoscope
                className="reporte-icon"
              />
            </article>

            <article className="reporte-card">
              <div>
                <p>Vacunaciones</p>

                <strong>
                  {vacunaciones.length}
                </strong>

                <span>
                  {vacunacionesAplicadas} aplicadas
                </span>
              </div>

              <FaSyringe
                className="reporte-icon"
              />
            </article>

            <article className="reporte-card">
              <div>
                <p>Cirugías</p>

                <strong>
                  {cirugias.length}
                </strong>

                <span>
                  {cirugiasRealizadas} realizadas
                </span>
              </div>

              <FaStethoscope
                className="reporte-icon"
              />
            </article>

            {esAdministrador && (
              <article className="reporte-card">
                <div>
                  <p>Higiene</p>

                  <strong>
                    {higiene.length}
                  </strong>

                  <span>
                    {serviciosHigieneRealizados}
                    {' '}realizados
                  </span>
                </div>

                <FaScissors
                  className="reporte-icon"
                />
              </article>
            )}
          </div>

          <div className="reportes-bottom-grid">
            <article className="reporte-tabla-card">
              <div className="reporte-panel-header">
                <FaSyringe />
                <h2>Próximas vacunaciones</h2>
              </div>

              <div className="reporte-tabla-wrapper">
                <table className="reporte-tabla">
                  <thead>
                    <tr>
                      <th>Mascota</th>
                      <th>Vacuna</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>

                  <tbody>
                    {proximasVacunas.map(
                      (vacunacion) => (
                        <tr key={vacunacion.id}>
                          <td>
                            {obtenerNombreMascota(
                              vacunacion,
                            )}
                          </td>

                          <td>
                            {obtenerNombreVacuna(
                              vacunacion,
                            )}
                          </td>

                          <td>
                            {formatearFecha(
                              vacunacion.fechaReporte,
                            )}
                          </td>
                        </tr>
                      ),
                    )}

                    {proximasVacunas.length === 0 && (
                      <tr>
                        <td
                          colSpan="3"
                          className="sin-resultados"
                        >
                          No hay próximas vacunaciones.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="reporte-tabla-card">
              <div className="reporte-panel-header">
                <FaStethoscope />
                <h2>Últimas consultas</h2>
              </div>

              <div className="reporte-tabla-wrapper">
                <table className="reporte-tabla">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Mascota</th>
                      <th>Estado</th>
                    </tr>
                  </thead>

                  <tbody>
                    {ultimasConsultas.map(
                      (consulta) => (
                        <tr key={consulta.id}>
                          <td>
                            {formatearFecha(
                              consulta.fecha_consulta
                              || consulta.fecha,
                            )}
                          </td>

                          <td>
                            {obtenerNombreMascota(
                              consulta,
                            )}
                          </td>

                          <td>
                            {consulta.estado
                              || 'Sin estado'}
                          </td>
                        </tr>
                      ),
                    )}

                    {ultimasConsultas.length === 0 && (
                      <tr>
                        <td
                          colSpan="3"
                          className="sin-resultados"
                        >
                          No hay consultas registradas.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          </div>
        </>
      )}
    </section>
  )
}

export default Reportes