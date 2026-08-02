import { useEffect, useMemo, useState } from 'react'
import {
  FaUsers,
  FaPaw,
  FaCalendarDays,
  FaMoneyBillWave,
  FaSyringe,
  FaBoxOpen,
  FaBoxesStacked,
  FaScissors,
} from 'react-icons/fa6'

import CalendarioTurnos from '../components/CalendarioTurnos'

import { obtenerClientes } from '../services/clientesService'
import { obtenerMascotas } from '../services/mascotasService'
import { obtenerTurnos } from '../services/turnosService'
import { obtenerVacunaciones } from '../services/vacunacionesService'
import { obtenerServicios } from '../services/serviciosService'
import { obtenerVentas } from '../services/ventasService'
import { obtenerProductos } from '../services/productosService'
import { obtenerLotesStock } from '../services/lotesStockService'
import { obtenerServiciosHigiene } from '../services/higieneService'

import { obtenerUsuarioGuardado } from '../utils/permisos'

import './Dashboard.css'


const datosVacios = {
  clientes: [],
  mascotas: [],
  turnos: [],
  vacunaciones: [],
  servicios: [],
  ventas: [],
  productos: [],
  lotes: [],
  higiene: [],
}


function normalizarLista(datos) {
  if (Array.isArray(datos)) {
    return datos
  }

  if (Array.isArray(datos?.results)) {
    return datos.results
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


function obtenerId(valor) {
  if (valor && typeof valor === 'object') {
    return Number(valor.id)
  }

  return Number(valor)
}


function convertirFechaLocal(fecha) {
  if (!fecha) {
    return null
  }

  const fechaCorta = String(fecha).slice(0, 10)
  const fechaLocal = new Date(
    `${fechaCorta}T00:00:00`,
  )

  return Number.isNaN(fechaLocal.getTime())
    ? null
    : fechaLocal
}


function formatearFecha(fecha) {
  const fechaLocal = convertirFechaLocal(fecha)

  if (!fechaLocal) {
    return 'Sin fecha'
  }

  return fechaLocal.toLocaleDateString('es-AR')
}


function capitalizar(valor) {
  const texto = String(
    valor || 'Sin estado',
  ).replaceAll('_', ' ')

  return (
    texto.charAt(0).toUpperCase()
    + texto.slice(1)
  )
}


function convertirTurno(turno) {
  const fecha =
    turno.fecha
    || String(
      turno.fecha_inicio || '',
    ).slice(0, 10)

  const horaInicio =
    turno.hora
    || turno.hora_inicio
    || ''

  const horaFin =
    turno.hora_fin
    || ''

  const fechaInicio =
    turno.fechaInicio
    || turno.fecha_inicio
    || (
      fecha && horaInicio
        ? `${fecha}T${horaInicio}`
        : ''
    )

  const fechaFin =
    turno.fechaFin
    || turno.fecha_fin
    || (
      fecha && horaFin
        ? `${fecha}T${horaFin}`
        : ''
    )

  return {
    id: Number(turno.id),

    mascotaId: obtenerId(
      turno.mascotaId
      ?? turno.mascota_id
      ?? turno.mascota,
    ),

    motivo:
      turno.motivo
      || turno.motivo_consulta
      || turno.descripcion
      || 'Turno',

    fechaInicio,
    fechaFin,

    estado:
      normalizarTexto(turno.estado)
      || 'pendiente',
  }
}


function Dashboard() {
  const usuario = obtenerUsuarioGuardado()
  const rol = normalizarTexto(usuario?.rol)

  const esAdministrador =
    rol === 'administrador'

  const esRecepcionista =
    rol === 'recepcionista'

  const esVeterinario =
    rol === 'veterinario'

  const esVentas =
    rol === 'ventas'

  const esHigiene =
    rol === 'higiene'

  const puedeVerClientes = [
    'administrador',
    'recepcionista',
    'veterinario',
    'ventas',
  ].includes(rol)

  const puedeVerMascotas = [
    'administrador',
    'recepcionista',
    'veterinario',
    'higiene',
  ].includes(rol)

  const puedeVerTurnos = [
    'administrador',
    'recepcionista',
    'veterinario',
    'higiene',
  ].includes(rol)

  const puedeVerVacunaciones = [
    'administrador',
    'veterinario',
  ].includes(rol)

  const puedeVerVentas = [
    'administrador',
    'recepcionista',
    'ventas',
  ].includes(rol)

  const puedeVerInventario = [
    'administrador',
    'ventas',
  ].includes(rol)

  const puedeVerHigiene = [
    'administrador',
    'recepcionista',
    'higiene',
  ].includes(rol)

  const [datos, setDatos] = useState(
    datosVacios,
  )

  const [cargando, setCargando] =
    useState(true)

  const [errorCarga, setErrorCarga] =
    useState('')

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

    const cargarDashboard = async () => {
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

      if (puedeVerClientes) {
        agregarSolicitud(
          'clientes',
          obtenerClientes(),
        )
      }

      if (puedeVerMascotas) {
        agregarSolicitud(
          'mascotas',
          obtenerMascotas(),
        )
      }

      if (puedeVerTurnos) {
        agregarSolicitud(
          'turnos',
          obtenerTurnos(),
        )
      }

      if (puedeVerVacunaciones) {
        agregarSolicitud(
          'vacunaciones',
          obtenerVacunaciones(),
        )

        agregarSolicitud(
          'servicios',
          obtenerServicios(),
        )
      }

      if (puedeVerVentas) {
        agregarSolicitud(
          'ventas',
          obtenerVentas(),
        )
      }

      if (puedeVerInventario) {
        agregarSolicitud(
          'productos',
          obtenerProductos(),
        )

        agregarSolicitud(
          'lotes',
          obtenerLotesStock(),
        )
      }

      if (puedeVerHigiene) {
        agregarSolicitud(
          'higiene',
          obtenerServiciosHigiene(),
        )
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
              normalizarLista(
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

      datosNuevos.turnos =
        datosNuevos.turnos.map(
          convertirTurno,
        )

      setDatos(datosNuevos)

      if (cantidadFallidas === 1) {
        setErrorCarga(
          'No se pudo cargar una sección del Dashboard.',
        )
      } else if (cantidadFallidas > 1) {
        setErrorCarga(
          `No se pudieron cargar `
          + `${cantidadFallidas} secciones del Dashboard.`,
        )
      }

      setCargando(false)
    }

    cargarDashboard().catch((error) => {
      console.error(
        'Error al cargar el Dashboard:',
        error,
      )

      if (componenteActivo) {
        setErrorCarga(
          'No se pudo cargar la información del Dashboard.',
        )

        setCargando(false)
      }
    })

    return () => {
      componenteActivo = false
    }
  }, [
    puedeVerClientes,
    puedeVerHigiene,
    puedeVerInventario,
    puedeVerMascotas,
    puedeVerTurnos,
    puedeVerVacunaciones,
    puedeVerVentas,
  ])

  const {
    clientes,
    mascotas,
    turnos,
    vacunaciones,
    servicios,
    ventas,
    productos,
    lotes,
    higiene,
  } = datos

  const mascotasPorId = useMemo(
    () =>
      new Map(
        mascotas.map(
          (mascota) => [
            Number(mascota.id),
            mascota,
          ],
        ),
      ),
    [mascotas],
  )

  const clientesPorId = useMemo(
    () =>
      new Map(
        clientes.map(
          (cliente) => [
            Number(cliente.id),
            cliente,
          ],
        ),
      ),
    [clientes],
  )

  const serviciosPorId = useMemo(
    () =>
      new Map(
        servicios.map(
          (servicio) => [
            Number(servicio.id),
            servicio,
          ],
        ),
      ),
    [servicios],
  )

  const turnosProgramados = useMemo(
    () =>
      turnos.filter((turno) =>
        [
          'pendiente',
          'programado',
        ].includes(
          normalizarTexto(turno.estado),
        ),
      ).length,
    [turnos],
  )

  const ventasValidas = useMemo(
    () =>
      ventas.filter(
        (venta) =>
          normalizarTexto(
            venta.estado,
          ) !== 'cancelada',
      ),
    [ventas],
  )

  const totalVentas = useMemo(
    () =>
      ventasValidas.reduce(
        (total, venta) =>
          total
          + obtenerNumero(venta.total),
        0,
      ),
    [ventasValidas],
  )

  const totalUnidadesStock = useMemo(() => {
    if (lotes.length > 0) {
      return lotes.reduce(
        (total, lote) =>
          total
          + obtenerNumero(
            lote.cantidad_disponible
            ?? lote.cantidadDisponible,
          ),
        0,
      )
    }

    return productos.reduce(
      (total, producto) =>
        total
        + obtenerNumero(
          producto.stock_actual
          ?? producto.stockActual
          ?? producto.stock
            ?.cantidad_disponible,
        ),
      0,
    )
  }, [lotes, productos])

  const productosBajoStock = useMemo(() => {
    return productos.filter((producto) => {
      const productoId = Number(producto.id)

      const lotesProducto = lotes.filter(
        (lote) =>
          obtenerId(lote.producto)
          === productoId,
      )

      const cantidad =
        lotesProducto.length > 0
          ? lotesProducto.reduce(
              (total, lote) =>
                total
                + obtenerNumero(
                  lote.cantidad_disponible
                  ?? lote.cantidadDisponible,
                ),
              0,
            )
          : obtenerNumero(
              producto.stock_actual
              ?? producto.stockActual
              ?? producto.stock
                ?.cantidad_disponible,
            )

      const minimo = obtenerNumero(
        producto.stock_minimo
        ?? producto.stockMinimo,
      )

      return cantidad <= minimo
    })
  }, [productos, lotes])

  const proximasVacunaciones = useMemo(() => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    return vacunaciones
      .map((vacunacion) => {
        const estado = normalizarTexto(
          vacunacion.estado,
        )

        const fechaProxima =
          vacunacion.proxima_dosis
          ?? vacunacion.proximaDosis
          ?? (
            estado === 'pendiente'
              ? vacunacion.fecha_aplicacion
                ?? vacunacion.fecha
              : null
          )

        return {
          ...vacunacion,
          fechaProxima,
        }
      })
      .filter((vacunacion) => {
        const fecha = convertirFechaLocal(
          vacunacion.fechaProxima,
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
          convertirFechaLocal(
            a.fechaProxima,
          )
          - convertirFechaLocal(
            b.fechaProxima,
          )
        )
      })
      .slice(0, 5)
  }, [vacunaciones])

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

  const ultimasVentas = useMemo(
    () =>
      [...ventasValidas]
        .sort((a, b) => {
          const fechaA =
            convertirFechaLocal(
              a.fecha,
            )?.getTime() || 0

          const fechaB =
            convertirFechaLocal(
              b.fecha,
            )?.getTime() || 0

          if (fechaA !== fechaB) {
            return fechaB - fechaA
          }

          return (
            Number(b.id)
            - Number(a.id)
          )
        })
        .slice(0, 5),
    [ventasValidas],
  )

  const ultimosServiciosHigiene =
    useMemo(
      () =>
        [...higiene]
          .sort(
            (a, b) =>
              (
                convertirFechaLocal(
                  b.fecha,
                )?.getTime() || 0
              )
              - (
                convertirFechaLocal(
                  a.fecha,
                )?.getTime() || 0
              ),
          )
          .slice(0, 5),
      [higiene],
    )

  const obtenerNombreMascota = (
    registro,
  ) => {
    if (registro.mascota_nombre) {
      return registro.mascota_nombre
    }

    if (
      registro.mascota
      && typeof registro.mascota === 'object'
    ) {
      return (
        registro.mascota.nombre
        || 'Mascota'
      )
    }

    const mascotaId = obtenerId(
      registro.mascotaId
      ?? registro.mascota,
    )

    return (
      mascotasPorId.get(
        mascotaId,
      )?.nombre
      || 'Mascota'
    )
  }

  const obtenerNombreVacuna = (
    vacunacion,
  ) => {
    if (vacunacion.servicio_nombre) {
      return vacunacion.servicio_nombre
    }

    if (vacunacion.vacuna) {
      return vacunacion.vacuna
    }

    const servicioId = obtenerId(
      vacunacion.servicioId
      ?? vacunacion.servicio,
    )

    const servicio =
      serviciosPorId.get(servicioId)

    return (
      servicio?.descripcion
      || servicio?.nombre
      || 'Vacunación'
    )
  }

  const obtenerNombreClienteVenta = (
    venta,
  ) => {
    if (venta.cliente_nombre) {
      return venta.cliente_nombre
    }

    if (
      venta.consumidor_final
      || !venta.cliente
    ) {
      return 'Consumidor final'
    }

    if (
      venta.cliente
      && typeof venta.cliente === 'object'
    ) {
      return (
        `${venta.cliente.nombre || ''} `
        + `${venta.cliente.apellido || ''}`
      ).trim()
    }

    const clienteId = obtenerId(
      venta.clienteId
      ?? venta.cliente,
    )

    const cliente =
      clientesPorId.get(clienteId)

    if (!cliente) {
      return 'Cliente no encontrado'
    }

    return (
      `${cliente.nombre || ''} `
      + `${cliente.apellido || ''}`
    ).trim()
  }

  const subtitulo = esAdministrador
    ? 'Resumen general de la Clínica'
    : esRecepcionista
      ? 'Agenda, clientes y atención al público'
      : esVeterinario
        ? 'Agenda y actividad clínica'
        : esVentas
          ? 'Resumen comercial e inventario'
          : esHigiene
            ? 'Agenda y servicios de higiene'
            : 'Resumen del sistema'

  return (
    <section className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard</h1>

        <p>
          {cargando
            ? 'Cargando información...'
            : subtitulo}
        </p>
      </div>

      {errorCarga && (
        <div className="dashboard-sales-card">
          <strong>{errorCarga}</strong>

          <p>
            Los datos disponibles se muestran
            normalmente.
          </p>
        </div>
      )}

      <div className="dashboard-stats">
        {puedeVerClientes && (
          <div className="dashboard-stat-card">
            <div>
              <p>Clientes</p>
              <strong>{clientes.length}</strong>
              <span>Total de registrados</span>
            </div>

            <FaUsers className="stat-icon" />
          </div>
        )}

        {puedeVerMascotas && (
          <div className="dashboard-stat-card">
            <div>
              <p>Mascotas</p>
              <strong>{mascotas.length}</strong>
              <span>Total de registradas</span>
            </div>

            <FaPaw className="stat-icon" />
          </div>
        )}

        {puedeVerTurnos && (
          <div className="dashboard-stat-card">
            <div>
              <p>Turnos</p>

              <strong>
                {turnosProgramados}
              </strong>

              <span>Turnos programados</span>
            </div>

            <FaCalendarDays
              className="stat-icon"
            />
          </div>
        )}

        {puedeVerVentas && (
          <div className="dashboard-stat-card">
            <div>
              <p>Ventas</p>

              <strong>
                {formatoDinero.format(
                  totalVentas,
                )}
              </strong>

              <span>Total registrado</span>
            </div>

            <FaMoneyBillWave
              className="stat-icon"
            />
          </div>
        )}

        {esVeterinario && (
          <div className="dashboard-stat-card">
            <div>
              <p>Vacunaciones</p>

              <strong>
                {vacunacionesAplicadas}
              </strong>

              <span>Vacunas aplicadas</span>
            </div>

            <FaSyringe className="stat-icon" />
          </div>
        )}

        {esVentas && (
          <>
            <div className="dashboard-stat-card">
              <div>
                <p>Productos</p>

                <strong>
                  {productos.length}
                </strong>

                <span>Productos registrados</span>
              </div>

              <FaBoxOpen className="stat-icon" />
            </div>

            <div className="dashboard-stat-card">
              <div>
                <p>Unidades en stock</p>

                <strong>
                  {totalUnidadesStock}
                </strong>

                <span>
                  {productosBajoStock.length}
                  {' '}con stock bajo
                </span>
              </div>

              <FaBoxesStacked
                className="stat-icon"
              />
            </div>
          </>
        )}

        {esHigiene && (
          <>
            <div className="dashboard-stat-card">
              <div>
                <p>Servicios</p>

                <strong>
                  {higiene.length}
                </strong>

                <span>Servicios registrados</span>
              </div>

              <FaScissors className="stat-icon" />
            </div>

            <div className="dashboard-stat-card">
              <div>
                <p>Realizados</p>

                <strong>
                  {serviciosHigieneRealizados}
                </strong>

                <span>Servicios completados</span>
              </div>

              <FaScissors className="stat-icon" />
            </div>
          </>
        )}
      </div>

      {puedeVerTurnos && (
        <div
          className={
            puedeVerVacunaciones
              ? 'dashboard-content-grid'
              : (
                  'dashboard-content-grid '
                  + 'dashboard-una-columna'
                )
          }
        >
          <div className="dashboard-calendar-card">
            <CalendarioTurnos
              turnos={turnos}
              mascotas={mascotas}
            />
          </div>

          {puedeVerVacunaciones && (
            <div className="dashboard-vaccine-card">
              <h3>Próximas Vacunaciones</h3>

              <div className="vaccine-list">
                {proximasVacunaciones.map(
                  (vacunacion) => (
                    <div
                      className="vaccine-item"
                      key={vacunacion.id}
                    >
                      <div>
                        <strong>
                          {obtenerNombreMascota(
                            vacunacion,
                          )}
                        </strong>

                        <span>
                          {obtenerNombreVacuna(
                            vacunacion,
                          )}
                        </span>
                      </div>

                      <p>
                        {formatearFecha(
                          vacunacion.fechaProxima,
                        )}
                      </p>
                    </div>
                  ),
                )}

                {!cargando
                  && proximasVacunaciones.length
                    === 0 && (
                    <p>
                      No hay próximas vacunaciones
                      registradas.
                    </p>
                  )}
              </div>
            </div>
          )}
        </div>
      )}

      {puedeVerVentas && (
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
                  <td>
                    {formatearFecha(
                      venta.fecha,
                    )}
                  </td>

                  <td>
                    {obtenerNombreClienteVenta(
                      venta,
                    )}
                  </td>

                  <td>
                    {formatoDinero.format(
                      obtenerNumero(
                        venta.total,
                      ),
                    )}
                  </td>

                  <td>
                    <span>
                      {capitalizar(
                        venta.estado,
                      )}
                    </span>
                  </td>
                </tr>
              ))}

              {!cargando
                && ultimasVentas.length === 0 && (
                  <tr>
                    <td colSpan="4">
                      No hay ventas registradas.
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      )}

      {esHigiene && (
        <div className="dashboard-sales-card">
          <h3>Últimos Servicios de Higiene</h3>

          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Mascota</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {ultimosServiciosHigiene.map(
                (servicio) => (
                  <tr key={servicio.id}>
                    <td>
                      {formatearFecha(
                        servicio.fecha,
                      )}
                    </td>

                    <td>
                      {obtenerNombreMascota(
                        servicio,
                      )}
                    </td>

                    <td>
                      <span>
                        {capitalizar(
                          servicio.estado,
                        )}
                      </span>
                    </td>
                  </tr>
                ),
              )}

              {!cargando
                && ultimosServiciosHigiene.length
                  === 0 && (
                  <tr>
                    <td colSpan="3">
                      No hay servicios registrados.
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default Dashboard