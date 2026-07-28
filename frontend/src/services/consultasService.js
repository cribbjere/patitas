const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

const CONSULTAS_URL = `${API_BASE_URL}/consultas/`

async function procesarRespuesta(respuesta) {
  if (respuesta.ok) {
    if (respuesta.status === 204) return null
    return respuesta.json()
  }

  let detalle = 'Ocurrió un error al comunicarse con el servidor.'

  try {
    const datosError = await respuesta.json()

    if (typeof datosError === 'string') {
      detalle = datosError
    } else if (datosError.detail) {
      detalle = datosError.detail
    } else {
      const mensajes = Object.entries(datosError).flatMap(
        ([campo, mensajesCampo]) => {
          const listaMensajes = Array.isArray(mensajesCampo)
            ? mensajesCampo
            : [mensajesCampo]

          return listaMensajes.map(
            (mensaje) => `${campo}: ${mensaje}`
          )
        }
      )

      if (mensajes.length > 0) {
        detalle = mensajes.join(' ')
      }
    }
  } catch {
    // Si Django no devuelve JSON se conserva el mensaje general.
  }

  throw new Error(detalle)
}

export async function obtenerConsultas() {
  const respuesta = await fetch(CONSULTAS_URL, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  return procesarRespuesta(respuesta)
}

export async function obtenerConsultaPorId(id) {
  const respuesta = await fetch(`${CONSULTAS_URL}${id}/`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  return procesarRespuesta(respuesta)
}

export async function crearConsulta(datosConsulta) {
  const respuesta = await fetch(CONSULTAS_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(datosConsulta),
  })

  return procesarRespuesta(respuesta)
}

export async function editarConsulta(id, datosConsulta) {
  const respuesta = await fetch(`${CONSULTAS_URL}${id}/`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(datosConsulta),
  })

  return procesarRespuesta(respuesta)
}

export async function editarConsultaParcial(id, datosConsulta) {
  const respuesta = await fetch(`${CONSULTAS_URL}${id}/`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(datosConsulta),
  })

  return procesarRespuesta(respuesta)
}

export async function eliminarConsulta(id) {
  const respuesta = await fetch(`${CONSULTAS_URL}${id}/`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
    },
  })

  return procesarRespuesta(respuesta)
}