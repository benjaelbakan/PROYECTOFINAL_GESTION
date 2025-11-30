function ActivosTable({ activos, onEliminar, onEditar }) {
  return (
    <table className="table table-dark table-hover mb-0">
      <thead>
        <tr>
          <th>ID</th>
          <th>Código</th>
          <th>Tipo</th>
          <th>Marca</th>
          <th>Modelo</th>
          <th>Año</th>
          <th>Kilometraje</th>
          <th>Horas de uso</th>
          <th>Ubicación</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {activos.map((activo) => (
          <tr key={activo.id}>
            <td>{activo.id}</td>
            <td>{activo.codigo}</td>
            <td>{activo.tipo}</td>
            <td>{activo.marca}</td>
            <td>{activo.modelo}</td>
            <td>{activo.anio}</td>
            <td>{activo.kilometraje_actual}</td>
            <td>{activo.horas_uso_actual}</td>
            <td>{activo.ubicacion}</td>
            <td>
              <button
                className="btn btn-primary btn-sm me-2"
                onClick={() => onEditar(activo)}
              >
                Editar
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => onEliminar(activo.id)}
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

export default ActivosTable;
