import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarActivos, eliminarActivo } from "../../services/RF01_activos.service.js";
import ActivosTable from "../../components/RF01_ActivosTable.jsx";


function Activos() {
  const [activos, setActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const cargarActivos = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await listarActivos();
      setActivos(data);
    } catch (err) {
      console.error("Error al cargar activos:", err);
      setErrorMsg("No se pudieron cargar los activos.");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    const confirmar = window.confirm("¿Seguro que quieres eliminar este activo?");
    if (!confirmar) return;

    try {
      await eliminarActivo(id);
      setActivos((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Error al eliminar activo:", err);
      alert("No se pudo eliminar el activo.");
    }
  };

  useEffect(() => {
    cargarActivos();
  }, []);

  return (
    <div className="row justify-content-center">
      <div className="col-12">
        <div className="card bg-dark border-secondary shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="card-title mb-0">Activos registrados</h5>
              <button
                className="btn btn-success btn-sm"
                onClick={() => navigate("/activos/nuevo")}
              >
                + Nuevo Activo
              </button>
            </div>

            {errorMsg && <div className="alert alert-danger py-2">{errorMsg}</div>}
            {loading ? (
              <p className="text-muted mb-0">Cargando activos...</p>
            ) : (
              <ActivosTable activos={activos} onEliminar={handleEliminar} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Activos;
