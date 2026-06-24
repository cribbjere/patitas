import { FaBars, FaBell, FaUserDoctor } from 'react-icons/fa6'
import './Topbar.css'

function Topbar() {
  return (
    <header className="topbar">
      <button className="menu-button" type="button">
        <FaBars />
      </button>

      <div className="topbar-actions">
        <FaBell className="topbar-icon" />

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