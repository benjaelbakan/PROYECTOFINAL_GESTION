import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Sistema de Gestión</h1>
      <div className="list-group">
        <button
          className="list-group-item list-group-item-action"
          onClick={() => navigate("/activos")}
        >
          Gestión de Activos
        </button>
        <button
          className="list-group-item list-group-item-action"
          onClick={() => navigate("/ordenes_trabajo")}
        >
          Gestión de Ordenes de Trabajo
        </button>
        <button
          className="list-group-item list-group-item-action"
          onClick={() => navigate("/usuarios")}
        >
          Gestión de Usuarios
        </button>
        {/* Agrega más botones según tus páginas */}
      </div>
    </div>
  );
}
