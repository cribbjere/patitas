import { useState } from 'react'
import {
  FaBell,
  FaBuilding,
  FaCircleCheck,
  FaDatabase,
  FaFloppyDisk,
  FaGear,
  FaPalette,
  FaShieldHalved,
  FaTriangleExclamation,
  FaXmark,
} from 'react-icons/fa6'

import './Configuracion.css'

const configuracionInicial = {
  nombreVeterinaria: 'Veterinaria Patitas',
  telefono: '3415551234',
  email: 'contacto@patitas.com',
  direccion: 'Av. Principal 1234',
  ciudad: 'Rosario',
  horario: 'Lunes a viernes de 08:00 a 20:00',
  colorPrincipal: '#2f8c80',
  avisosTurnos: true,
  avisosVacunas: true,
  avisosStock: true,
  avisosVencimientos: true,
  confirmarEliminaciones: true,
  cierreAutomaticoSesion: true,
  copiasAutomaticas: true,
  frecuenciaCopia: 'Diaria',
}

function Configuracion() {
  const [configuracion, setConfiguracion] = useState(configuracionInicial)
  const [seccionActiva, setSeccionActiva] = useState('general')
  const [mensaje, setMensaje] = useState(null)
  const [errores, setErrores] = useState({})
  const [mostrarRestaurar, setMostrarRestaurar] = useState(false)

  const manejarCambio = (e) => {
    const { name, value, type, checked } = e.target

    setConfiguracion((actual) => ({
      ...actual,
      [name]: type === 'checkbox' ? checked : value,
    }))

    if (errores[name]) {
      setErrores((actuales) => ({
        ...actuales,
        [name]: '',
      }))
    }

    setMensaje(null)
  }

  const validarGeneral = () => {
    const nuevosErrores = {}

    if (!configuracion.nombreVeterinaria.trim()) {
      nuevosErrores.nombreVeterinaria = 'Ingresá el nombre de la veterinaria.'
    }

    if (!configuracion.telefono.trim()) {
      nuevosErrores.telefono = 'Ingresá un teléfono.'
    } else if (!/^\d+$/.test(configuracion.telefono)) {
      nuevosErrores.telefono = 'El teléfono solo puede contener números.'
    }

    if (!configuracion.email.trim()) {
      nuevosErrores.email = 'Ingresá un correo electrónico.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(configuracion.email)) {
      nuevosErrores.email = 'Ingresá un correo electrónico válido.'
    }

    if (!configuracion.direccion.trim()) {
      nuevosErrores.direccion = 'Ingresá una dirección.'
    }

    setErrores(nuevosErrores)

    return Object.keys(nuevosErrores).length === 0
  }

  const guardarConfiguracion = (e) => {
    e.preventDefault()

    if (seccionActiva === 'general' && !validarGeneral()) {
      setMensaje({
        tipo: 'error',
        texto: 'Revisá los campos marcados antes de guardar.',
      })
      return
    }

    setMensaje({
      tipo: 'exito',
      texto: 'La configuración se guardó correctamente.',
    })
  }

  const restaurarConfiguracion = () => {
    setConfiguracion(configuracionInicial)
    setErrores({})
    setMostrarRestaurar(false)
    setMensaje({
      tipo: 'exito',
      texto: 'La configuración fue restaurada a sus valores iniciales.',
    })
  }

  const renderGeneral = () => (
    <div className="configuracion-panel">
      <div className="configuracion-panel-header">
        <FaBuilding aria-hidden="true" />
        <div>
          <h2>Datos de la veterinaria</h2>
          <p>Información general que identifica al establecimiento.</p>
        </div>
      </div>

      <div className="configuracion-form-grid">
        <div className="campo-configuracion campo-completo">
          <label htmlFor="nombreVeterinaria">Nombre de la veterinaria</label>
          <input
            id="nombreVeterinaria"
            type="text"
            name="nombreVeterinaria"
            value={configuracion.nombreVeterinaria}
            onChange={manejarCambio}
            className={errores.nombreVeterinaria ? 'campo-error' : ''}
          />
          {errores.nombreVeterinaria && (
            <span className="mensaje-campo">
              {errores.nombreVeterinaria}
            </span>
          )}
        </div>

        <div className="campo-configuracion">
          <label htmlFor="telefono">Teléfono</label>
          <input
            id="telefono"
            type="text"
            name="telefono"
            value={configuracion.telefono}
            onChange={manejarCambio}
            inputMode="numeric"
            className={errores.telefono ? 'campo-error' : ''}
          />
          {errores.telefono && (
            <span className="mensaje-campo">{errores.telefono}</span>
          )}
        </div>

        <div className="campo-configuracion">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            name="email"
            value={configuracion.email}
            onChange={manejarCambio}
            className={errores.email ? 'campo-error' : ''}
          />
          {errores.email && (
            <span className="mensaje-campo">{errores.email}</span>
          )}
        </div>

        <div className="campo-configuracion">
          <label htmlFor="direccion">Dirección</label>
          <input
            id="direccion"
            type="text"
            name="direccion"
            value={configuracion.direccion}
            onChange={manejarCambio}
            className={errores.direccion ? 'campo-error' : ''}
          />
          {errores.direccion && (
            <span className="mensaje-campo">{errores.direccion}</span>
          )}
        </div>

        <div className="campo-configuracion">
          <label htmlFor="ciudad">Ciudad</label>
          <input
            id="ciudad"
            type="text"
            name="ciudad"
            value={configuracion.ciudad}
            onChange={manejarCambio}
          />
        </div>

        <div className="campo-configuracion campo-completo">
          <label htmlFor="horario">Horario de atención</label>
          <input
            id="horario"
            type="text"
            name="horario"
            value={configuracion.horario}
            onChange={manejarCambio}
          />
        </div>
      </div>
    </div>
  )

  const renderNotificaciones = () => (
    <div className="configuracion-panel">
      <div className="configuracion-panel-header">
        <FaBell aria-hidden="true" />
        <div>
          <h2>Notificaciones</h2>
          <p>Elegí qué alertas querés mostrar dentro del sistema.</p>
        </div>
      </div>

      <div className="configuracion-opciones">
        <label className="configuracion-switch-row">
          <div>
            <strong>Recordatorios de turnos</strong>
            <span>Mostrar avisos de turnos próximos, cancelados o no asistidos.</span>
          </div>
          <input
            type="checkbox"
            name="avisosTurnos"
            checked={configuracion.avisosTurnos}
            onChange={manejarCambio}
          />
          <span className="switch-control" />
        </label>

        <label className="configuracion-switch-row">
          <div>
            <strong>Alertas de vacunación</strong>
            <span>Notificar cuando una mascota tenga una vacuna próxima.</span>
          </div>
          <input
            type="checkbox"
            name="avisosVacunas"
            checked={configuracion.avisosVacunas}
            onChange={manejarCambio}
          />
          <span className="switch-control" />
        </label>

        <label className="configuracion-switch-row">
          <div>
            <strong>Alertas de stock</strong>
            <span>Informar cuando un producto alcance el stock mínimo.</span>
          </div>
          <input
            type="checkbox"
            name="avisosStock"
            checked={configuracion.avisosStock}
            onChange={manejarCambio}
          />
          <span className="switch-control" />
        </label>

        <label className="configuracion-switch-row">
          <div>
            <strong>Alertas de vencimiento</strong>
            <span>Mostrar productos y lotes próximos a vencer.</span>
          </div>
          <input
            type="checkbox"
            name="avisosVencimientos"
            checked={configuracion.avisosVencimientos}
            onChange={manejarCambio}
          />
          <span className="switch-control" />
        </label>
      </div>
    </div>
  )

  const renderSeguridad = () => (
    <div className="configuracion-panel">
      <div className="configuracion-panel-header">
        <FaShieldHalved aria-hidden="true" />
        <div>
          <h2>Seguridad</h2>
          <p>Preferencias para proteger el acceso y las acciones sensibles.</p>
        </div>
      </div>

      <div className="configuracion-opciones">
        <label className="configuracion-switch-row">
          <div>
            <strong>Confirmar eliminaciones</strong>
            <span>Solicitar confirmación antes de borrar información.</span>
          </div>
          <input
            type="checkbox"
            name="confirmarEliminaciones"
            checked={configuracion.confirmarEliminaciones}
            onChange={manejarCambio}
          />
          <span className="switch-control" />
        </label>

        <label className="configuracion-switch-row">
          <div>
            <strong>Cierre automático de sesión</strong>
            <span>Cerrar la sesión cuando exista un período prolongado de inactividad.</span>
          </div>
          <input
            type="checkbox"
            name="cierreAutomaticoSesion"
            checked={configuracion.cierreAutomaticoSesion}
            onChange={manejarCambio}
          />
          <span className="switch-control" />
        </label>
      </div>

      <div className="configuracion-aviso">
        <FaTriangleExclamation aria-hidden="true" />
        <p>
          Los cambios de contraseñas, permisos y accesos individuales se
          administran desde el módulo <strong>Usuarios</strong>.
        </p>
      </div>
    </div>
  )

  const renderApariencia = () => (
    <div className="configuracion-panel">
      <div className="configuracion-panel-header">
        <FaPalette aria-hidden="true" />
        <div>
          <h2>Apariencia</h2>
          <p>Personalizá el color principal de la interfaz.</p>
        </div>
      </div>

      <div className="configuracion-color">
        <div>
          <label htmlFor="colorPrincipal">Color principal</label>
          <span>Se aplicará a botones, íconos y elementos destacados.</span>
        </div>

        <div className="selector-color">
          <input
            id="colorPrincipal"
            type="color"
            name="colorPrincipal"
            value={configuracion.colorPrincipal}
            onChange={manejarCambio}
          />
          <strong>{configuracion.colorPrincipal.toUpperCase()}</strong>
        </div>
      </div>

      <div className="vista-previa">
        <span>Vista previa</span>
        <button
          type="button"
          style={{ backgroundColor: configuracion.colorPrincipal }}
        >
          Botón principal
        </button>
        <div
          className="vista-previa-icono"
          style={{
            color: configuracion.colorPrincipal,
            backgroundColor: `${configuracion.colorPrincipal}1F`,
          }}
        >
          <FaGear />
        </div>
      </div>
    </div>
  )

  const renderRespaldo = () => (
    <div className="configuracion-panel">
      <div className="configuracion-panel-header">
        <FaDatabase aria-hidden="true" />
        <div>
          <h2>Copias de seguridad</h2>
          <p>Configuración de respaldo para la información del sistema.</p>
        </div>
      </div>

      <div className="configuracion-opciones">
        <label className="configuracion-switch-row">
          <div>
            <strong>Copias automáticas</strong>
            <span>Generar respaldos periódicos de la base de datos.</span>
          </div>
          <input
            type="checkbox"
            name="copiasAutomaticas"
            checked={configuracion.copiasAutomaticas}
            onChange={manejarCambio}
          />
          <span className="switch-control" />
        </label>
      </div>

      <div className="campo-configuracion frecuencia-copia">
        <label htmlFor="frecuenciaCopia">Frecuencia</label>
        <select
          id="frecuenciaCopia"
          name="frecuenciaCopia"
          value={configuracion.frecuenciaCopia}
          onChange={manejarCambio}
          disabled={!configuracion.copiasAutomaticas}
        >
          <option value="Diaria">Diaria</option>
          <option value="Semanal">Semanal</option>
          <option value="Mensual">Mensual</option>
        </select>
      </div>

      <div className="configuracion-respaldo-info">
        <strong>Última copia</strong>
        <span>Función disponible al integrar el sistema con el backend.</span>
      </div>
    </div>
  )

  const contenidoPorSeccion = {
    general: renderGeneral(),
    notificaciones: renderNotificaciones(),
    seguridad: renderSeguridad(),
    apariencia: renderApariencia(),
    respaldo: renderRespaldo(),
  }

  return (
    <section className="configuracion-page">
      <div className="configuracion-header">
        <div>
          <h1>Configuración</h1>
          <p>Administración general y preferencias del sistema</p>
        </div>
      </div>

      {mensaje && (
        <div className={`configuracion-mensaje ${mensaje.tipo}`} role="status">
          <div>
            {mensaje.tipo === 'exito' ? (
              <FaCircleCheck aria-hidden="true" />
            ) : (
              <FaTriangleExclamation aria-hidden="true" />
            )}
            <span>{mensaje.texto}</span>
          </div>

          <button
            type="button"
            onClick={() => setMensaje(null)}
            aria-label="Cerrar mensaje"
          >
            <FaXmark />
          </button>
        </div>
      )}

      <form className="configuracion-layout" onSubmit={guardarConfiguracion}>
        <aside className="configuracion-menu">
          <button
            type="button"
            className={seccionActiva === 'general' ? 'activo' : ''}
            onClick={() => setSeccionActiva('general')}
          >
            <FaBuilding />
            General
          </button>

          <button
            type="button"
            className={seccionActiva === 'notificaciones' ? 'activo' : ''}
            onClick={() => setSeccionActiva('notificaciones')}
          >
            <FaBell />
            Notificaciones
          </button>

          <button
            type="button"
            className={seccionActiva === 'seguridad' ? 'activo' : ''}
            onClick={() => setSeccionActiva('seguridad')}
          >
            <FaShieldHalved />
            Seguridad
          </button>

          <button
            type="button"
            className={seccionActiva === 'apariencia' ? 'activo' : ''}
            onClick={() => setSeccionActiva('apariencia')}
          >
            <FaPalette />
            Apariencia
          </button>

          <button
            type="button"
            className={seccionActiva === 'respaldo' ? 'activo' : ''}
            onClick={() => setSeccionActiva('respaldo')}
          >
            <FaDatabase />
            Copias de seguridad
          </button>
        </aside>

        <div className="configuracion-contenido">
          {contenidoPorSeccion[seccionActiva]}

          <div className="configuracion-acciones">
            <button
              type="button"
              className="btn-restaurar"
              onClick={() => setMostrarRestaurar(true)}
            >
              Restaurar valores
            </button>

            <button type="submit" className="btn-guardar-configuracion">
              <FaFloppyDisk />
              Guardar cambios
            </button>
          </div>
        </div>
      </form>

      {mostrarRestaurar && (
        <div className="configuracion-modal-overlay">
          <div
            className="configuracion-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-restaurar"
          >
            <div className="configuracion-modal-icono">
              <FaTriangleExclamation />
            </div>

            <h3 id="titulo-restaurar">Restaurar configuración</h3>
            <p>
              Se reemplazarán todos los cambios realizados por los valores
              iniciales del sistema.
            </p>

            <div className="configuracion-modal-acciones">
              <button
                type="button"
                className="btn-modal-cancelar"
                onClick={() => setMostrarRestaurar(false)}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="btn-modal-restaurar"
                onClick={restaurarConfiguracion}
              >
                Restaurar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Configuracion