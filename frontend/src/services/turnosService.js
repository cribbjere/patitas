import api from './api'

export const obtenerTurnos = async () => {
  const respuesta = await api.get('/turnos/')
  return respuesta.data
}

export const obtenerTurnoPorId = async (id) => {
  const respuesta = await api.get(`/turnos/${id}/`)
  return respuesta.data
}

export const crearTurno = async (datosTurno) => {
  const respuesta = await api.post('/turnos/', datosTurno)
  return respuesta.data
}

export const editarTurno = async (id, datosTurno) => {
  const respuesta = await api.patch(`/turnos/${id}/`, datosTurno)
  return respuesta.data
}

export const editarTurnoParcial = async (id, datosTurno) => {
  const respuesta = await api.patch(`/turnos/${id}/`, datosTurno)
  return respuesta.data
}

export const eliminarTurno = async (id) => {
  await api.delete(`/turnos/${id}/`)
}