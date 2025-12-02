import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ListaPlanes() {
  const [planes, setPlanes] = useState([]);
  const [activos, setActivos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    cargarPlanes();
    cargarActivos();
  }, []);

  const cargarPlanes = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/planes");
      setPlanes(res.data);
    } catch (err) {
      console.error("Error cargando planes", err);
    }
  };

  const cargarActivos = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/activos");
      setActivos(res.data);
    } catch (err) {
      console.error("Error cargando activos", err);
    }
  };

  const eliminar = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este plan?")) return;
    try {
      await axios.delete(`http://localhost:3001/api/planes/${id}`);
      cargarPlanes();
    } catch (err) {
      console.error("Error eliminando plan", err);
    }
  };

  const formatoFrecuencia = (plan) => {
    const partes = [];
    if (plan.fecha) partes.push(plan.fecha);
    if (plan.km_programado) partes.push(`Km: ${plan.km_programado}`);
    if (plan.horas_programado) partes.push(`Horas: ${plan.horas_programado}`);
    return partes.join(" / ") || "-";
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="text-white">🛠️ Planes de Mantenimiento</h3>
        <button 
          className="btn btn-success fw-bold" 
          onClick={() => navigate("/planes/nuevo")}
        >
          ➕ Nuevo Plan
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-dark table-striped table-hover border-secondary">
          <thead className="table-primary text-dark">
            <tr>
              <th>#</th>
              <th>Activo</th>
              <th>Tipo</th>
              <th>Fecha / Km / Horas</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {planes.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center text-secondary py-4">
                  No hay planes registrados aún.
                </td>
              </tr>
            ) : (
              planes.map((plan) => {
                const activo = activos.find(a => a.id === plan.activo_id);
                return (
                  <tr key={plan.id}>
                    <td>{plan.id}</td>
                    <td>
                      {activo ? `${activo.codigo} - ${activo.marca} ${activo.modelo}` : plan.activo_id}
                    </td>
                    <td>{plan.tipo}</td>
                    <td>{formatoFrecuencia(plan)}</td>
                    <td>{plan.descripcion}</td>
                    <td>{plan.estado || "pendiente"}</td>
                    <td>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => navigate(`/planes/editar/${plan.id}`)}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => eliminar(plan.id)}
                      >
                        🗑️ Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ListaPlanes;
