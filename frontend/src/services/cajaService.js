import api from './api'

export const obtenerMovimientosCaja = async (filtros = {}) => {
  const respuesta = await api.get('/movimientos-caja/', {
    params: filtros,
  })

  return respuesta.data
}

export const obtenerMovimientoCajaPorId = async (id) => {
  const respuesta = await api.get(
    `/movimientos-caja/${id}/`
  )

  return respuesta.data
}

export const crearMovimientoCaja = async (datos) => {
  const respuesta = await api.post(
    '/movimientos-caja/',
    datos
  )

  return respuesta.data
}

export const editarMovimientoCaja = async (id, datos) => {
  const respuesta = await api.patch(
    `/movimientos-caja/${id}/`,
    datos
  )

  return respuesta.data
}

export const eliminarMovimientoCaja = async (id) => {
  await api.delete(`/movimientos-caja/${id}/`)
}

export const obtenerCierresCaja = async (filtros = {}) => {
  const respuesta = await api.get('/cierres-caja/', {
    params: filtros,
  })

  return respuesta.data
}

export const obtenerCierreCajaPorId = async (id) => {
  const respuesta = await api.get(
    `/cierres-caja/${id}/`
  )

  return respuesta.data
}

export const crearCierreCaja = async (datos) => {
  const respuesta = await api.post(
    '/cierres-caja/',
    datos
  )

  return respuesta.data
}

export const eliminarCierreCaja = async (id) => {
  await api.delete(`/cierres-caja/${id}/`)
}