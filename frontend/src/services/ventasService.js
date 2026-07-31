import api from './api'

export const obtenerVentas = async () => {
  const respuesta = await api.get('/ventas/')
  return respuesta.data
}

export const obtenerVentaPorId = async (id) => {
  const respuesta = await api.get(`/ventas/${id}/`)
  return respuesta.data
}

export const crearVenta = async (datos) => {
  const respuesta = await api.post('/ventas/', datos)
  return respuesta.data
}

export const editarVenta = async (id, datos) => {
  const respuesta = await api.patch(
    `/ventas/${id}/`,
    datos
  )

  return respuesta.data
}

export const eliminarVenta = async (id) => {
  await api.delete(`/ventas/${id}/`)
}

export const obtenerDetallesVenta = async (
  ventaId = null
) => {
  const parametros = ventaId
    ? { venta: ventaId }
    : {}

  const respuesta = await api.get(
    '/detalles-venta/',
    {
      params: parametros,
    }
  )

  return respuesta.data
}

export const obtenerComprobanteVenta = async (id) => {
  const respuesta = await api.get(
    `/ventas/${id}/comprobante/`,
    {
      responseType: 'blob',
    }
  )

  return respuesta.data
}

export const descargarComprobanteVenta = async (
  venta
) => {
  const archivo = await obtenerComprobanteVenta(
    venta.id
  )

  const url = window.URL.createObjectURL(archivo)
  const enlace = document.createElement('a')

  enlace.href = url
  enlace.download =
    `${venta.numero_comprobante || `venta-${venta.id}`}.pdf`

  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()

  window.URL.revokeObjectURL(url)
}