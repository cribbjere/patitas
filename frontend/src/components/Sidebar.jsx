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
import './Sidebar.css'

function Sidebar() {
  return (
    <aside className="sidebar">
      <img src={huellaAzul} alt="" className="sidebar-paw paw-a" />
      <img src={huellaAzul} alt="" className="sidebar-paw paw-b" />
      <img src={huellaAzul} alt="" className="sidebar-paw paw-c" />
      <img src={huellaAzul} alt="" className="sidebar-paw paw-d" />

      <nav className="sidebar-menu">
        <NavLink to="/dashboard" className="sidebar-link">
          <FaHouse className="sidebar-icon" />
          <span>Inicio</span>
        </NavLink>

        <NavLink to="/clientes" className="sidebar-link">
          <FaUsers className="sidebar-icon" />
          <span>Clientes</span>
        </NavLink>

        <NavLink to="/mascotas" className="sidebar-link">
          <FaPaw className="sidebar-icon" />
          <span>Mascotas</span>
        </NavLink>

        <NavLink to="/turnos" className="sidebar-link">
          <FaCalendarDays className="sidebar-icon" />
          <span>Turnos</span>
        </NavLink>

        <NavLink to="/consultas" className="sidebar-link">
          <FaStethoscope className="sidebar-icon" />
          <span>Consultas</span>
        </NavLink>

        <NavLink to="/vacunaciones" className="sidebar-link">
          <FaSyringe className="sidebar-icon" />
          <span>Vacunaciones</span>
        </NavLink>

        <NavLink to="/higiene" className="sidebar-link">
          <FaScissors className="sidebar-icon" />
          <span>Higiene</span>
        </NavLink>

        <NavLink to="/productos" className="sidebar-link">
          <FaBoxOpen className="sidebar-icon" />
          <span>Productos</span>
        </NavLink>

        <NavLink to="/stock" className="sidebar-link">
          <FaBoxesStacked className="sidebar-icon" />
          <span>Stock</span>
        </NavLink>

        <NavLink to="/ventas" className="sidebar-link">
          <FaCashRegister className="sidebar-icon" />
          <span>Ventas</span>
        </NavLink>

        <NavLink to="/reportes" className="sidebar-link">
          <FaChartSimple className="sidebar-icon" />
          <span>Reportes</span>
        </NavLink>

        <NavLink to="/usuarios" className="sidebar-link">
          <FaUserGear className="sidebar-icon" />
          <span>Usuarios</span>
        </NavLink>

        <NavLink to="/configuracion" className="sidebar-link">
          <FaGear className="sidebar-icon" />
          <span>Configuración</span>
        </NavLink>
      </nav>
    </aside>
  )
}

export default Sidebar