const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

const TURNOS_URL = `${API_BASE_URL}/turnos/`

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

          return listaMensajes.map((mensaje) => `${campo}: ${mensaje}`)
        }
      )

      if (mensajes.length > 0) {
        detalle = mensajes.join(' ')
      }
    }
  } catch {
    // Se conserva el mensaje general si Django no devuelve JSON.
  }

  throw new Error(detalle)
}

export async function obtenerTurnos() {
  const respuesta = await fetch(TURNOS_URL, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  return procesarRespuesta(respuesta)
}

export async function obtenerTurnoPorId(id) {
  const respuesta = await fetch(`${TURNOS_URL}${id}/`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  return procesarRespuesta(respuesta)
}

export async function crearTurno(datosTurno) {
  const respuesta = await fetch(TURNOS_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(datosTurno),
  })

  return procesarRespuesta(respuesta)
}

export async function editarTurno(id, datosTurno) {
  const respuesta = await fetch(`${TURNOS_URL}${id}/`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(datosTurno),
  })

  return procesarRespuesta(respuesta)
}

export async function editarTurnoParcial(id, datosTurno) {
  const respuesta = await fetch(`${TURNOS_URL}${id}/`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(datosTurno),
  })

  return procesarRespuesta(respuesta)
}

export async function eliminarTurno(id) {
  const respuesta = await fetch(`${TURNOS_URL}${id}/`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
    },
  })

  return procesarRespuesta(respuesta)
}