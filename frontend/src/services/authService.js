const API_URL = 'http://127.0.0.1:8000/api'

const obtenerMensajeError = (data, mensajePredeterminado) => {
  if (data?.detail) {
    return data.detail
  }

  if (data?.error) {
    return data.error
  }

  const primerCampo = Object.values(data || {})[0]

  if (Array.isArray(primerCampo)) {
    return primerCampo[0]
  }

  if (typeof primerCampo === 'string') {
    return primerCampo
  }

  return mensajePredeterminado
}

export const login = async (username, password) => {
  const response = await fetch(`${API_URL}/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      obtenerMensajeError(
        data,
        'Error al iniciar sesión',
      ),
    )
  }

  localStorage.setItem('token', data.token)

  localStorage.setItem(
    'usuario',
    JSON.stringify(data.usuario),
  )

  return data
}

export const cambiarPassword = async ({
  passwordActual,
  passwordNueva,
  passwordConfirmacion,
}) => {
  const token = localStorage.getItem('token')

  const response = await fetch(
    `${API_URL}/cambiar-password/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({
        password_actual: passwordActual,
        password_nueva: passwordNueva,
        password_confirmacion: passwordConfirmacion,
      }),
    },
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      obtenerMensajeError(
        data,
        'No se pudo cambiar la contraseña',
      ),
    )
  }

  localStorage.setItem(
    'usuario',
    JSON.stringify(data.usuario),
  )

  return data
}

export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
}

export const obtenerUsuarioActual = () => {
  const usuarioGuardado =
    localStorage.getItem('usuario')

  if (!usuarioGuardado) {
    return null
  }

  try {
    return JSON.parse(usuarioGuardado)
  } catch {
    return null
  }
}