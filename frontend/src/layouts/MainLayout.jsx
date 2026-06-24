import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import './MainLayout.css'

function MainLayout() {
  return (
    <div className="main-layout">
      <Sidebar />

      <div className="main-area">
        <Topbar />

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout