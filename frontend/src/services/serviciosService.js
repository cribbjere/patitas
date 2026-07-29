import api from './api'

export const obtenerServicios = async () => {
  const respuesta = await api.get('/servicios/')
  return respuesta.data
}

export const obtenerServicioPorId = async (id) => {
  const respuesta = await api.get(`/servicios/${id}/`)
  return respuesta.data
}

export const crearServicio = async (datos) => {
  const respuesta = await api.post('/servicios/', datos)
  return respuesta.data
}

export const editarServicio = async (id, datos) => {
  const respuesta = await api.patch(`/servicios/${id}/`, datos)
  return respuesta.data
}

export const eliminarServicio = async (id) => {
  await api.delete(`/servicios/${id}/`)
}