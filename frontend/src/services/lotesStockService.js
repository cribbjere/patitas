import api from './api'

export const obtenerLotesStock = async () => {
  const respuesta = await api.get('/lotes-stock/')
  return respuesta.data
}

export const crearLoteStock = async (datos) => {
  const respuesta = await api.post('/lotes-stock/', datos)
  return respuesta.data
}

export const editarLoteStock = async (id, datos) => {
  const respuesta = await api.patch(
    `/lotes-stock/${id}/`,
    datos
  )

  return respuesta.data
}

export const eliminarLoteStock = async (id) => {
  await api.delete(`/lotes-stock/${id}/`)
}