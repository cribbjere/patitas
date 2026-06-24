const CLAVE_ALERTAS = 'alertasPatitas'

export const obtenerAlertasSistema = () => {
  const alertasGuardadas = localStorage.getItem(CLAVE_ALERTAS)

  if (!alertasGuardadas) {
    return []
  }

  try {
    return JSON.parse(alertasGuardadas)
  } catch {
    return []
  }
}

export const crearAlertaSistema = (alerta) => {
  const alertasActuales = obtenerAlertasSistema()

  if (alerta.clave) {
    const alertaExistente = alertasActuales.find(
      (item) => item.clave === alerta.clave
    )

    if (alertaExistente) {
      return alertaExistente
    }
  }

  const nuevaAlerta = {
    id: Date.now(),
    fecha: new Date().toISOString(),
    leida: false,
    ...alerta,
  }

  const alertasActualizadas = [nuevaAlerta, ...alertasActuales]

  localStorage.setItem(CLAVE_ALERTAS, JSON.stringify(alertasActualizadas))

  window.dispatchEvent(new Event('alertasActualizadas'))

  return nuevaAlerta
}

export const marcarAlertaComoLeida = (id) => {
  const alertasActuales = obtenerAlertasSistema()

  const alertasActualizadas = alertasActuales.map((alerta) => {
    if (alerta.id === id) {
      return {
        ...alerta,
        leida: true,
      }
    }

    return alerta
  })

  localStorage.setItem(CLAVE_ALERTAS, JSON.stringify(alertasActualizadas))

  window.dispatchEvent(new Event('alertasActualizadas'))
}

export const limpiarAlertasSistema = () => {
  localStorage.setItem(CLAVE_ALERTAS, JSON.stringify([]))

  window.dispatchEvent(new Event('alertasActualizadas'))
}