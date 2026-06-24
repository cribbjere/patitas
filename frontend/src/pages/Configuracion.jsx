import { useState } from 'react'

const configuracionInicial = {
  nombreVeterinaria: 'Veterinaria Patitas',
  telefono: '3415551234',
  email: 'contacto@patitas.com',
  direccion: 'San Martín 1240',
  ciudad: 'Correa',
  moneda: 'ARS',
  idioma: 'Español',
  tema: 'Claro',
  backup: 'Manual',
  estadoSistema: true,
}

const horariosIniciales = [
  {
    id: 1,
    dia: 'Lunes',
    apertura: '08:00',
    cierre: '18:00',
    activo: true,
  },
  {
    id: 2,
    dia: 'Martes',
    apertura: '08:00',
    cierre: '18:00',
    activo: true,
  },
  {
    id: 3,
    dia: 'Miércoles',
    apertura: '08:00',
    cierre: '18:00',
    activo: true,
  },
  {
    id: 4,
    dia: 'Jueves',
    apertura: '08:00',
    cierre: '18:00',
    activo: true,
  },
  {
    id: 5,
    dia: 'Viernes',
    apertura: '08:00',
    cierre: '18:00',
    activo: true,
  },
  {
    id: 6,
    dia: 'Sábado',
    apertura: '09:00',
    cierre: '13:00',
    activo: true,
  },
  {
    id: 7,
    dia: 'Domingo',
    apertura: '',
    cierre: '',
    activo: false,
  },
]

const rolesSistema = [
  {
    rol: 'Administrador',
    descripcion: 'Acceso total al sistema',
  },
  {
    rol: 'Recepcionista',
    descripcion: 'Clientes, mascotas y turnos',
  },
  {
    rol: 'Veterinario',
    descripcion: 'Consultas, mascotas y vacunaciones',
  },
  {
    rol: 'Ventas',
    descripcion: 'Productos, stock y ventas',
  },
  {
    rol: 'Higiene',
    descripcion: 'Servicios de higiene',
  },
]

const modulosSistema = [
  'Clientes',
  'Mascotas',
  'Turnos',
  'Consultas',
  'Vacunaciones',
  'Higiene',
  'Productos',
  'Stock',
  'Ventas',
  'Reportes',
  'Usuarios',
]

function Configuracion() {
  const [configuracion, setConfiguracion] = useState(configuracionInicial)
  const [horarios, setHorarios] = useState(horariosIniciales)
  const [editar, setEditar] = useState(false)

  const cambiarConfiguracion = (e) => {
    const { name, value, type, checked } = e.target

    setConfiguracion({
      ...configuracion,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const cambiarHorario = (id, campo, valor) => {
    const nuevosHorarios = horarios.map((horario) => {
      if (horario.id === id) {
        return {
          ...horario,
          [campo]: valor,
        }
      }

      return horario
    })

    setHorarios(nuevosHorarios)
  }

  const guardarConfiguracion = () => {
    if (
      configuracion.nombreVeterinaria === '' ||
      configuracion.telefono === '' ||
      configuracion.direccion === ''
    ) {
      alert('Completá nombre, teléfono y dirección.')
      return
    }

    setEditar(false)
    alert('Configuración guardada correctamente.')
  }

  const cancelarEdicion = () => {
    setConfiguracion(configuracionInicial)
    setHorarios(horariosIniciales)
    setEditar(false)
  }

  const estilos = {
    pagina: {
      width: '100%',
      fontFamily: 'Poppins, sans-serif',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '18px',
      marginBottom: '20px',
    },
    titulo: {
      margin: 0,
      color: '#1d2944',
      fontSize: '30px',
      fontWeight: 800,
    },
    subtitulo: {
      margin: '6px 0 0',
      color: '#7c849d',
      fontSize: '17px',
    },
    botonEditar: {
      height: '42px',
      border: 'none',
      borderRadius: '8px',
      padding: '0 18px',
      backgroundColor: '#2f8c80',
      color: 'white',
      fontSize: '15px',
      fontWeight: 600,
      cursor: 'pointer',
    },
    botonCancelar: {
      height: '42px',
      border: 'none',
      borderRadius: '8px',
      padding: '0 18px',
      backgroundColor: '#b42318',
      color: 'white',
      fontSize: '15px',
      fontWeight: 600,
      cursor: 'pointer',
    },
    contenido: {
      display: 'grid',
      gridTemplateColumns: '1fr 390px',
      gap: '18px',
      alignItems: 'start',
    },
    columnaPrincipal: {
      display: 'flex',
      flexDirection: 'column',
      gap: '18px',
    },
    columnaLateral: {
      display: 'flex',
      flexDirection: 'column',
      gap: '18px',
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0px 8px 18px rgba(0, 0, 0, 0.12)',
    },
    cardTitulo: {
      margin: '0 0 18px',
      color: '#1d2944',
      fontSize: '22px',
      fontWeight: 800,
    },
    grilla: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
    },
    campo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '7px',
    },
    label: {
      color: '#1d2944',
      fontSize: '14px',
      fontWeight: 600,
    },
    input: {
      height: '40px',
      border: '1px solid #d7d7d7',
      borderRadius: '8px',
      padding: '0 12px',
      color: '#1d2944',
      fontSize: '14px',
      fontFamily: 'Poppins, sans-serif',
      backgroundColor: editar ? 'white' : '#f2f2f2',
    },
    horarioItem: {
      display: 'grid',
      gridTemplateColumns: '120px 1fr 20px 1fr 100px',
      alignItems: 'center',
      gap: '10px',
      padding: '12px',
      borderRadius: '10px',
      backgroundColor: '#f4efe7',
      marginBottom: '12px',
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: '#1d2944',
      fontSize: '14px',
      fontWeight: 500,
    },
    rolItem: {
      padding: '12px',
      borderRadius: '10px',
      backgroundColor: '#f4efe7',
      borderLeft: '4px solid #2f8c80',
      marginBottom: '10px',
    },
    modulo: {
      display: 'inline-block',
      backgroundColor: '#dcefe9',
      color: '#2f8c80',
      borderRadius: '8px',
      padding: '6px 10px',
      fontSize: '13px',
      fontWeight: 700,
      margin: '4px',
    },
    botonGuardar: {
      height: '44px',
      border: 'none',
      borderRadius: '8px',
      backgroundColor: '#2f8c80',
      color: 'white',
      fontSize: '15px',
      fontWeight: 600,
      cursor: 'pointer',
    },
  }

  return (
    <section style={estilos.pagina}>
      <div style={estilos.header}>
        <div>
          <h1 style={estilos.titulo}>Configuración</h1>
          <p style={estilos.subtitulo}>Opciones generales del sistema</p>
        </div>

        {!editar ? (
          <button
            type="button"
            style={estilos.botonEditar}
            onClick={() => setEditar(true)}
          >
            Editar Configuración
          </button>
        ) : (
          <button
            type="button"
            style={estilos.botonCancelar}
            onClick={cancelarEdicion}
          >
            Cancelar
          </button>
        )}
      </div>

      <div style={estilos.contenido}>
        <div style={estilos.columnaPrincipal}>
          <div style={estilos.card}>
            <h2 style={estilos.cardTitulo}>Datos de la veterinaria</h2>

            <div style={estilos.grilla}>
              <div style={estilos.campo}>
                <label style={estilos.label}>Nombre de la veterinaria</label>
                <input
                  style={estilos.input}
                  type="text"
                  name="nombreVeterinaria"
                  value={configuracion.nombreVeterinaria}
                  disabled={!editar}
                  onChange={cambiarConfiguracion}
                />
              </div>

              <div style={estilos.campo}>
                <label style={estilos.label}>Teléfono</label>
                <input
                  style={estilos.input}
                  type="text"
                  name="telefono"
                  value={configuracion.telefono}
                  disabled={!editar}
                  onChange={cambiarConfiguracion}
                />
              </div>

              <div style={estilos.campo}>
                <label style={estilos.label}>Email</label>
                <input
                  style={estilos.input}
                  type="email"
                  name="email"
                  value={configuracion.email}
                  disabled={!editar}
                  onChange={cambiarConfiguracion}
                />
              </div>

              <div style={estilos.campo}>
                <label style={estilos.label}>Dirección</label>
                <input
                  style={estilos.input}
                  type="text"
                  name="direccion"
                  value={configuracion.direccion}
                  disabled={!editar}
                  onChange={cambiarConfiguracion}
                />
              </div>

              <div style={estilos.campo}>
                <label style={estilos.label}>Ciudad</label>
                <input
                  style={estilos.input}
                  type="text"
                  name="ciudad"
                  value={configuracion.ciudad}
                  disabled={!editar}
                  onChange={cambiarConfiguracion}
                />
              </div>

              <div style={estilos.campo}>
                <label style={estilos.label}>Moneda</label>
                <select
                  style={estilos.input}
                  name="moneda"
                  value={configuracion.moneda}
                  disabled={!editar}
                  onChange={cambiarConfiguracion}
                >
                  <option value="ARS">ARS - Peso argentino</option>
                  <option value="USD">USD - Dólar</option>
                </select>
              </div>
            </div>
          </div>

          <div style={estilos.card}>
            <h2 style={estilos.cardTitulo}>Horarios de atención</h2>

            {horarios.map((horario) => (
              <div style={estilos.horarioItem} key={horario.id}>
                <strong>{horario.dia}</strong>

                <input
                  style={estilos.input}
                  type="time"
                  value={horario.apertura}
                  disabled={!editar || !horario.activo}
                  onChange={(e) =>
                    cambiarHorario(horario.id, 'apertura', e.target.value)
                  }
                />

                <span>a</span>

                <input
                  style={estilos.input}
                  type="time"
                  value={horario.cierre}
                  disabled={!editar || !horario.activo}
                  onChange={(e) =>
                    cambiarHorario(horario.id, 'cierre', e.target.value)
                  }
                />

                <label style={estilos.checkbox}>
                  <input
                    type="checkbox"
                    checked={horario.activo}
                    disabled={!editar}
                    onChange={(e) =>
                      cambiarHorario(horario.id, 'activo', e.target.checked)
                    }
                  />
                  Abierto
                </label>
              </div>
            ))}
          </div>
        </div>

        <aside style={estilos.columnaLateral}>
          <div style={estilos.card}>
            <h2 style={estilos.cardTitulo}>Sistema</h2>

            <div style={estilos.campo}>
              <label style={estilos.label}>Idioma</label>
              <select
                style={estilos.input}
                name="idioma"
                value={configuracion.idioma}
                disabled={!editar}
                onChange={cambiarConfiguracion}
              >
                <option value="Español">Español</option>
                <option value="Inglés">Inglés</option>
              </select>
            </div>

            <br />

            <div style={estilos.campo}>
              <label style={estilos.label}>Tema</label>
              <select
                style={estilos.input}
                name="tema"
                value={configuracion.tema}
                disabled={!editar}
                onChange={cambiarConfiguracion}
              >
                <option value="Claro">Claro</option>
                <option value="Oscuro">Oscuro</option>
              </select>
            </div>

            <br />

            <div style={estilos.campo}>
              <label style={estilos.label}>Backup</label>
              <select
                style={estilos.input}
                name="backup"
                value={configuracion.backup}
                disabled={!editar}
                onChange={cambiarConfiguracion}
              >
                <option value="Manual">Manual</option>
                <option value="Automático">Automático</option>
              </select>
            </div>

            <br />

            <label style={estilos.checkbox}>
              <input
                type="checkbox"
                name="estadoSistema"
                checked={configuracion.estadoSistema}
                disabled={!editar}
                onChange={cambiarConfiguracion}
              />
              Sistema activo
            </label>
          </div>

          <div style={estilos.card}>
            <h2 style={estilos.cardTitulo}>Roles del sistema</h2>

            {rolesSistema.map((rol) => (
              <div style={estilos.rolItem} key={rol.rol}>
                <strong>{rol.rol}</strong>
                <p style={{ margin: '4px 0 0', color: '#7c849d' }}>
                  {rol.descripcion}
                </p>
              </div>
            ))}
          </div>

          <div style={estilos.card}>
            <h2 style={estilos.cardTitulo}>Módulos activos</h2>

            {modulosSistema.map((modulo) => (
              <span style={estilos.modulo} key={modulo}>
                {modulo}
              </span>
            ))}
          </div>

          {editar && (
            <button
              type="button"
              style={estilos.botonGuardar}
              onClick={guardarConfiguracion}
            >
              Guardar Configuración
            </button>
          )}
        </aside>
      </div>
    </section>
  )
}

export default Configuracion