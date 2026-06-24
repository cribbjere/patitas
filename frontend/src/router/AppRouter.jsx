import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Clientes from '../pages/Clientes'
import Mascotas from '../pages/Mascotas'
import Turnos from '../pages/Turnos'
import Consultas from '../pages/Consultas'
import Vacunaciones from '../pages/Vacunaciones'
import Higiene from '../pages/Higiene'
import Productos from '../pages/Productos'
import Stock from '../pages/Stock'
import Ventas from '../pages/Ventas'
import Reportes from '../pages/Reportes'
import Usuarios from '../pages/Usuarios'
import Configuracion from '../pages/Configuracion'

import MainLayout from '../layouts/MainLayout'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/mascotas" element={<Mascotas />} />
          <Route path="/turnos" element={<Turnos />} />
          <Route path="/consultas" element={<Consultas />} />
          <Route path="/vacunaciones" element={<Vacunaciones />} />
          <Route path="/higiene" element={<Higiene />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/configuracion" element={<Configuracion />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter