const API_URL = 'http://127.0.0.1:8000/api'

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
    throw new Error(data.error || 'Error al iniciar sesión')
  }

  localStorage.setItem('token', data.token)
  localStorage.setItem('usuario', JSON.stringify(data.usuario))

  return data
}