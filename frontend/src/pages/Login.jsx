import { useNavigate } from 'react-router-dom'
import './Login.css'
import logoPatitas from '../assets/logos/logo-patitas.png'
import huellaAzul from '../assets/icons/huella-azul.png'

function Login() {
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/dashboard')
  }

  return (
    <div className="login-page">
      <div className="login-left">

        <img src={huellaAzul} alt="" className="paw paw-top-left" />
        <img src={huellaAzul} alt="" className="paw paw-top-right" />
        <img src={huellaAzul} alt="" className="paw paw-bottom-left" />
        <img src={huellaAzul} alt="" className="paw paw-bottom-right" />

        <div className="login-left-content">
          <img
            src={logoPatitas}
            alt="Veterinaria Patitas"
            className="login-logo"
          />

          <h1>Sistema de Gestión Veterinaria</h1>
          <p>Bienvenido, inicia sesión para continuar</p>
        </div>

      </div>

      <div className="login-right">
        <div className="login-card">

          <h2>Iniciar Sesión</h2>
          <p className="login-subtitle">Ingresá tus credenciales</p>

          <form onSubmit={handleSubmit}>
            <label>Usuario</label>

            <div className="input-group-login">
              <span className="input-icon">♡</span>
              <input
                type="text"
                placeholder="Ingresá tu usuario"
              />
            </div>

            <label>Contraseña</label>

            <div className="input-group-login">
              <span className="input-icon">▣</span>
              <input
                type="password"
                placeholder="Ingresá tu contraseña"
              />
            </div>

            <button type="submit">
              Ingresar
            </button>

            <a href="#">
              ¿Olvidaste tu contraseña?
            </a>
          </form>

        </div>
      </div>
    </div>
  )
}

export default Login