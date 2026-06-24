export const clientes = [
  {
    id: 1,
    nombre: 'María',
    apellido: 'López',
    telefono: '3415551234',
  },
  {
    id: 2,
    nombre: 'Juan',
    apellido: 'Pérez',
    telefono: '3415558899',
  },
  {
    id: 3,
    nombre: 'Carla',
    apellido: 'Gómez',
    telefono: '3415556677',
  },
]

export const mascotas = [
  {
    id: 1,
    nombre: 'Rocky',
    especie: 'Perro',
    clienteId: 1,
  },
  {
    id: 2,
    nombre: 'Luna',
    especie: 'Gato',
    clienteId: 2,
  },
  {
    id: 3,
    nombre: 'Simba',
    especie: 'Gato',
    clienteId: 3,
  },
]

export const turnos = [
  {
    id: 1,
    mascotaId: 1,
    motivo: 'Consulta',
    fechaInicio: '2026-06-24T09:00:00',
    fechaFin: '2026-06-24T09:40:00',
  },
  {
    id: 2,
    mascotaId: 2,
    motivo: 'Vacunación',
    fechaInicio: '2026-06-24T11:00:00',
    fechaFin: '2026-06-24T11:30:00',
  },
  {
    id: 3,
    mascotaId: 3,
    motivo: 'Control',
    fechaInicio: '2026-06-25T10:00:00',
    fechaFin: '2026-06-25T10:40:00',
  },
]

export const vacunaciones = [
  {
    id: 1,
    mascotaId: 1,
    vacuna: 'Rabia',
    fecha: '2026-06-28',
  },
  {
    id: 2,
    mascotaId: 2,
    vacuna: 'Polivalente',
    fecha: '2026-06-30',
  },
  {
    id: 3,
    mascotaId: 3,
    vacuna: 'Refuerzo',
    fecha: '2026-07-03',
  },
]

export const ventas = [
  {
    id: 1,
    clienteId: 1,
    fecha: '2026-06-24',
    total: 25000,
    estado: 'Completada',
  },
  {
    id: 2,
    clienteId: 2,
    fecha: '2026-06-24',
    total: 18500,
    estado: 'Completada',
  },
  {
    id: 3,
    clienteId: 3,
    fecha: '2026-06-23',
    total: 32000,
    estado: 'Completada',
  },
]