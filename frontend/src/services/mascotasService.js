import api from './api'

export const obtenerEspecies = async () => {
  const respuesta = await api.get('/especies/')
  return respuesta.data
}

export const obtenerMascotas = async () => {
  const respuesta = await api.get('/mascotas/')
  return respuesta.data
}

export const crearMascota = async (datosMascota) => {
  const respuesta = await api.post('/mascotas/', datosMascota)
  return respuesta.data
}

export const actualizarMascota = async (id, datosMascota) => {
  const respuesta = await api.put(`/mascotas/${id}/`, datosMascota)
  return respuesta.data
}

export const eliminarMascota = async (id) => {
  await api.delete(`/mascotas/${id}/`)
}