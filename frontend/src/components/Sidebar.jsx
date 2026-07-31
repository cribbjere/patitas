import { NavLink } from 'react-router-dom'
import {
  FaHouse,
  FaUsers,
  FaPaw,
  FaCalendarDays,
  FaStethoscope,
  FaSyringe,
  FaScissors,
  FaBoxOpen,
  FaBoxesStacked,
  FaCashRegister,
  FaChartSimple,
  FaUserGear,
  FaGear,
} from 'react-icons/fa6'

import huellaAzul from '../assets/icons/huella-azul.png'
import { tienePermiso } from '../utils/permisos'
import './Sidebar.css'

function Sidebar() {
  return (
    <aside className="sidebar">
      <img src={huellaAzul} alt="" className="sidebar-paw paw-a" />
      <img src={huellaAzul} alt="" className="sidebar-paw paw-b" />
      <img src={huellaAzul} alt="" className="sidebar-paw paw-c" />
      <img src={huellaAzul} alt="" className="sidebar-paw paw-d" />

      <nav className="sidebar-menu">
        {tienePermiso('dashboard') && (
          <NavLink to="/dashboard" className="sidebar-link">
            <FaHouse className="sidebar-icon" />
            <span>Inicio</span>
          </NavLink>
        )}

        {tienePermiso('clientes') && (
          <NavLink to="/clientes" className="sidebar-link">
            <FaUsers className="sidebar-icon" />
            <span>Clientes</span>
          </NavLink>
        )}

        {tienePermiso('mascotas') && (
          <NavLink to="/mascotas" className="sidebar-link">
            <FaPaw className="sidebar-icon" />
            <span>Mascotas</span>
          </NavLink>
        )}

        {tienePermiso('turnos') && (
          <NavLink to="/turnos" className="sidebar-link">
            <FaCalendarDays className="sidebar-icon" />
            <span>Turnos</span>
          </NavLink>
        )}

        {tienePermiso('consultas') && (
          <NavLink to="/consultas" className="sidebar-link">
            <FaStethoscope className="sidebar-icon" />
            <span>Consultas</span>
          </NavLink>
        )}

        {tienePermiso('vacunaciones') && (
          <NavLink to="/vacunaciones" className="sidebar-link">
            <FaSyringe className="sidebar-icon" />
            <span>Vacunaciones</span>
          </NavLink>
        )}
        {tienePermiso('cirugias') && (
  <NavLink to="/cirugias" className="sidebar-link">
    <FaStethoscope className="sidebar-icon" />
    <span>Cirugías</span>
  </NavLink>
)}

        {tienePermiso('higiene') && (
          <NavLink to="/higiene" className="sidebar-link">
            <FaScissors className="sidebar-icon" />
            <span>Higiene</span>
          </NavLink>
        )}

        {tienePermiso('productos') && (
          <NavLink to="/productos" className="sidebar-link">
            <FaBoxOpen className="sidebar-icon" />
            <span>Productos</span>
          </NavLink>
        )}

        {tienePermiso('stock') && (
          <NavLink to="/stock" className="sidebar-link">
            <FaBoxesStacked className="sidebar-icon" />
            <span>Stock</span>
          </NavLink>
        )}

        {tienePermiso('ventas') && (
          <NavLink to="/ventas" className="sidebar-link">
            <FaCashRegister className="sidebar-icon" />
            <span>Ventas</span>
          </NavLink>
        )}

        {tienePermiso('reportes') && (
          <NavLink to="/reportes" className="sidebar-link">
            <FaChartSimple className="sidebar-icon" />
            <span>Reportes</span>
          </NavLink>
        )}

        {tienePermiso('usuarios') && (
          <NavLink to="/usuarios" className="sidebar-link">
            <FaUserGear className="sidebar-icon" />
            <span>Usuarios</span>
          </NavLink>
        )}

        {tienePermiso('configuracion') && (
          <NavLink to="/configuracion" className="sidebar-link">
            <FaGear className="sidebar-icon" />
            <span>Configuración</span>
          </NavLink>
        )}
      </nav>
    </aside>
  )
}

export default Sidebar