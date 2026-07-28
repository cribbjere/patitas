import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import './Login.css'
import logoPatitas from '../assets/logos/logo-patitas.png'
import huellaAzul from '../assets/icons/huella-azul.png'
import { login } from '../services/authService'

function Login() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!username.trim() || !password.trim()) {
      setError('Completá el usuario y la contraseña')
      return
    }

    try {
      setCargando(true)
      setError('')

      await login(username, password)

      navigate('/dashboard')
    } catch (error) {
      setError(error.message)
    } finally {
      setCargando(false)
    }
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
          <p className="login-subtitle">Ingresá tus datos</p>

          <form onSubmit={handleSubmit}>
            <label>Usuario</label>

            <div className="input-group-login">
              <span className="input-icon">♡</span>

              <input
                type="text"
                placeholder="Ingrese su usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={cargando}
                autoComplete="username"
              />
            </div>

            <label>Contraseña</label>

            <div className="input-group-login">
              <span className="input-icon">▣</span>

              <input
                type="password"
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={cargando}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p
                style={{
                  color: '#c62828',
                  marginTop: '10px',
                  marginBottom: '10px',
                  textAlign: 'center',
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={cargando}
            >
              {cargando ? 'Ingresando...' : 'Ingresar'}
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