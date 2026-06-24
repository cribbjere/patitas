export const clientes = [
  {
    id: 1,
    nombre: 'María',
    apellido: 'López',
    telefono: '3415551234',
    email: 'maria.lopez@gmail.com',
    direccion: 'San Martín 1240',
    estado: true,
  },
  {
    id: 2,
    nombre: 'Juan',
    apellido: 'Pérez',
    telefono: '3415558899',
    email: 'juan.perez@gmail.com',
    direccion: 'Belgrano 850',
    estado: true,
  },
  {
    id: 3,
    nombre: 'Carla',
    apellido: 'Gómez',
    telefono: '3415556677',
    email: 'carla.gomez@gmail.com',
    direccion: 'Rivadavia 560',
    estado: true,
  },
]

export const mascotas = [
  {
    id: 1,
    nombre: 'Rocky',
    especie: 'Perro',
    raza: 'Mestizo',
    fechaNacimiento: '2021-04-12',
    sexo: 'Macho',
    peso: 18.5,
    observaciones: 'Paciente tranquilo.',
    clienteId: 1,
  },
  {
    id: 2,
    nombre: 'Luna',
    especie: 'Gato',
    raza: 'Siamés',
    fechaNacimiento: '2022-08-03',
    sexo: 'Hembra',
    peso: 4.2,
    observaciones: 'Requiere control de vacunas.',
    clienteId: 2,
  },
  {
    id: 3,
    nombre: 'Simba',
    especie: 'Gato',
    raza: 'Naranja',
    fechaNacimiento: '2020-11-20',
    sexo: 'Macho',
    peso: 5.1,
    observaciones: 'Paciente activo.',
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
    estado: 'Programado',
  },
  {
    id: 2,
    mascotaId: 2,
    motivo: 'Vacunación',
    fechaInicio: '2026-06-24T11:00:00',
    fechaFin: '2026-06-24T11:30:00',
    estado: 'Programado',
  },
  {
    id: 3,
    mascotaId: 3,
    motivo: 'Control',
    fechaInicio: '2026-06-25T10:00:00',
    fechaFin: '2026-06-25T10:40:00',
    estado: 'Programado',
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
export const productos = [
  {
    id: 1,
    descripcion: 'Alimento balanceado perro adulto',
    categoria: 'Alimento',
    precio: 18500,
    estado: true,
  },
  {
    id: 2,
    descripcion: 'Alimento balanceado gato adulto',
    categoria: 'Alimento',
    precio: 16500,
    estado: true,
  },
  {
    id: 3,
    descripcion: 'Shampoo neutro para mascotas',
    categoria: 'Higiene',
    precio: 7200,
    estado: true,
  },
  {
    id: 4,
    descripcion: 'Pipeta antipulgas',
    categoria: 'Medicamento',
    precio: 9500,
    estado: true,
  },
  {
    id: 5,
    descripcion: 'Collar regulable',
    categoria: 'Accesorio',
    precio: 6000,
    estado: true,
  },
]
export const stock = [
  {
    id: 1,
    productoId: 1,
    cantidad: 12,
    stockMinimo: 5,
    ultimaActualizacion: '2026-06-24',
  },
  {
    id: 2,
    productoId: 2,
    cantidad: 8,
    stockMinimo: 5,
    ultimaActualizacion: '2026-06-24',
  },
  {
    id: 3,
    productoId: 3,
    cantidad: 3,
    stockMinimo: 4,
    ultimaActualizacion: '2026-06-23',
  },
  {
    id: 4,
    productoId: 4,
    cantidad: 0,
    stockMinimo: 3,
    ultimaActualizacion: '2026-06-22',
  },
  {
    id: 5,
    productoId: 5,
    cantidad: 15,
    stockMinimo: 5,
    ultimaActualizacion: '2026-06-21',
  },
]