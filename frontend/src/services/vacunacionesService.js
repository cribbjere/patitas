import api from './api'

export const obtenerVacunaciones = async () => {
  const respuesta = await api.get('/vacunaciones/')
  return respuesta.data
}

export const obtenerVacunacionPorId = async (id) => {
  const respuesta = await api.get(`/vacunaciones/${id}/`)
  return respuesta.data
}

export const crearVacunacion = async (datos) => {
  const respuesta = await api.post('/vacunaciones/', datos)
  return respuesta.data
}

export const editarVacunacion = async (id, datos) => {
  const respuesta = await api.patch(`/vacunaciones/${id}/`, datos)
  return respuesta.data
}

export const eliminarVacunacion = async (id) => {
  await api.delete(`/vacunaciones/${id}/`)
}