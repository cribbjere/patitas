import api from './api'


export const obtenerResumenDashboard = async () => {
  const respuesta = await api.get('/dashboard/')
  return respuesta.data
}


export const obtenerReporteVentas = async () => {
  const respuesta = await api.get(
    '/reportes/ventas/',
  )

  return respuesta.data
}


export const obtenerReporteCompras = async () => {
  const respuesta = await api.get(
    '/reportes/compras/',
  )

  return respuesta.data
}


export const obtenerReporteStockBajo = async () => {
  const respuesta = await api.get(
    '/reportes/stock-bajo/',
  )

  return respuesta.data
}


export const obtenerReporteCaja = async () => {
  const respuesta = await api.get(
    '/reportes/caja/',
  )

  return respuesta.data
}


export const descargarReporteVentasExcel =
  async () => {
    const respuesta = await api.get(
      '/reportes/ventas/excel/',
      {
        responseType: 'blob',
      },
    )

    const archivo = respuesta.data
    const url = window.URL.createObjectURL(
      archivo,
    )

    const enlace = document.createElement('a')

    enlace.href = url
    enlace.download = 'reporte_ventas.xlsx'

    document.body.appendChild(enlace)
    enlace.click()
    enlace.remove()

    window.URL.revokeObjectURL(url)
  }