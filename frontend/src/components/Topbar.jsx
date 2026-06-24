import { useEffect, useState } from 'react'
import { FaBars, FaBell, FaUserDoctor, FaPhone, FaWhatsapp } from 'react-icons/fa6'
import {
  obtenerAlertasSistema,
  marcarAlertaComoLeida,
  limpiarAlertasSistema,
} from '../utils/alertasSistema'
import './Topbar.css'

function Topbar() {
  const [alertas, setAlertas] = useState([])
  const [mostrarAlertas, setMostrarAlertas] = useState(false)

  const cargarAlertas = () => {
    setAlertas(obtenerAlertasSistema())
  }

  useEffect(() => {
    cargarAlertas()

    window.addEventListener('alertasActualizadas', cargarAlertas)
    window.addEventListener('storage', cargarAlertas)

    return () => {
      window.removeEventListener('alertasActualizadas', cargarAlertas)
      window.removeEventListener('storage', cargarAlertas)
    }
  }, [])

  const cantidadNoLeidas = alertas.filter((alerta) => !alerta.leida).length

  const armarTelefono = (telefono) => {
    if (!telefono) return ''

    return telefono.replace(/\D/g, '')
  }

  const llamarCliente = (telefono) => {
    const telefonoLimpio = armarTelefono(telefono)

    if (!telefonoLimpio) {
      alert('El cliente no tiene teléfono cargado.')
      return
    }

    window.location.href = `tel:${telefonoLimpio}`
  }

  const enviarWhatsapp = (alerta) => {
    const telefonoLimpio = armarTelefono(alerta.telefono)

    if (!telefonoLimpio) {
      alert('El cliente no tiene teléfono cargado.')
      return
    }

    const mensaje = `Hola ${alerta.cliente}, te contactamos de Veterinaria Patitas por ${alerta.mascota}. ${alerta.mensaje}`

    window.open(
      `https://wa.me/54${telefonoLimpio}?text=${encodeURIComponent(mensaje)}`,
      '_blank'
    )
  }

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <header className="topbar">
      <button className="menu-button" type="button">
        <FaBars />
      </button>

      <div className="topbar-actions">
        <div className="notificaciones-wrapper">
          <button
            type="button"
            className="boton-campanita"
            onClick={() => setMostrarAlertas(!mostrarAlertas)}
          >
            <FaBell />

            {cantidadNoLeidas > 0 && (
              <span className="contador-alertas">{cantidadNoLeidas}</span>
            )}
          </button>

          {mostrarAlertas && (
            <div className="panel-alertas">
              <div className="panel-alertas-header">
                <div>
                  <strong>Alertas</strong>
                  <small>{alertas.length} alertas registradas</small>
                </div>

                {alertas.length > 0 && (
                  <button
                    type="button"
                    className="btn-limpiar-alertas"
                    onClick={limpiarAlertasSistema}
                  >
                    Limpiar
                  </button>
                )}
              </div>

              {alertas.length === 0 ? (
                <div className="sin-alertas">
                  No hay alertas pendientes.
                </div>
              ) : (
                <div className="lista-alertas">
                  {alertas.map((alerta) => (
                    <div
                      className={
                        alerta.leida
                          ? 'item-alerta leida'
                          : 'item-alerta no-leida'
                      }
                      key={alerta.id}
                      onClick={() => marcarAlertaComoLeida(alerta.id)}
                    >
                      <div className="item-alerta-header">
                        <strong>{alerta.titulo}</strong>
                        <span>{formatearFecha(alerta.fecha)}</span>
                      </div>

                      <p>{alerta.mensaje}</p>

                      <small>
                        Cliente: {alerta.cliente} | Mascota: {alerta.mascota}
                      </small>

                      <div className="item-alerta-acciones">
                        <button
                          type="button"
                          className="btn-alerta-topbar llamar"
                          onClick={(e) => {
                            e.stopPropagation()
                            llamarCliente(alerta.telefono)
                          }}
                        >
                          <FaPhone />
                          Llamar
                        </button>

                        <button
                          type="button"
                          className="btn-alerta-topbar whatsapp"
                          onClick={(e) => {
                            e.stopPropagation()
                            enviarWhatsapp(alerta)
                          }}
                        >
                          <FaWhatsapp />
                          WhatsApp
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="admin-info">
          <strong>Administrador</strong>
          <small>Administrador</small>
        </div>

        <div className="admin-avatar">
          <FaUserDoctor />
        </div>
      </div>
    </header>
  )
}

export default Topbar