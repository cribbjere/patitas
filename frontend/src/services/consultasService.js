import api from './api'

export const obtenerConsultas = async () => {
  const respuesta = await api.get('/consultas/')
  return respuesta.data
}

export const obtenerConsultaPorId = async (id) => {
  const respuesta = await api.get(`/consultas/${id}/`)
  return respuesta.data
}

export const crearConsulta = async (datosConsulta) => {
  const respuesta = await api.post('/consultas/', datosConsulta)
  return respuesta.data
}

export const editarConsulta = async (id, datosConsulta) => {
  const respuesta = await api.patch(`/consultas/${id}/`, datosConsulta)
  return respuesta.data
}

export const editarConsultaParcial = async (id, datosConsulta) => {
  const respuesta = await api.patch(`/consultas/${id}/`, datosConsulta)
  return respuesta.data
}

export const eliminarConsulta = async (id) => {
  await api.delete(`/consultas/${id}/`)
}