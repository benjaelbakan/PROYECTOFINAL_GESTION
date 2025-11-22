import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const formatearFecha = (fecha) => {
  if (!fecha) return "-";
  return new Date(fecha).toISOString().slice(0, 10);
};

function DetalleOT() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ot, setOt] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError(null);

      const [resOt, resHist] = await Promise.all([
        fetch(`/api/ot/${id}`),
        fetch(`/api/ot/${id}/historial`),
      ]);

      if (!resOt.ok) throw new Error("Error al obtener detalle de OT");

      const dataOt = await resOt.json();
      const dataHist = resHist.ok ? await resHist.json() : [];

      setOt(dataOt);
      setHistorial(dataHist);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [id]);

  if (cargando) return <p className="mt-3 text-muted">Cargando OT...</p>;
  if (error) return <div className="alert alert-danger mt-3">{error}</div>;
  if (!ot) return <p className="mt-3 text-muted">OT no encontrada.</p>;

  return (
    <div className="mt-3">
      <button
        className="btn btn-sm btn-outline-light mb-3"
        onClick={() => navigate(-1)}
      >
        ← Volver
      </button>

      <h2>Detalle OT #{ot.id}</h2>

      <div className="card bg-dark border-secondary mt-3 mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p><strong>Activo ID:</strong> {ot.activo_id}</p>
              <p><strong>Tipo:</strong> {ot.tipo}</p>
              <p><strong>Estado:</strong> {ot.estado}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Fecha programada:</strong> {formatearFecha(ot.fecha_programada)}</p>
              <p><strong>Trabajador asignado:</strong> {ot.trabajador_asignado || "Sin asignar"}</p>
            </div>
          </div>
          <p className="mt-3">
            <strong>Descripción:</strong><br />
            {ot.descripcion}
          </p>
        </div>
      </div>

      <h4>Trazabilidad / Historial</h4>
      {historial.length === 0 ? (
        <p className="text-muted">Sin eventos de historial.</p>
      ) : (
        <div className="table-responsive mt-2">
          <table className="table table-dark table-sm table-hover align-middle">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Trabajador</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((h) => (
                <tr key={h.id}>
                  <td>{new Date(h.fecha).toLocaleString("es-CL")}</td>
                  <td>{h.descripcion_cambio}</td>
                  <td>{h.estado || "-"}</td>
                  <td>{h.trabajador_asignado || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DetalleOT;
