import api from './api'

export const obtenerProductos = async () => {
  const respuesta = await api.get('/productos/')
  return respuesta.data
}

export const obtenerProductoPorId = async (id) => {
  const respuesta = await api.get(`/productos/${id}/`)
  return respuesta.data
}

export const crearProducto = async (datos) => {
  const respuesta = await api.post('/productos/', datos)
  return respuesta.data
}

export const editarProducto = async (id, datos) => {
  const respuesta = await api.patch(`/productos/${id}/`, datos)
  return respuesta.data
}

export const eliminarProducto = async (id) => {
  await api.delete(`/productos/${id}/`)
}