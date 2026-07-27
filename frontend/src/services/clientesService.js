import api from './api'

export const obtenerClientes = async () => {
  const respuesta = await api.get('/clientes/')
  return respuesta.data
}

export const crearCliente = async (datosCliente) => {
  const respuesta = await api.post('/clientes/', datosCliente)
  return respuesta.data
}

export const actualizarCliente = async (id, datosCliente) => {
  const respuesta = await api.put(`/clientes/${id}/`, datosCliente)
  return respuesta.data
}

export const eliminarCliente = async (id) => {
  await api.delete(`/clientes/${id}/`)
}