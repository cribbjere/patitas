export const soloLetras = (valor) => {
  return valor.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]/g, '')
}

export const soloNumeros = (valor) => {
  return valor.replace(/\D/g, '')
}

export const soloNumerosDecimales = (valor) => {
  let limpio = valor.replace(/[^0-9.]/g, '')

  const partes = limpio.split('.')

  if (partes.length > 2) {
    limpio = partes[0] + '.' + partes.slice(1).join('')
  }

  return limpio
}