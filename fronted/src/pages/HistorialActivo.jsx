// frontend/src/pages/HistorialActivo.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function HistorialActivo() {
  const { id } = useParams(); // id del activo
  const navigate = useNavigate();

  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // filtros
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [tipo, setTipo] = useState("");
  const [costoMin, setCostoMin] = useState("");
  const [costoMax, setCostoMax] = useState("");

  const cargarHistorial = async () => {
    try {
      setCargando(true);
      setError(null);

      const params = new URLSearchParams();
      if (desde) params.append("desde", desde);
      if (hasta) params.append("hasta", hasta);
      if (tipo) params.append("tipo", tipo);
      if (costoMin) params.append("costoMin", costoMin);
      if (costoMax) params.append("costoMax", costoMax);

      const qs = params.toString();
      const url = qs
        ? `/api/activos/${id}/historial?${qs}`
        : `/api/activos/${id}/historial`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Error al cargar historial");

      const data = await res.json();
      setRegistros(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container mt-3">
      <button
        className="btn btn-outline-light mb-3"
        onClick={() => navigate(-1)}
      >
        ← Volver
      </button>

      <h2>Historial de mantenimiento – Activo #{id}</h2>

      {/* Filtros */}
      <div className="card bg-dark border-secondary mt-3 mb-3">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-3">
              <label className="form-label">Desde</label>
              <input
                type="date"
                className="form-control"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Hasta</label>
              <input
                type="date"
                className="form-control"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Tipo de OT</label>
              <select
                className="form-select"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="preventiva">Preventiva</option>
                <option value="correctiva">Correctiva</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Costo mínimo</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={costoMin}
                onChange={(e) => setCostoMin(e.target.value)}
              />
            </div>
          </div>

          <div className="row g-2 mt-2">
            <div className="col-md-3">
              <label className="form-label">Costo máximo</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={costoMax}
                onChange={(e) => setCostoMax(e.target.value)}
              />
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <button
                className="btn btn-primary me-2"
                type="button"
                onClick={cargarHistorial}
              >
                Aplicar filtros
              </button>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => {
                  setDesde("");
                  setHasta("");
                  setTipo("");
                  setCostoMin("");
                  setCostoMax("");
                  cargarHistorial();
                }}
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {cargando ? (
        <p className="text-muted">Cargando historial...</p>
      ) : registros.length === 0 ? (
        <p className="text-muted">No hay registros de mantenimiento.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-dark table-hover table-sm align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>OT</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Fecha</th>
                <th>Costo</th>
                <th>Registrado</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.ot_id}</td>
                  <td>{r.tipo}</td>
                  <td>{r.descripcion}</td>
                  <td>{r.fecha}</td>
                  <td>{r.costo != null ? `$${r.costo}` : "-"}</td>
                  <td>{new Date(r.creado_en).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default HistorialActivo;
