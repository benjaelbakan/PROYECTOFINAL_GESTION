import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function ActivosTable({ activos, onEliminar }) {
  const navigate = useNavigate();

  if (activos.length === 0) {
    return <p className="text-muted mb-0">No hay activos registrados.</p>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-dark table-hover table-sm align-middle mb-0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Código</th>
            <th>Tipo</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Ubicación</th>
            <th style={{ width: 190 }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {activos.map((a) => (
            <tr key={a.id}>
              <td>{a.id}</td>
              <td>{a.codigo}</td>
              <td>{a.tipo}</td>
              <td>{a.marca}</td>
              <td>{a.modelo}</td>
              <td>{a.ubicacion}</td>
              <td>
                <button
                  className="btn btn-outline-light btn-sm me-2"
                  onClick={() => navigate(`/activos/${a.id}/editar`)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => onEliminar(a.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
