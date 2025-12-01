import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

function ListaTareas() {
  const [tareas, setTareas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    cargarTareas();
  }, []);

  const cargarTareas = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/tareas");
      setTareas(res.data);
    } catch (error) {
      console.error("Error cargando tareas", error);
    }
  };

  const irARegistrar = () => {
    navigate("/tareas/nueva");
  };

  const handleEditar = (id) => {
    navigate(`/tareas/editar/${id}`);
  };


  const eliminarTarea = async (id) => {
  if (!confirm("¿Seguro que deseas eliminar esta tarea?")) return;
  try {
    await axios.delete(`http://localhost:3001/api/tareas/${id}`);
    cargarTareas(); // recargar lista después de eliminar
  } catch (error) {
    console.error("Error eliminando tarea", error);
  }
};

  return (
    <div className="container mt-4">

      {/* Título + Botón */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="text-white">📋 Historial de Tareas Realizadas</h3>
        <button 
          className="btn btn-success fw-bold"
          onClick={irARegistrar}
        >
          ➕ Registrar Tarea
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-dark table-striped table-hover border-secondary">
          <thead className="table-primary text-dark">
            <tr>
              <th>#</th>
              <th>OT ID</th>
              <th>Descripción</th>
              <th>Insumos</th>
              <th>Horas</th>
              <th>Costo ($)</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {tareas.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center text-secondary py-4">
                  No hay tareas registradas aún.
                </td>
              </tr>
            ) : (
              tareas.map((tarea) => (
                <tr key={tarea.id}>
                  <td>{tarea.id}</td>

                  <td>
                    <span className="badge bg-warning text-dark">
                      OT-{tarea.orden_id}
                    </span>
                  </td>

                  <td>{tarea.descripcion}</td>
                  <td>{tarea.insumos || '-'}</td>
                  <td>{tarea.horas} h</td>

                  <td className="text-success fw-bold">
                    ${Number(tarea.costo).toLocaleString('es-CL')}
                  </td>

                  <td>{tarea.fecha_registro ? new Date(tarea.fecha_registro).toLocaleDateString() : ''}</td>

                  {/*  NUEVOS BOTONES */}
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => handleEditar(tarea.id)}
                    >
                      ✏️ Editar
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => eliminarTarea(tarea.id)}
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ListaTareas;
