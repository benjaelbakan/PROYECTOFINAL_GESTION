import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const rol = localStorage.getItem("rol");

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Sistema de Gestión</h1>
      <div className="list-group">

        {(rol === "admin" || rol === "gerente") && (
          <button className="list-group-item list-group-item-action"
            onClick={() => navigate("/activos")}>
            Gestión de Activos
          </button>
        )}

        {(rol === "admin" || rol === "gerente" || rol === "mecanico") && (
          <button className="list-group-item list-group-item-action"
            onClick={() => navigate("/ordenes_trabajo")}>
            Gestión de Ordenes de Trabajo
          </button>
        )}

        {(rol === "admin" || rol === "mecanico") && (
          <button className="list-group-item list-group-item-action"
            onClick={() => navigate("/escaner")}>
            📲 Escáner QR (Móvil)
          </button>
        )}

        {(rol === "admin" || rol === "gerente") && (
          <>
            <button className="list-group-item list-group-item-action"
              onClick={() => navigate("/tareas")}>
              Gestión de Tareas
            </button>

            <button className="list-group-item list-group-item-action"
              onClick={() => navigate("/planes")}>
              Gestión de Planes
            </button>

            <button className="list-group-item list-group-item-action"
              onClick={() => navigate("/gerente-dashboard")}>
              📊 Dashboard Gerente
            </button>
          </>
        )}

      </div>
    </div>
  );
}
