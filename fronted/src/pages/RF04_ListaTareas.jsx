import { useState, useEffect } from 'react';
import axios from 'axios';

function ListaTareas() {
  const [tareas, setTareas] = useState([]);

  // Cargar las tareas apenas entramos a la página
  useEffect(() => {
    cargarTareas();
  }, []);

  const cargarTareas = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/tareas');
      setTareas(res.data);
    } catch (error) {
      console.error("Error cargando tareas", error);
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3 text-white">📋 Historial de Tareas Realizadas</h3>
      
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
                <td colSpan="7" className="text-center text-secondary py-4">
                  No hay tareas registradas aún.
                </td>
              </tr>
            ) : (
              tareas.map((tarea) => (
                <tr key={tarea.id}>
                  <td>{tarea.id}</td>
                  <td>
                    <span className="badge bg-warning text-dark">OT-{tarea.orden_id}</span>
                  </td>
                  <td>{tarea.descripcion_tarea}</td>
                  <td>{tarea.insumos_utilizados || '-'}</td>
                  <td>{tarea.horas_trabajadas} h</td>
                  <td className="text-success fw-bold">
                    ${Number(tarea.costo_asociado).toLocaleString('es-CL')}
                  </td>
                  <td>{new Date(tarea.fecha_realizacion).toLocaleDateString()}</td>
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