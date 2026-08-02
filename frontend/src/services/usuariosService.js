import api from './api'

export const obtenerUsuarios = async () => {
  const respuesta = await api.get('/usuarios/')
  return respuesta.data
}

export const obtenerUsuario = async (id) => {
  const respuesta = await api.get(
    `/usuarios/${id}/`,
  )

  return respuesta.data
}

export const crearUsuario = async (datos) => {
  const respuesta = await api.post(
    '/usuarios/',
    datos,
  )

  return respuesta.data
}

export const actualizarUsuario = async (
  id,
  datos,
) => {
  const respuesta = await api.patch(
    `/usuarios/${id}/`,
    datos,
  )

  return respuesta.data
}

export const eliminarUsuario = async (id) => {
  await api.delete(`/usuarios/${id}/`)
}

export const restablecerPassword = async (
  id,
  passwordTemporal,
  passwordConfirmacion,
) => {
  const respuesta = await api.post(
    `/usuarios/${id}/restablecer-password/`,
    {
      password_temporal: passwordTemporal,
      password_confirmacion: passwordConfirmacion,
    },
  )

  return respuesta.data
}