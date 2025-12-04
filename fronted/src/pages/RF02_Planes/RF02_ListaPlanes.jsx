import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ListaPlanes() {
  const [planes, setPlanes] = useState([]);
  const [activos, setActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        const [resPlanes, resActivos] = await Promise.all([
          axios.get("http://localhost:3001/api/planes"),
          axios.get("http://localhost:3001/api/activos")
        ]);
        setPlanes(resPlanes.data);
        setActivos(resActivos.data);
      } catch (err) {
        console.error("Error cargando datos", err);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  const eliminar = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este plan?")) return;
    try {
      await axios.delete(`http://localhost:3001/api/planes/${id}`);
      setPlanes(planes.filter(p => p.id !== id));
    } catch (err) {
      console.error("Error eliminando plan", err);
      alert("No se pudo eliminar el plan.");
    }
  };

  const formatoFrecuencia = (plan) => {
    const partes = [];
    if (plan.fecha) partes.push(new Date(plan.fecha).toLocaleDateString());
    if (plan.km_programado) partes.push(`${plan.km_programado} km`);
    if (plan.horas_programado) partes.push(`${plan.horas_programado} hrs`);
    return partes.join(" / ") || <span className="text-secondary fst-italic">No definido</span>;
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

      {/* --- ENCABEZADO --- */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="text-white fw-bold mb-0 d-flex align-items-center">
            <i className="bi bi-calendar-week-fill me-2 text-warning bg-warning bg-opacity-10 p-2 rounded-3"></i>
            Planes de Mantenimiento
          </h2>
          <p className="text-secondary mb-0 mt-1 ms-1 small">
            Programe y gestione los mantenimientos preventivos y correctivos.
          </p>
        </div>

        <button 
          className="btn btn-success btn-lg bg-gradient d-flex align-items-center gap-2 shadow fw-semibold px-4"
          onClick={() => navigate("/planes/nuevo")}
        >
          <i className="bi bi-plus-circle-fill fs-5"></i>
          Nuevo Plan
        </button>
      </div>

      {/* --- TABLA --- */}
      {loading ? (
        <div className="text-center py-5 text-secondary">
          <div className="spinner-border text-warning mb-3" role="status"></div>
          <p>Cargando planes...</p>
        </div>
      ) : (
        <div className="table-responsive rounded-4 shadow-sm bg-dark bg-gradient p-2 border border-secondary border-opacity-25">
          <table className="table table-dark table-striped table-hover table-borderless align-middle mb-0">
            <thead className="bg-secondary bg-opacity-10 text-uppercase small">
              <tr>
                <th className="py-3 ps-3">#</th>
                <th className="py-3">Activo</th>
                <th className="py-3">Tipo</th>
                <th className="py-3">Frecuencia / Meta</th>
                <th className="py-3" style={{width: '25%'}}>Descripción</th>
                <th className="py-3">Estado</th>
                <th className="py-3 text-end pe-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {planes.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-secondary py-5">
                    No hay planes registrados aún.
                  </td>
                </tr>
              ) : (
                planes.map((plan) => {
                  const activo = activos.find(a => a.id === plan.activo_id);
                  return (
                    <tr key={plan.id}>
                      <td className="ps-3 fw-bold text-white-50">{plan.id}</td>
                      <td>
                        {activo ? (
                          <div>
                            <span className="d-block fw-semibold text-white">{activo.marca} {activo.modelo}</span>
                            <span className="badge bg-secondary bg-opacity-25 text-light border border-secondary rounded-pill small">
                              {activo.codigo}
                            </span>
                          </div>
                        ) : (
                           <span className="text-danger">Activo ID: {plan.activo_id} (No encontrado)</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge rounded-pill ${plan.tipo === 'Preventivo' ? 'bg-info text-dark' : 'bg-warning text-dark'}`}>
                          {plan.tipo}
                        </span>
                      </td>
                      <td className="small">{formatoFrecuencia(plan)}</td>
                      <td className="text-truncate" style={{maxWidth: '200px'}} title={plan.descripcion}>
                        {plan.descripcion}
                      </td>
                      <td>
                        <span className={`badge ${plan.estado === 'completado' ? 'bg-success' : 'bg-secondary'} bg-opacity-75`}>
                          {plan.estado || "pendiente"}
                        </span>
                      </td>
                      <td className="text-end pe-3">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="btn btn-sm btn-warning bg-gradient d-flex align-items-center justify-content-center shadow-sm"
                            style={{ width: '32px', height: '32px' }}
                            onClick={() => navigate(`/planes/editar/${plan.id}`)}
                            title="Editar Plan"
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-danger bg-gradient d-flex align-items-center justify-content-center shadow-sm"
                            style={{ width: '32px', height: '32px' }}
                            onClick={() => eliminar(plan.id)}
                            title="Eliminar Plan"
                          >
                            <i className="bi bi-trash-fill"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ListaPlanes;