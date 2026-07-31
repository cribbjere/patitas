import api from './api'

export const obtenerServiciosHigiene = async () => {
  const respuesta = await api.get('/higiene/')
  return respuesta.data
}

export const obtenerServicioHigienePorId = async (id) => {
  const respuesta = await api.get(`/higiene/${id}/`)
  return respuesta.data
}

export const crearServicioHigiene = async (datos) => {
  const respuesta = await api.post('/higiene/', datos)
  return respuesta.data
}

export const editarServicioHigiene = async (id, datos) => {
  const respuesta = await api.patch(`/higiene/${id}/`, datos)
  return respuesta.data
}

export const eliminarServicioHigiene = async (id) => {
  await api.delete(`/higiene/${id}/`)
}