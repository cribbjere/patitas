import api from './api'

export const obtenerCirugias = async () => {
  const respuesta = await api.get('/cirugias/')
  return respuesta.data
}

export const obtenerCirugiaPorId = async (id) => {
  const respuesta = await api.get(`/cirugias/${id}/`)
  return respuesta.data
}

export const crearCirugia = async (datos) => {
  const respuesta = await api.post('/cirugias/', datos)
  return respuesta.data
}

export const editarCirugia = async (id, datos) => {
  const respuesta = await api.patch(`/cirugias/${id}/`, datos)
  return respuesta.data
}

export const eliminarCirugia = async (id) => {
  await api.delete(`/cirugias/${id}/`)
}