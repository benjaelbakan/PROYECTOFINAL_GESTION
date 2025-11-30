import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div className="container">
        <Link className="navbar-brand" to="/">Sistema de Gestión</Link>
        <div>
          <Link className="btn btn-outline-light me-2" to="/activos">Activos</Link>
          <Link className="btn btn-outline-light me-2" to="/tareas">Tareas</Link>
          <Link className="btn btn-outline-light" to="/usuarios">Usuarios</Link>
        </div>
      </div>
    </nav>
  );
}
