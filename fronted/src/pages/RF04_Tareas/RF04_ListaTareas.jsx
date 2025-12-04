import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

function ListaTareas() {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true); // Estado para la carga
  const [errorMsg, setErrorMsg] = useState(""); // Estado para errores
  const navigate = useNavigate();

  useEffect(() => {
    cargarTareas();
  }, []);

  const cargarTareas = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await axios.get("http://localhost:3001/api/tareas");
      setTareas(res.data);
    } catch (error) {
      console.error("Error cargando tareas", error);
      setErrorMsg("No se pudo cargar el historial de tareas.");
    } finally {
      setLoading(false);
    }
  };

  const irARegistrar = () => {
    navigate("/tareas/nueva");
  };

  const handleEditar = (id) => {
    navigate(`/tareas/editar/${id}`);
  };

  const eliminarTarea = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta tarea?")) return;
    try {
      await axios.delete(`http://localhost:3001/api/tareas/${id}`);
      // Actualizamos el estado localmente para que sea rápido
      setTareas((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error eliminando tarea", error);
      alert("No se pudo eliminar la tarea.");
    }
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
            <i className="bi bi-clipboard-check-fill me-2 text-info bg-info bg-opacity-10 p-2 rounded-3"></i>
            Historial de Tareas
          </h2>
          <p className="text-secondary mb-0 mt-1 ms-1 small">
            Registro detallado de intervenciones, insumos y costos.
          </p>
        </div>

        {/* Botón Registrar Tarea */}
        <button 
          className="btn btn-success btn-lg bg-gradient d-flex align-items-center gap-2 shadow fw-semibold px-4"
          onClick={irARegistrar}
        >
          <i className="bi bi-plus-circle-dotted fs-5"></i>
          Registrar Tarea
        </button>
      </div>

      {/* --- MENSAJE DE ERROR --- */}
      {errorMsg && (
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <i className="bi bi-exclamation-circle-fill me-2"></i>
          {errorMsg}
        </div>
      )}

      {/* --- TABLA DE TAREAS --- */}
      {loading ? (
        <div className="d-flex flex-column align-items-center justify-content-center py-5 text-secondary">
          <div className="spinner-border text-info mb-3" role="status" style={{width: '3rem', height: '3rem'}}></div>
          <span>Cargando historial...</span>
        </div>
      ) : (
        <div className="table-responsive rounded-4 shadow-sm bg-dark bg-gradient p-2 border border-secondary border-opacity-25">
          <table className="table table-dark table-striped table-hover table-borderless align-middle mb-0">
            <thead className="bg-secondary bg-opacity-10 text-uppercase small">
              <tr>
                <th className="py-3 ps-3">#</th>
                <th className="py-3">OT Relacionada</th>
                <th className="py-3" style={{width: '30%'}}>Descripción</th>
                <th className="py-3">Insumos</th>
                <th className="py-3 text-center">Horas</th>
                <th className="py-3">Costo ($)</th>
                <th className="py-3">Fecha</th>
                <th className="py-3 text-end pe-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tareas.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center text-secondary py-5">
                    <i className="bi bi-inbox fs-1 d-block mb-3 opacity-50"></i>
                    No hay tareas registradas en el historial.
                  </td>
                </tr>
              ) : (
                tareas.map((tarea) => (
                  <tr key={tarea.id}>
                    <td className="ps-3 fw-bold text-white-50">{tarea.id}</td>

                    <td>
                      <span className="badge bg-warning bg-opacity-10 text-warning border border-warning rounded-pill px-3">
                        OT-{tarea.orden_id}
                      </span>
                    </td>

                    <td className="text-truncate" style={{maxWidth: '250px'}} title={tarea.descripcion}>
                        {tarea.descripcion}
                    </td>
                    
                    <td className="text-truncate" style={{maxWidth: '150px'}} title={tarea.insumos}>
                        {tarea.insumos || <span className="text-secondary fst-italic">-</span>}
                    </td>
                    
                    <td className="text-center">
                        <span className="badge bg-secondary bg-opacity-25 text-light">
                            {tarea.horas} h
                        </span>
                    </td>

                    <td className="font-monospace text-success fw-bold">
                      ${Number(tarea.costo).toLocaleString('es-CL')}
                    </td>

                    <td>
                        <i className="bi bi-calendar3 me-2 text-secondary"></i>
                        {tarea.fecha_registro ? new Date(tarea.fecha_registro).toLocaleDateString() : ''}
                    </td>

                    <td className="text-end pe-3">
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className="btn btn-sm btn-warning bg-gradient d-flex align-items-center justify-content-center shadow-sm"
                          style={{ width: '32px', height: '32px' }}
                          onClick={() => handleEditar(tarea.id)}
                          title="Editar tarea"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>

                        <button
                          className="btn btn-sm btn-danger bg-gradient d-flex align-items-center justify-content-center shadow-sm"
                          style={{ width: '32px', height: '32px' }}
                          onClick={() => eliminarTarea(tarea.id)}
                          title="Eliminar tarea"
                        >
                          <i className="bi bi-trash-fill"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ListaTareas;