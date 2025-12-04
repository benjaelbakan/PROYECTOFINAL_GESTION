import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarOTs, eliminarOT } from "../../services/RF03_OT.service.js";
import OTTable from "../../components/RF03_OTTable.jsx";

export default function OTs() {
  const [ots, setOTs] = useState([]);
  const [loading, setLoading] = useState(true); // Estado de carga añadido
  const navigate = useNavigate();

  useEffect(() => {
    const cargarOTs = async () => {
      setLoading(true);
      try {
        const data = await listarOTs();
        setOTs(data);
      } catch (err) {
        console.error("Error al cargar OTs:", err);
      } finally {
        setLoading(false);
      }
    };
    cargarOTs();
  }, []);

  const handleEliminar = async (id) => {
    if (!confirm("¿Desea eliminar esta OT?")) return;
    try {
      await eliminarOT(id);
      setOTs(ots.filter((ot) => ot.id !== id));
    } catch (err) {
      console.error("Error al eliminar OT:", err);
      alert("No se pudo eliminar la orden de trabajo.");
    }
  };

  const handleNuevaOT = () => {
    navigate("/ordenes_trabajo/nuevo");
  };

  return (
    <div className="container-fluid p-4">
      
      {/* --- BOTÓN VOLVER --- */}
      <div className="mb-3">
        <button 
            className="btn btn-outline-secondary d-inline-flex align-items-center gap-2 text-white-50 hover-white"
            onClick={() => navigate('/home')}
        >
            <i className="bi bi-arrow-left"></i>
            Volver al Inicio
        </button>
      </div>

      {/* --- ENCABEZADO MODERNO --- */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="text-white fw-bold mb-0 d-flex align-items-center">
            <i className="bi bi-tools me-2 text-warning bg-warning bg-opacity-10 p-2 rounded-3"></i>
            Órdenes de Trabajo
          </h2>
          <p className="text-secondary mb-0 mt-1 ms-1 small">
            Gestión y seguimiento de tareas de mantenimiento preventivo y correctivo.
          </p>
        </div>

        {/* Botón Nueva OT */}
        <button 
            className="btn btn-success btn-lg bg-gradient d-flex align-items-center gap-2 shadow fw-semibold px-4"
            onClick={handleNuevaOT}
        >
          <i className="bi bi-file-earmark-plus-fill fs-5"></i>
          Nueva Orden de Trabajo
        </button>
      </div>

      {/* --- CONTENIDO --- */}
      {loading ? (
        <div className="d-flex flex-column align-items-center justify-content-center py-5 text-secondary">
          <div className="spinner-border text-warning mb-3" role="status" style={{width: '3rem', height: '3rem'}}></div>
          <span>Cargando órdenes...</span>
        </div>
      ) : (
        <OTTable ots={ots} onEliminar={handleEliminar} />
      )}
    </div>
  );
}