import React from "react";
import { useNavigate } from "react-router-dom";

function OTTable({ ots, onEliminar }) {
  const navigate = useNavigate();

  const handleEditar = (ot) => {
    navigate(`/ordenes_trabajo/editar/${ot.id}`);
  };

  return (
    <table className="table table-dark table-hover mb-0">
      <thead>
        <tr>
          <th>ID</th>
          <th>Activo ID</th>
          <th>Tipo</th>
          <th>Descripción</th>
          <th>Fecha Programada</th>
          <th>Trabajador Asignado</th>
          <th>Estado</th>
          <th>Costo</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {ots.map((ot) => (
          <tr key={ot.id}>
            <td>{ot.id}</td>
            <td>{ot.activo_id}</td>
            <td>{ot.tipo}</td>
            <td>{ot.descripcion}</td>
            <td>{new Date(ot.fecha_programada).toLocaleDateString()}</td>
            <td>{ot.trabajador_asignado}</td>
            <td>{ot.estado}</td>
            <td>{ot.costo}</td>
            <td>
              <button
                className="btn btn-primary btn-sm me-2"
                onClick={() => handleEditar(ot)}
              >
                Editar
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => onEliminar(ot.id)}
              >
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default OTTable;
