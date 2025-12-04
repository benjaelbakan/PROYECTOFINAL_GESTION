import React from 'react';

function ActivosTable({ activos, onEliminar, onEditar }) {
  return (
    // Contenedor con bordes redondeados, fondo oscuro y sombra suave
    <div className="table-responsive rounded-4 shadow-sm bg-dark bg-gradient p-2 border border-secondary border-opacity-25">
      <table className="table table-dark table-striped table-hover table-borderless align-middle mb-0">
        {/* Encabezado con un fondo ligeramente diferente y texto en mayúsculas pequeño */}
        <thead className="bg-secondary bg-opacity-10 text-uppercase small">
          <tr>
            <th className="py-3 ps-3">ID</th>
            <th className="py-3">Código</th>
            <th className="py-3">Tipo</th>
            <th className="py-3">Marca</th>
            <th className="py-3">Modelo</th>
            <th className="py-3">Año</th>
            <th className="py-3">Ubicación</th>
            <th className="py-3 text-end pe-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {activos.map((activo) => (
            <tr key={activo.id}>
              <td className="ps-3 fw-bold text-white-50">#{activo.id}</td>
              <td>
                <span className="badge bg-primary bg-opacity-25 text-primary-emphasis border border-primary-subtle rounded-pill">
                  {activo.codigo}
                </span>
              </td>
              <td>{activo.tipo}</td>
              <td>{activo.marca}</td>
              <td>{activo.modelo}</td>
              <td>{activo.anio}</td>
              <td>
                <i className="bi bi-geo-alt-fill me-1 text-secondary"></i>
                {activo.ubicacion}
              </td>
              <td className="text-end pe-3">
                <div className="d-flex justify-content-end gap-2">
                  {/* Botón Editar con Ícono (Amarillo) */}
                  <button
                    className="btn btn-sm btn-warning bg-gradient d-flex align-items-center justify-content-center text-dark shadow-sm"
                    style={{ width: '32px', height: '32px' }}
                    onClick={() => onEditar(activo)}
                    title="Editar activo"
                  >
                    <i className="bi bi-pencil-square"></i>
                  </button>
                  {/* Botón Eliminar con Ícono (Rojo) */}
                  <button
                    className="btn btn-sm btn-danger bg-gradient d-flex align-items-center justify-content-center shadow-sm"
                    style={{ width: '32px', height: '32px' }}
                    onClick={() => onEliminar(activo.id)}
                    title="Eliminar activo"
                  >
                    <i className="bi bi-trash-fill"></i>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ActivosTable;