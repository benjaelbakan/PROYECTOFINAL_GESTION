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

  const handleEditar = (activo) => {
    navigate(`/activos/editar/${activo.id}`, { state: { activo } });
  };

  useEffect(() => {
    cargarActivos();
  }, []);

  return (
    <div className="container-fluid p-4">
      
      {/* --- BOTÓN VOLVER (A HOME) --- */}
      <div className="mb-3">
        <button 
            className="btn btn-outline-secondary d-inline-flex align-items-center gap-2 text-white-50 hover-white"
            onClick={() => navigate('/home')} 
        >
            <i className="bi bi-arrow-left"></i>
            Volver al Inicio
        </button>
      </div>

      {/* --- Encabezado --- */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="text-white fw-bold mb-0 d-flex align-items-center">
            <i className="bi bi-box-seam-fill me-2 text-primary bg-primary bg-opacity-10 p-2 rounded-3"></i>
            Activos Registrados
          </h2>
          <p className="text-secondary mb-0 mt-1 ms-1 small">
            Vista general del inventario de flota y maquinaria.
          </p>
        </div>

        {/* Botón Nuevo Activo */}
        <button
          className="btn btn-success btn-lg bg-gradient d-flex align-items-center gap-2 shadow fw-semibold px-4"
          onClick={() => navigate("/activos/nuevo")}
        >
          <i className="bi bi-plus-circle-fill fs-5"></i>
          Nuevo Activo
        </button>
      </div>

      {/* --- Errores --- */}
      {errorMsg && (
        <div className="alert alert-danger d-flex align-items-center shadow-sm" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-3 fs-4"></i>
          <div>{errorMsg}</div>
        </div>
      )}

      {/* --- Tabla --- */}
      {loading ? (
        <div className="d-flex flex-column align-items-center justify-content-center py-5 text-secondary">
          <div className="spinner-border text-primary mb-3" role="status" style={{width: '3rem', height: '3rem'}}></div>
          <span>Cargando inventario...</span>
        </div>
      ) : (
        <ActivosTable
          activos={activos}
          onEliminar={handleEliminar}
          onEditar={handleEditar}
        />
      )}
    </div>
  );
}

export default Activos;