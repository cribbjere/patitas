import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { cambiarPassword } from '../services/authService'
import './CambiarContrasena.css'


function CambiarContrasena() {
  const navigate = useNavigate()

  const [formulario, setFormulario] = useState({
    passwordActual: '',
    passwordNueva: '',
    passwordConfirmacion: '',
  })

  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [guardando, setGuardando] = useState(false)

  const manejarCambio = (evento) => {
    const { name, value } = evento.target

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }))

    setError('')
    setMensaje('')
  }

  const manejarSubmit = async (evento) => {
    evento.preventDefault()

    setError('')
    setMensaje('')

    if (
      !formulario.passwordActual
      || !formulario.passwordNueva
      || !formulario.passwordConfirmacion
    ) {
      setError('Completá todos los campos.')
      return
    }

    if (formulario.passwordNueva.length < 8) {
      setError(
        'La contraseña nueva debe tener al menos 8 caracteres.',
      )
      return
    }

    if (
      formulario.passwordNueva
      !== formulario.passwordConfirmacion
    ) {
      setError('Las contraseñas nuevas no coinciden.')
      return
    }

    if (
      formulario.passwordActual
      === formulario.passwordNueva
    ) {
      setError(
        'La contraseña nueva debe ser diferente de la actual.',
      )
      return
    }

    try {
      setGuardando(true)

      const respuesta = await cambiarPassword({
        passwordActual: formulario.passwordActual,
        passwordNueva: formulario.passwordNueva,
        passwordConfirmacion:
          formulario.passwordConfirmacion,
      })

      setMensaje(
        respuesta.detail
        || 'La contraseña fue cambiada correctamente.',
      )

      setFormulario({
        passwordActual: '',
        passwordNueva: '',
        passwordConfirmacion: '',
      })

      window.setTimeout(() => {
        navigate('/dashboard', {
          replace: true,
        })
      }, 1200)
    } catch (errorCambio) {
      setError(
        errorCambio.message
        || 'No se pudo cambiar la contraseña.',
      )
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="cambiar-password-pagina">
      <div className="cambiar-password-tarjeta">
        <div className="cambiar-password-encabezado">
          <div className="cambiar-password-icono">
            🔒
          </div>

          <div>
            <h1>Cambiar contraseña</h1>

            <p>
              Ingresá tu contraseña actual y elegí una
              nueva contraseña segura.
            </p>
          </div>
        </div>

        <form
          className="cambiar-password-formulario"
          onSubmit={manejarSubmit}
        >
          <div className="cambiar-password-campo">
            <label htmlFor="passwordActual">
              Contraseña actual
            </label>

            <input
              id="passwordActual"
              name="passwordActual"
              type="password"
              value={formulario.passwordActual}
              onChange={manejarCambio}
              autoComplete="current-password"
              disabled={guardando}
              placeholder="Ingresá tu contraseña actual"
            />
          </div>

          <div className="cambiar-password-campo">
            <label htmlFor="passwordNueva">
              Nueva contraseña
            </label>

            <input
              id="passwordNueva"
              name="passwordNueva"
              type="password"
              value={formulario.passwordNueva}
              onChange={manejarCambio}
              autoComplete="new-password"
              disabled={guardando}
              placeholder="Mínimo 8 caracteres"
            />

            <small>
              Debe tener al menos 8 caracteres y ser
              diferente de la contraseña actual.
            </small>
          </div>

          <div className="cambiar-password-campo">
            <label htmlFor="passwordConfirmacion">
              Confirmar nueva contraseña
            </label>

            <input
              id="passwordConfirmacion"
              name="passwordConfirmacion"
              type="password"
              value={formulario.passwordConfirmacion}
              onChange={manejarCambio}
              autoComplete="new-password"
              disabled={guardando}
              placeholder="Repetí la nueva contraseña"
            />
          </div>

          {error && (
            <div
              className="cambiar-password-alerta cambiar-password-error"
              role="alert"
            >
              {error}
            </div>
          )}

          {mensaje && (
            <div
              className="cambiar-password-alerta cambiar-password-exito"
              role="status"
            >
              {mensaje}
            </div>
          )}

          <button
            className="cambiar-password-boton"
            type="submit"
            disabled={guardando}
          >
            {guardando
              ? 'Guardando...'
              : 'Cambiar contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CambiarContrasena