import './PagePlaceholder.css'

function PagePlaceholder({ titulo, descripcion }) {
  return (
    <section className="page-placeholder">
      <div className="page-placeholder-header">
        <h1>{titulo}</h1>
        <p>{descripcion}</p>
      </div>

      <div className="page-placeholder-card">
        <h2>{titulo}</h2>
        <p>
          Esta sección ya está conectada a la navegación del sistema.
          Luego se agregarán formularios, tablas y conexión con la base de datos.
        </p>
      </div>
    </section>
  )
}

export default PagePlaceholder